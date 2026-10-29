import { DeliveryTask } from '../../models/DeliveryTask.js';
import { DriverProfile } from '../../models/DriverProfile.js';
import { Vehicle } from '../../models/Vehicle.js';
import { User } from '../../models/User.js';

export const dispatchController = {
  /**
   * Get geocoded task pins and driver telemetry for Map & Dispatch Center
   */
  async getMapData(req, res, next) {
    try {
      const { status = 'all', team = 'all' } = req.query;

      const taskQuery = { isArchived: false };
      if (status && status !== 'all') {
        taskQuery.status = status;
      }
      if (team && team !== 'all') {
        taskQuery.assignedTeam = team;
      }

      // Fetch tasks
      const tasks = await DeliveryTask.find(taskQuery)
        .select(
          'taskNumber externalReferenceId status taskType priority merchantName driverName completeBefore destination items'
        )
        .lean();

      // Transform pins with coordinates
      const pins = tasks
        .map((t) => {
          const lat = t.destination?.lat || -37.8136 + (Math.sin(t.taskNumber.charCodeAt(4) || 1) * 0.05);
          const lng = t.destination?.lng || 144.9631 + (Math.cos(t.taskNumber.charCodeAt(4) || 1) * 0.05);

          return {
            id: t._id,
            taskNumber: t.taskNumber,
            recipient: t.destination?.recipientName || 'Recipient',
            address: t.destination?.address,
            status: t.status,
            type: t.taskType,
            priority: t.priority,
            merchantName: t.merchantName,
            driverName: t.driverName,
            completeBefore: t.completeBefore,
            packageCount: t.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 1,
            lat,
            lng
          };
        });

      // Fetch driver telemetry
      const driverProfiles = await DriverProfile.find({})
        .populate('user', 'name email phone avatar')
        .populate('assignedVehicle', 'vehicleName rego')
        .lean();

      const now = Date.now();
      const drivers = driverProfiles.map((d) => {
        const lastSeen = d.telemetry?.lastSeen ? new Date(d.telemetry.lastSeen).getTime() : 0;
        const diffMinutes = Math.floor((now - lastSeen) / (60 * 1000));

        let computedStatus = 'Offline';
        if (d.telemetry?.isOnline) {
          computedStatus = diffMinutes <= 5 ? 'Online' : 'Stale';
        }

        return {
          id: d.user?._id || d._id,
          profileId: d._id,
          name: d.user?.name || 'Driver',
          phone: d.phone || d.user?.phone || '',
          avatar: d.user?.avatar || '',
          vehicleName: d.assignedVehicle?.vehicleName || d.vehicleName || 'Standard Delivery Van',
          rego: d.assignedVehicle?.rego || 'VIC-DEL-01',
          speedKmH: d.telemetry?.speed || 0,
          heading: d.telemetry?.heading || 0,
          batteryPercent: d.telemetry?.battery || 100,
          activeTasks: d.activeTasksCount || 0,
          status: computedStatus,
          lastSeenAgoMinutes: diffMinutes < 1000 ? diffMinutes : null,
          lat: d.telemetry?.lat || -37.8136,
          lng: d.telemetry?.lng || 144.9631
        };
      });

      res.status(200).json({
        success: true,
        data: {
          pins,
          drivers,
          counts: {
            totalPins: pins.length,
            onlineDrivers: drivers.filter((d) => d.status === 'Online').length,
            totalDrivers: drivers.length
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Additive ingestion adapter for driver app telemetry
   */
  async recordTelemetry(req, res, next) {
    try {
      const { coords = {}, timestamp, battery, isOnline = true } = req.body;
      const driverUserId = req.user?._id;

      if (!driverUserId) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Driver authentication required.' }
        });
      }

      const { latitude, longitude, speed = 0, heading = 0 } = coords;

      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_COORDINATES', message: 'Valid latitude and longitude are required.' }
        });
      }

      await DriverProfile.findOneAndUpdate(
        { user: driverUserId },
        {
          $set: {
            'telemetry.isOnline': Boolean(isOnline),
            'telemetry.lastSeen': timestamp ? new Date(timestamp) : new Date(),
            'telemetry.lat': latitude,
            'telemetry.lng': longitude,
            'telemetry.speed': Math.max(0, speed),
            'telemetry.heading': Math.max(0, heading),
            'telemetry.battery': battery !== undefined ? Number(battery) : 100
          }
        },
        { upsert: true }
      );

      res.status(200).json({ success: true, message: 'Telemetry fix recorded.' });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create or update saved route stops
   */
  async createRoute(req, res, next) {
    try {
      const { driverId, taskIds = [], routeName = 'Standard Route' } = req.body;

      if (!driverId || taskIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Driver and taskIds are required to create a route.' }
        });
      }

      const driver = await User.findById(driverId);
      if (!driver) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Driver not found.' }
        });
      }

      // Assign tasks to driver in given order
      await Promise.all(
        taskIds.map((taskId, index) =>
          DeliveryTask.findByIdAndUpdate(taskId, {
            assignedDriver: driver._id,
            driverName: driver.name,
            status: 'Assigned',
            'configurableFields.remarks': `Route: ${routeName} (Stop #${index + 1})`
          })
        )
      );

      await DriverProfile.updateOne(
        { user: driver._id },
        { $inc: { activeTasksCount: taskIds.length } }
      );

      res.status(200).json({
        success: true,
        message: `Route '${routeName}' created with ${taskIds.length} stops assigned to ${driver.name}.`
      });
    } catch (error) {
      next(error);
    }
  }
};
