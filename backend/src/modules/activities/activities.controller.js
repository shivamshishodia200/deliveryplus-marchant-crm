import { Activity } from '../../models/Activity.js';

export const getActivities = async (req, res, next) => {
  try {
    const { lead, contact, company, opportunity, limit = 50 } = req.query;
    const query = {};

    if (lead) query.lead = lead;
    if (contact) query.contact = contact;
    if (company) query.company = company;
    if (opportunity) query.opportunity = opportunity;

    const activities = await Activity.find(query)
      .populate('performedBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

export const createActivity = async (req, res, next) => {
  try {
    const activity = await Activity.create({
      ...req.body,
      performedBy: req.user._id
    });

    const populated = await Activity.findById(activity._id).populate('performedBy', 'name email avatar');

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    next(error);
  }
};
