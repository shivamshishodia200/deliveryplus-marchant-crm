import { Vehicle } from '../../models/Vehicle.js';
import { User } from '../../models/User.js';

export const vehiclesController = {
  async getAll(req, res, next) {
    try {
      const vehicles = await Vehicle.find({})
        .populate('assignedDriver', 'name email phone avatar')
        .sort({ vehicleName: 1 })
        .lean();

      res.status(200).json({ success: true, data: vehicles });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const {
        vehicleName,
        rego,
        vehicleType = 'Van',
        capacityKg = 1500,
        capacityVolumeM3 = 12,
        assignedDriver = null,
        status = 'Active',
        odometerKm = 0,
        nextServiceDueKm = 10000
      } = req.body;

      if (!vehicleName || !rego) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Vehicle name and registration are required.' }
        });
      }

      let driverName = '';
      if (assignedDriver) {
        const driver = await User.findById(assignedDriver);
        if (driver) driverName = driver.name;
      }

      const vehicle = await Vehicle.create({
        vehicleName,
        rego,
        vehicleType,
        capacityKg,
        capacityVolumeM3,
        assignedDriver: assignedDriver || null,
        driverName,
        status,
        odometerKm,
        nextServiceDueKm
      });

      res.status(201).json({ success: true, data: vehicle });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      if (req.body.assignedDriver) {
        const driver = await User.findById(req.body.assignedDriver);
        if (driver) req.body.driverName = driver.name;
      }

      const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });

      if (!vehicle) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Vehicle not found.' }
        });
      }

      res.status(200).json({ success: true, data: vehicle });
    } catch (error) {
      next(error);
    }
  }
};
