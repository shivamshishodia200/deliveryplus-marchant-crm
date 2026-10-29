import { Merchant } from '../../models/Merchant.js';
import { DeliveryTask } from '../../models/DeliveryTask.js';
import { User } from '../../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ENV } from '../../config/env.js';

export const merchantsController = {
  /**
   * List merchants with search, filter, and pagination
   */
  async getAll(req, res, next) {
    try {
      const { search, status, team, page = 1, limit = 25, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

      const query = {};

      if (status && status !== 'all') {
        query.status = status;
      }

      if (team && team !== 'all') {
        query.linkToTeam = team;
      }

      if (search) {
        const regex = new RegExp(search, 'i');
        query.$or = [
          { merchantName: regex },
          { loginEmail: regex },
          { 'storeDetails.contactName': regex },
          { 'storeDetails.phone': regex },
          { 'storeDetails.address': regex }
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);
      const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

      const [merchants, total] = await Promise.all([
        Merchant.find(query).sort(sort).skip(skip).limit(Number(limit)).lean(),
        Merchant.countDocuments(query)
      ]);

      res.status(200).json({
        success: true,
        data: merchants,
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
   * Get single merchant by ID
   */
  async getById(req, res, next) {
    try {
      const merchant = await Merchant.findById(req.params.id);
      if (!merchant) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Merchant not found' }
        });
      }
      res.status(200).json({ success: true, data: merchant });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create new merchant with password hashing
   */
  async create(req, res, next) {
    try {
      const {
        merchantName,
        status = 'Active',
        loginEmail,
        password,
        linkToTeam = 'All Teams',
        storeDetails = {},
        permissions = {},
        storeOpeningHours = {},
        logoUrl = '',
        sendWelcomeEmail = true
      } = req.body;

      // Validation
      if (!merchantName || !loginEmail) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Merchant Name and Login Email are required.' }
        });
      }

      // Check duplicate email
      const existing = await Merchant.findOne({ loginEmail: loginEmail.toLowerCase() });
      if (existing) {
        return res.status(409).json({
          success: false,
          error: { code: 'DUPLICATE_EMAIL', message: 'A merchant with this login email already exists.' }
        });
      }

      // Generate merchant code (e.g. MER-BAZAA-01)
      const codeBase = merchantName.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase();
      const count = await Merchant.countDocuments();
      const merchantCode = `MER-${codeBase}-${String(count + 1).padStart(3, '0')}`;

      // Hash password if provided
      let passwordHash = undefined;
      if (password && password.length >= 6) {
        passwordHash = await bcrypt.hash(password, 10);
      } else {
        passwordHash = await bcrypt.hash('TemporaryPass123!', 10);
      }

      const merchant = await Merchant.create({
        merchantName,
        merchantCode,
        status,
        loginEmail: loginEmail.toLowerCase(),
        passwordHash,
        linkToTeam,
        storeDetails,
        permissions: {
          create_task: permissions.create_task ?? true,
          upload_task: permissions.upload_task ?? true,
          view_shipping_fee: permissions.view_shipping_fee ?? true,
          edit_contact: permissions.edit_contact ?? true,
          edit_task: permissions.edit_task ?? true,
          assign_task_to_driver: permissions.assign_task_to_driver ?? false,
          edit_shipping_fee: permissions.edit_shipping_fee ?? false,
          delete_contact: permissions.delete_contact ?? false,
          delete_task: permissions.delete_task ?? false,
          print_shipping_label: permissions.print_shipping_label ?? true,
          add_contact: permissions.add_contact ?? true,
          manage_product: permissions.manage_product ?? true
        },
        storeOpeningHours,
        logoUrl,
        sendWelcomeEmail
      });

      res.status(201).json({
        success: true,
        message: 'Merchant successfully created',
        data: merchant
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update existing merchant
   */
  async update(req, res, next) {
    try {
      const updates = { ...req.body };

      if (updates.password && updates.password.length >= 6) {
        updates.passwordHash = await bcrypt.hash(updates.password, 10);
        delete updates.password;
      }

      const merchant = await Merchant.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true
      });

      if (!merchant) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Merchant not found' }
        });
      }

      res.status(200).json({ success: true, data: merchant });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Deactivate or Delete merchant
   */
  async delete(req, res, next) {
    try {
      const merchant = await Merchant.findByIdAndUpdate(
        req.params.id,
        { status: 'Inactive' },
        { new: true }
      );
      if (!merchant) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Merchant not found' }
        });
      }
      res.status(200).json({ success: true, message: 'Merchant deactivated', data: merchant });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Export merchants to CSV format
   */
  async exportCsv(req, res, next) {
    try {
      const merchants = await Merchant.find({}).sort({ merchantName: 1 }).lean();

      const headers = ['Merchant Name', 'Contact Name', 'Email', 'Phone', 'Address', 'Link to Team', 'Status'];
      const rows = merchants.map((m) => [
        `"${(m.merchantName || '').replace(/"/g, '""')}"`,
        `"${(m.storeDetails?.contactName || '').replace(/"/g, '""')}"`,
        `"${m.loginEmail || ''}"`,
        `"${m.storeDetails?.phone || ''}"`,
        `"${(m.storeDetails?.address || '').replace(/"/g, '""')}"`,
        `"${m.linkToTeam || 'All Teams'}"`,
        `"${m.status || 'Active'}"`
      ]);

      const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=merchants_export_${Date.now()}.csv`);
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Merchant Portal Authentication (Strict Tenant Isolation)
   */
  async portalLogin(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Email and password are required' }
        });
      }

      const merchant = await Merchant.findOne({ loginEmail: email.toLowerCase() }).select('+passwordHash');
      if (!merchant) {
        return res.status(401).json({
          success: false,
          error: { code: 'AUTH_FAILED', message: 'Invalid merchant login credentials' }
        });
      }

      const isValid = await merchant.comparePassword(password);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: { code: 'AUTH_FAILED', message: 'Invalid merchant login credentials' }
        });
      }

      // Generate tenant-scoped JWT
      const token = jwt.sign(
        {
          merchantId: merchant._id,
          email: merchant.loginEmail,
          role: 'MERCHANT',
          permissions: merchant.permissions
        },
        ENV.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(200).json({
        success: true,
        token,
        merchant: {
          id: merchant._id,
          name: merchant.merchantName,
          email: merchant.loginEmail,
          permissions: merchant.permissions,
          storeDetails: merchant.storeDetails
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Merchant Portal: List tasks strictly scoped to this merchant tenant
   * Redacts shippingFee if view_shipping_fee permission is false
   */
  async portalGetTasks(req, res, next) {
    try {
      const merchantId = req.merchant?._id || req.query.merchantId;
      if (!merchantId) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Merchant identification required.' }
        });
      }

      const merchant = await Merchant.findById(merchantId);
      if (!merchant) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Merchant not found.' }
        });
      }

      const tasks = await DeliveryTask.find({ merchant: merchant._id, isArchived: false })
        .sort({ createdAt: -1 })
        .lean();

      // Redact shipping fee if view_shipping_fee is disabled
      const canViewFee = merchant.permissions?.view_shipping_fee !== false;
      const sanitizedTasks = tasks.map((t) => ({
        ...t,
        shippingFee: canViewFee ? t.shippingFee : null
      }));

      res.status(200).json({
        success: true,
        data: sanitizedTasks,
        merchantName: merchant.merchantName,
        permissions: merchant.permissions
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Merchant Portal: Create new delivery task
   * Enforces create_task permission; locks fee if edit_shipping_fee is false
   */
  async portalCreateTask(req, res, next) {
    try {
      const merchantId = req.merchant?._id || req.body.merchantId;
      const merchant = await Merchant.findById(merchantId);
      if (!merchant) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Merchant not found.' }
        });
      }

      if (merchant.permissions?.create_task === false) {
        return res.status(403).json({
          success: false,
          error: { code: 'PERMISSION_DENIED', message: 'Merchant lacks permission to create tasks.' }
        });
      }

      const {
        recipientName,
        phone,
        email = '',
        address,
        buildingUnit = '',
        instructions = '',
        description = '',
        service = 'Standard Delivery',
        items = [],
        completeBefore,
        shippingFee = 0
      } = req.body;

      if (!recipientName || !address) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Recipient name and address are required.' }
        });
      }

      // Enforce fee editing permission
      const canEditFee = merchant.permissions?.edit_shipping_fee === true;
      const finalFee = canEditFee ? Number(shippingFee) : 35.0; // Standard base rate if cannot edit

      const count = await DeliveryTask.countDocuments();
      const taskNumber = `ORD-${1000 + count + 1}`;
      const deadline = completeBefore ? new Date(completeBefore) : new Date(Date.now() + 24 * 60 * 60 * 1000);

      const task = await DeliveryTask.create({
        taskNumber,
        externalReferenceId: `REF-${Date.now().toString().slice(-6)}`,
        merchant: merchant._id,
        merchantName: merchant.merchantName,
        taskType: 'Delivery',
        service,
        taskNotes: description,
        pickupLocation: {
          contactName: merchant.storeDetails?.contactName || '',
          phone: merchant.storeDetails?.phone || '',
          address: merchant.storeDetails?.address || ''
        },
        destination: {
          recipientName,
          phone: phone || merchant.storeDetails?.phone || '0400000000',
          email,
          address,
          buildingUnit,
          instructions
        },
        completeBefore: deadline,
        assignedTeam: merchant.linkToTeam || 'Merchants',
        shippingFee: finalFee,
        items: items.length > 0 ? items : [{ productName: description || 'Delivery Package', quantity: 1, unitPrice: finalFee }],
        status: 'Unassigned',
        history: [
          {
            status: 'Unassigned',
            action: 'Created via Merchant Portal',
            updatedByName: merchant.merchantName,
            timestamp: new Date()
          }
        ]
      });

      res.status(201).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Merchant Portal: Cancel task
   * Enforces delete_task permission
   */
  async portalCancelTask(req, res, next) {
    try {
      const merchantId = req.merchant?._id || req.body.merchantId;
      const merchant = await Merchant.findById(merchantId);

      if (merchant && merchant.permissions?.delete_task === false) {
        return res.status(403).json({
          success: false,
          error: { code: 'PERMISSION_DENIED', message: 'Merchant lacks permission to delete/cancel tasks.' }
        });
      }

      const task = await DeliveryTask.findOne({
        _id: req.params.id,
        merchant: merchantId,
        status: { $in: ['Unassigned', 'Assigning', 'Assigned'] }
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Task not found or cannot be cancelled in current status.' }
        });
      }

      task.status = 'Cancelled';
      task.version += 1;
      task.history.push({
        status: 'Cancelled',
        action: 'Cancelled by Merchant',
        updatedByName: merchant?.merchantName || 'Merchant',
        timestamp: new Date()
      });

      await task.save();

      res.status(200).json({ success: true, message: 'Order cancelled successfully', data: task });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Merchant Portal: Generate printable shipping label
   * Enforces print_shipping_label permission
   */
  async portalPrintLabel(req, res, next) {
    try {
      const merchantId = req.merchant?._id || req.query.merchantId;
      const merchant = await Merchant.findById(merchantId);

      if (merchant && merchant.permissions?.print_shipping_label === false) {
        return res.status(403).json({
          success: false,
          error: { code: 'PERMISSION_DENIED', message: 'Merchant lacks permission to print shipping labels.' }
        });
      }

      const task = await DeliveryTask.findById(req.params.id).lean();
      if (!task) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Task not found.' }
        });
      }

      const barcodeValue = `DP-${task.taskNumber}`;
      res.status(200).json({
        success: true,
        data: {
          taskNumber: task.taskNumber,
          barcodeValue,
          merchantName: task.merchantName,
          recipient: task.destination?.recipientName,
          address: task.destination?.address,
          phone: task.destination?.phone,
          service: task.service,
          scheduledDate: task.completeBefore,
          packageCount: task.items?.length || 1,
          qrPayload: `https://track.deliveryplus.tech/track/${task.taskNumber}`
        }
      });
    } catch (error) {
      next(error);
    }
  }
};
