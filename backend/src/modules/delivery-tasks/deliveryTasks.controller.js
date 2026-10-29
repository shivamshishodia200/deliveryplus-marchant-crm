import { DeliveryTask } from '../../models/DeliveryTask.js';
import { Merchant } from '../../models/Merchant.js';
import { User } from '../../models/User.js';
import { DriverProfile } from '../../models/DriverProfile.js';
import { AuditLog } from '../../models/AuditLog.js';

// Status lists for workspace tabs
const ACTIVE_STATUSES = ['Unassigned', 'Assigning', 'Assigned', 'Processed', 'Loaded', 'Transit', 'Arrived'];
const TERMINAL_STATUSES = ['Completed', 'Failed', 'Cancelled'];

// Allowed state transitions
const ALLOWED_TRANSITIONS = {
  Unassigned: ['Assigning', 'Assigned', 'Cancelled'],
  Assigning: ['Assigned', 'Unassigned', 'Cancelled'],
  Assigned: ['Unassigned', 'Processed', 'Loaded', 'Transit', 'Cancelled'],
  Processed: ['Loaded', 'Transit', 'Assigned', 'Cancelled'],
  Loaded: ['Transit', 'Assigned', 'Failed'],
  Transit: ['Arrived', 'Completed', 'Failed'],
  Arrived: ['Completed', 'Failed'],
  Failed: ['Unassigned', 'Cancelled'],
  Completed: [],
  Cancelled: []
};

export const deliveryTasksController = {
  /**
   * List delivery tasks with tab, date, merchant, driver, and search filters
   */
  async getAll(req, res, next) {
    try {
      const {
        tab = 'Active',
        search = '',
        status = '',
        merchantId = '',
        driverId = '',
        team = '',
        startDate = '',
        endDate = '',
        page = 1,
        limit = 25,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const query = { isArchived: false };

      // Tab filtering
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (tab === 'Active') {
        query.status = { $in: ACTIVE_STATUSES };
      } else if (tab === 'Completed') {
        query.status = 'Completed';
      } else if (tab === 'Failed') {
        query.status = 'Failed';
      } else if (tab === 'Cancelled') {
        query.status = 'Cancelled';
      } else if (tab === 'New') {
        query.createdAt = { $gte: startOfToday };
      }

      // Explicit status override
      if (status && status !== 'all') {
        query.status = status;
      }

      // Merchant scope
      if (merchantId && merchantId !== 'all') {
        query.merchant = merchantId;
      }

      // Driver scope
      if (driverId && driverId !== 'all') {
        query.assignedDriver = driverId;
      }

      // Team scope
      if (team && team !== 'all') {
        query.assignedTeam = team;
      }

      // Date range filtering (on completeBefore deadline)
      if (startDate || endDate) {
        query.completeBefore = {};
        if (startDate) query.completeBefore.$gte = new Date(startDate);
        if (endDate) query.completeBefore.$lte = new Date(endDate);
      }

      // Text search
      if (search) {
        const regex = new RegExp(search, 'i');
        query.$or = [
          { taskNumber: regex },
          { externalReferenceId: regex },
          { merchantName: regex },
          { driverName: regex },
          { 'destination.recipientName': regex },
          { 'destination.address': regex },
          { 'destination.phone': regex }
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);
      const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

      const [tasks, total, tabCounts] = await Promise.all([
        DeliveryTask.find(query).sort(sort).skip(skip).limit(Number(limit)).lean(),
        DeliveryTask.countDocuments(query),
        DeliveryTask.aggregate([
          { $match: { isArchived: false } },
          {
            $group: {
              _id: null,
              activeCount: {
                $sum: { $cond: [{ $in: ['$status', ACTIVE_STATUSES] }, 1, 0] }
              },
              completedCount: {
                $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
              },
              failedCount: {
                $sum: { $cond: [{ $eq: ['$status', 'Failed'] }, 1, 0] }
              },
              cancelledCount: {
                $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] }
              },
              newCount: {
                $sum: { $cond: [{ $gte: ['$createdAt', startOfToday] }, 1, 0] }
              },
              totalCount: { $sum: 1 }
            }
          }
        ])
      ]);

      const counts = tabCounts[0] || {
        activeCount: 0,
        completedCount: 0,
        failedCount: 0,
        cancelledCount: 0,
        newCount: 0,
        totalCount: 0
      };

      res.status(200).json({
        success: true,
        data: tasks,
        tabCounts: counts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get single task by ID
   */
  async getById(req, res, next) {
    try {
      const task = await DeliveryTask.findById(req.params.id)
        .populate('merchant', 'merchantName merchantCode storeDetails loginEmail')
        .populate('assignedDriver', 'name email phone avatar');

      if (!task) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Delivery task not found.' }
        });
      }

      res.status(200).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create new delivery task
   */
  async create(req, res, next) {
    try {
      const {
        merchantId,
        taskType = 'Delivery',
        priority = 'Medium',
        service = 'Standard Delivery',
        externalReferenceId = '',
        taskNotes = '',
        pickupLocation = {},
        destination = {},
        completeBefore,
        completeAfter = null,
        assignedTeam = 'All Teams',
        assignedDriver = null,
        completionRequirements = { photo: true, signature: true, notes: false },
        shippingFee = 0,
        serviceDurationMinutes = 30,
        configurableFields = {},
        items = [],
        attachments = []
      } = req.body;

      // Validation
      if (!destination.recipientName || !destination.phone || !destination.address) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Recipient name, phone, and destination address are required.' }
        });
      }

      if (!completeBefore) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Complete Before deadline date is required.' }
        });
      }

      // Resolve merchant
      let merchant = null;
      if (merchantId) {
        merchant = await Merchant.findById(merchantId);
      }
      if (!merchant) {
        merchant = await Merchant.findOne({ status: 'Active' });
      }

      const merchantName = merchant ? merchant.merchantName : 'Delivery Plus';
      const resolvedMerchantId = merchant ? merchant._id : null;

      // Resolve driver name if assigned
      let driverName = null;
      let initialStatus = 'Unassigned';
      if (assignedDriver) {
        const driverUser = await User.findById(assignedDriver);
        if (driverUser) {
          driverName = driverUser.name;
          initialStatus = 'Assigned';
        }
      }

      // Generate task number: TSK-XXXX
      const count = await DeliveryTask.countDocuments();
      const taskNumber = `TSK-${1000 + count + 1}`;

      const newTask = await DeliveryTask.create({
        taskNumber,
        externalReferenceId,
        merchant: resolvedMerchantId,
        merchantName,
        taskType,
        priority,
        service,
        taskNotes,
        pickupLocation,
        destination,
        completeBefore: new Date(completeBefore),
        completeAfter: completeAfter ? new Date(completeAfter) : null,
        assignedTeam,
        assignedDriver: assignedDriver || null,
        driverName,
        completionRequirements,
        shippingFee: Number(shippingFee) || 0,
        serviceDurationMinutes: Number(serviceDurationMinutes) || 30,
        configurableFields,
        items,
        attachments,
        status: initialStatus,
        history: [
          {
            status: initialStatus,
            action: 'Created',
            updatedBy: req.user?._id,
            updatedByName: req.user?.name || 'Dispatcher',
            timestamp: new Date(),
            note: 'Task initially created in system'
          }
        ]
      });

      // Update driver workload count if assigned
      if (assignedDriver) {
        await DriverProfile.updateOne(
          { user: assignedDriver },
          { $inc: { activeTasksCount: 1 } }
        );
      }

      // Audit log
      if (req.user?._id) {
        await AuditLog.create({
          actor: req.user._id,
          action: 'DELIVERY_TASK_CREATED',
          entityType: 'DeliveryTask',
          entityId: newTask._id,
          details: { taskNumber, status: initialStatus, destination: destination.address }
        });
      }

      res.status(201).json({ success: true, data: newTask });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update delivery task with optimistic concurrency locking
   */
  async update(req, res, next) {
    try {
      const task = await DeliveryTask.findById(req.params.id);
      if (!task) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Task not found.' }
        });
      }

      // Optimistic concurrency check
      if (req.body.version && req.body.version !== task.version) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'CONCURRENCY_CONFLICT',
            message: 'This task has been updated by another user. Please refresh to load the latest data.'
          }
        });
      }

      const previousDriver = task.assignedDriver;
      const newDriver = req.body.assignedDriver;

      // Handle driver reassignment
      if (newDriver && newDriver.toString() !== (previousDriver ? previousDriver.toString() : '')) {
        const driverUser = await User.findById(newDriver);
        if (driverUser) {
          req.body.driverName = driverUser.name;
          if (task.status === 'Unassigned') {
            req.body.status = 'Assigned';
          }
          await DriverProfile.updateOne({ user: newDriver }, { $inc: { activeTasksCount: 1 } });
          if (previousDriver) {
            await DriverProfile.updateOne({ user: previousDriver }, { $inc: { activeTasksCount: -1 } });
          }
        }
      }

      // Append to history
      const historyEntry = {
        status: req.body.status || task.status,
        action: 'Updated',
        updatedBy: req.user?._id,
        updatedByName: req.user?.name || 'Dispatcher',
        timestamp: new Date(),
        note: req.body.updateNote || 'Details updated'
      };

      req.body.$push = { history: historyEntry };
      req.body.version = task.version + 1;

      const updated = await DeliveryTask.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });

      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Transition task status following authoritative state machine
   */
  async updateStatus(req, res, next) {
    try {
      const { status: nextStatus, failureReason = '', completionProof = {}, note = '' } = req.body;
      const task = await DeliveryTask.findById(req.params.id);

      if (!task) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Task not found.' }
        });
      }

      const allowedNext = ALLOWED_TRANSITIONS[task.status] || [];
      if (!allowedNext.includes(nextStatus)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_TRANSITION',
            message: `Cannot transition task from '${task.status}' to '${nextStatus}'. Allowed: ${allowedNext.join(', ') || 'none (terminal)'}`
          }
        });
      }

      // Check required completion proof
      if (nextStatus === 'Completed') {
        task.completedAt = new Date();
        if (completionProof) {
          task.completionProof = {
            ...completionProof,
            timestamp: new Date()
          };
        }
      }

      // Check failure reason
      if (nextStatus === 'Failed') {
        if (!failureReason) {
          return res.status(400).json({
            success: false,
            error: { code: 'VALIDATION_ERROR', message: 'A failure reason is required when marking a task as Failed.' }
          });
        }
        task.failureReason = failureReason;
      }

      // Reconcile driver active count if entering terminal status
      if (TERMINAL_STATUSES.includes(nextStatus) && task.assignedDriver) {
        await DriverProfile.updateOne({ user: task.assignedDriver }, { $inc: { activeTasksCount: -1 } });
      }

      task.status = nextStatus;
      task.version += 1;
      task.history.push({
        status: nextStatus,
        action: `Status changed to ${nextStatus}`,
        updatedBy: req.user?._id,
        updatedByName: req.user?.name || 'Dispatcher',
        timestamp: new Date(),
        note: note || failureReason || `Status updated to ${nextStatus}`
      });

      await task.save();

      res.status(200).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Assign driver to delivery task
   */
  async assignDriver(req, res, next) {
    try {
      const { driverId, team = 'Drivers' } = req.body;
      const task = await DeliveryTask.findById(req.params.id);

      if (!task) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Task not found.' }
        });
      }

      const driverUser = await User.findById(driverId);
      if (!driverUser) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Selected driver not found.' }
        });
      }

      const previousDriver = task.assignedDriver;

      task.assignedDriver = driverUser._id;
      task.driverName = driverUser.name;
      task.assignedTeam = team;
      if (task.status === 'Unassigned') {
        task.status = 'Assigned';
      }
      task.version += 1;

      task.history.push({
        status: task.status,
        action: 'Driver Assigned',
        updatedBy: req.user?._id,
        updatedByName: req.user?.name || 'Dispatcher',
        timestamp: new Date(),
        note: `Assigned to driver ${driverUser.name}`
      });

      await task.save();

      // Update driver workload
      await DriverProfile.updateOne({ user: driverUser._id }, { $inc: { activeTasksCount: 1 } });
      if (previousDriver && previousDriver.toString() !== driverUser._id.toString()) {
        await DriverProfile.updateOne({ user: previousDriver }, { $inc: { activeTasksCount: -1 } });
      }

      res.status(200).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Operations Dashboard aggregated metrics
   */
  async getDashboardMetrics(req, res, next) {
    try {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      const [
        overviewMetrics,
        statusBreakdown,
        dailyHistory,
        merchantDistribution,
        failedTasks,
        activeTeamMembers
      ] = await Promise.all([
        // Overview KPIs
        DeliveryTask.aggregate([
          { $match: { isArchived: false } },
          {
            $group: {
              _id: null,
              activeTasks: {
                $sum: { $cond: [{ $in: ['$status', ACTIVE_STATUSES] }, 1, 0] }
              },
              completedToday: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ['$status', 'Completed'] },
                        { $gte: ['$completedAt', startOfToday] }
                      ]
                    },
                    1,
                    0
                  ]
                }
              },
              newTasksToday: {
                $sum: { $cond: [{ $gte: ['$createdAt', startOfToday] }, 1, 0] }
              },
              dueToday: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $in: ['$status', ACTIVE_STATUSES] },
                        { $gte: ['$completeBefore', startOfToday] },
                        { $lte: ['$completeBefore', endOfToday] }
                      ]
                    },
                    1,
                    0
                  ]
                }
              }
            }
          }
        ]),

        // Status breakdown
        DeliveryTask.aggregate([
          { $match: { isArchived: false } },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),

        // Daily history for past 14 days
        DeliveryTask.aggregate([
          {
            $match: {
              isArchived: false,
              createdAt: { $gte: fourteenDaysAgo }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
              },
              created: { $sum: 1 },
              completed: {
                $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
              }
            }
          },
          { $sort: { _id: 1 } }
        ]),

        // Active tasks by merchant
        DeliveryTask.aggregate([
          { $match: { isArchived: false, status: { $in: ACTIVE_STATUSES } } },
          { $group: { _id: '$merchantName', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 8 }
        ]),

        // Recent failed tasks
        DeliveryTask.find({ isArchived: false, status: 'Failed' })
          .sort({ updatedAt: -1 })
          .limit(5)
          .select('taskNumber destination failureReason driverName completeBefore')
          .lean(),

        // Active team members / drivers
        DriverProfile.find({})
          .populate('user', 'name email avatar')
          .sort({ activeTasksCount: -1 })
          .limit(10)
          .lean()
      ]);

      const overview = overviewMetrics[0] || {
        activeTasks: 0,
        completedToday: 0,
        newTasksToday: 0,
        dueToday: 0
      };

      const byStatusMap = {};
      statusBreakdown.forEach((s) => {
        byStatusMap[s._id] = s.count;
      });

      res.status(200).json({
        success: true,
        data: {
          overview,
          byStatus: byStatusMap,
          dailyHistory,
          merchantDistribution,
          recentFailedTasks: failedTasks,
          activeTeamMembers
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Bulk action (assign, update status, cancel)
   */
  async bulkActions(req, res, next) {
    try {
      const { taskIds, action, driverId, status: newStatus } = req.body;

      if (!Array.isArray(taskIds) || taskIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'taskIds array is required.' }
        });
      }

      let modifiedCount = 0;

      if (action === 'assign' && driverId) {
        const driver = await User.findById(driverId);
        if (driver) {
          const result = await DeliveryTask.updateMany(
            { _id: { $in: taskIds }, status: 'Unassigned' },
            {
              $set: {
                assignedDriver: driver._id,
                driverName: driver.name,
                status: 'Assigned'
              },
              $inc: { version: 1 }
            }
          );
          modifiedCount = result.modifiedCount;
          await DriverProfile.updateOne(
            { user: driver._id },
            { $inc: { activeTasksCount: modifiedCount } }
          );
        }
      } else if (action === 'updateStatus' && newStatus) {
        const result = await DeliveryTask.updateMany(
          { _id: { $in: taskIds } },
          { $set: { status: newStatus }, $inc: { version: 1 } }
        );
        modifiedCount = result.modifiedCount;
      } else if (action === 'cancel') {
        const result = await DeliveryTask.updateMany(
          { _id: { $in: taskIds }, status: { $ne: 'Completed' } },
          { $set: { status: 'Cancelled' }, $inc: { version: 1 } }
        );
        modifiedCount = result.modifiedCount;
      }

      res.status(200).json({
        success: true,
        message: `Bulk action '${action}' applied to ${modifiedCount} tasks.`
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Export CSV with formula injection sanitization
   */
  async exportCsv(req, res, next) {
    try {
      const tasks = await DeliveryTask.find({ isArchived: false })
        .sort({ createdAt: -1 })
        .limit(1000)
        .lean();

      // Formula injection sanitizer
      const sanitize = (val) => {
        if (!val) return '';
        const str = String(val).replace(/"/g, '""');
        if (/^[=+@-]$/.test(str.charAt(0))) {
          return `'${str}`;
        }
        return str;
      };

      const headers = [
        'Task #',
        'External Ref',
        'Status',
        'Type',
        'Priority',
        'Merchant',
        'Recipient',
        'Phone',
        'Address',
        'Driver',
        'Complete Before',
        'Shipping Fee',
        'Created At'
      ];

      const rows = tasks.map((t) => [
        `"${sanitize(t.taskNumber)}"`,
        `"${sanitize(t.externalReferenceId)}"`,
        `"${sanitize(t.status)}"`,
        `"${sanitize(t.taskType)}"`,
        `"${sanitize(t.priority)}"`,
        `"${sanitize(t.merchantName)}"`,
        `"${sanitize(t.destination?.recipientName)}"`,
        `"${sanitize(t.destination?.phone)}"`,
        `"${sanitize(t.destination?.address)}"`,
        `"${sanitize(t.driverName || 'Unassigned')}"`,
        `"${sanitize(t.completeBefore ? new Date(t.completeBefore).toISOString() : '')}"`,
        `"${sanitize(t.shippingFee)}"`,
        `"${sanitize(new Date(t.createdAt).toISOString())}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="deliveryplus_tasks_export.csv"');
      res.status(200).send(csvContent);
    } catch (error) {
      next(error);
    }
  }
};
