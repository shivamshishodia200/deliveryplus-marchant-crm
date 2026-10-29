import { Team } from '../../models/Team.js';
import { User } from '../../models/User.js';

export const teamsController = {
  async getAll(req, res, next) {
    try {
      const teams = await Team.find({ isActive: true })
        .populate('leader', 'name email phone avatar')
        .populate('members', 'name email phone avatar role')
        .sort({ name: 1 })
        .lean();

      res.status(200).json({ success: true, data: teams });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const { name, code, description, leader, members = [], operatingRegion = 'Melbourne Metro' } = req.body;
      if (!name) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Team name is required.' }
        });
      }

      const team = await Team.create({
        name,
        code: code || name.slice(0, 3).toUpperCase(),
        description,
        leader: leader || null,
        members,
        operatingRegion
      });

      res.status(201).json({ success: true, data: team });
    } catch (error) {
      next(error);
    }
  }
};
