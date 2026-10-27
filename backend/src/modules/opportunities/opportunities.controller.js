import { Opportunity } from '../../models/Opportunity.js';
import { Activity } from '../../models/Activity.js';
import { Quotation } from '../../models/Quotation.js';
import { logAuditEvent } from '../../middleware/audit.middleware.js';

export const getOpportunities = async (req, res, next) => {
  try {
    const { stage, owner, company, search, view, page = 1, limit = 50 } = req.query;
    const query = { isArchived: false };

    if (stage) query.stage = stage;
    if (owner) query.owner = owner;
    if (company) query.company = company;

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (view === 'kanban') {
      const deals = await Opportunity.find(query)
        .populate('company', 'name')
        .populate('contact', 'firstName lastName email')
        .populate('owner', 'name')
        .sort({ createdAt: -1 });

      const stages = ['discovery', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
      const kanban = {};
      let totalPipelineValue = 0;

      stages.forEach((s) => {
        const stageDeals = deals.filter((d) => d.stage === s);
        const stageTotal = stageDeals.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        totalPipelineValue += stageTotal;
        kanban[s] = {
          items: stageDeals,
          totalAmount: stageTotal,
          count: stageDeals.length
        };
      });

      return res.status(200).json({
        success: true,
        data: {
          kanban,
          totalPipelineValue,
          totalDeals: deals.length
        }
      });
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [opportunities, total] = await Promise.all([
      Opportunity.find(query)
        .populate('company', 'name')
        .populate('contact', 'firstName lastName email')
        .populate('owner', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Opportunity.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: opportunities,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getOpportunityById = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)
      .populate('company')
      .populate('contact')
      .populate('owner', 'name email');

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Opportunity not found' }
      });
    }

    const [quotations, activities] = await Promise.all([
      Quotation.find({ opportunity: opportunity._id }),
      Activity.find({ opportunity: opportunity._id }).populate('performedBy', 'name email').sort({ createdAt: -1 })
    ]);

    res.status(200).json({
      success: true,
      data: { opportunity, quotations, activities }
    });
  } catch (error) {
    next(error);
  }
};

export const createOpportunity = async (req, res, next) => {
  try {
    const dealData = {
      ...req.body,
      owner: req.body.owner || req.user._id
    };

    const opportunity = await Opportunity.create(dealData);

    await Activity.create({
      type: 'stage_change',
      subject: `Deal Created in ${opportunity.stage}`,
      description: `Opportunity created with value $${opportunity.amount.toLocaleString()}`,
      performedBy: req.user._id,
      opportunity: opportunity._id,
      company: opportunity.company
    });

    await logAuditEvent({
      actor: req.user._id,
      action: 'OPPORTUNITY_CREATED',
      entityType: 'Opportunity',
      entityId: opportunity._id,
      details: { title: opportunity.title, amount: opportunity.amount },
      ip: req.ip
    });

    const populated = await Opportunity.findById(opportunity._id)
      .populate('company', 'name')
      .populate('contact', 'firstName lastName')
      .populate('owner', 'name');

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

export const updateOpportunityStage = async (req, res, next) => {
  try {
    const { stage, lostReason } = req.body;
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Opportunity not found' }
      });
    }

    const previousStage = opportunity.stage;
    opportunity.stage = stage;

    if (stage === 'closed_won') {
      opportunity.probability = 100;
      opportunity.wonDate = new Date();
    } else if (stage === 'closed_lost') {
      opportunity.probability = 0;
      opportunity.lostReason = lostReason || 'Competitor pricing';
    } else if (stage === 'proposal') {
      opportunity.probability = 60;
    } else if (stage === 'negotiation') {
      opportunity.probability = 80;
    }

    await opportunity.save();

    await Activity.create({
      type: 'stage_change',
      subject: `Stage moved: ${previousStage} → ${stage}`,
      description: `Pipeline deal "${opportunity.title}" shifted stage to ${stage}.`,
      performedBy: req.user._id,
      opportunity: opportunity._id,
      company: opportunity.company
    });

    await logAuditEvent({
      actor: req.user._id,
      action: 'OPPORTUNITY_STAGE_UPDATED',
      entityType: 'Opportunity',
      entityId: opportunity._id,
      details: { from: previousStage, to: stage, amount: opportunity.amount },
      ip: req.ip
    });

    const populated = await Opportunity.findById(opportunity._id)
      .populate('company', 'name')
      .populate('contact', 'firstName lastName')
      .populate('owner', 'name');

    res.status(200).json({
      success: true,
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

export const updateOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('company', 'name')
      .populate('contact', 'firstName lastName')
      .populate('owner', 'name');

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Opportunity not found' }
      });
    }

    await logAuditEvent({
      actor: req.user._id,
      action: 'OPPORTUNITY_UPDATED',
      entityType: 'Opportunity',
      entityId: opportunity._id,
      details: { title: opportunity.title },
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      data: opportunity
    });
  } catch (error) {
    next(error);
  }
};

export const deleteOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Opportunity not found' }
      });
    }

    opportunity.isArchived = true;
    await opportunity.save();

    await logAuditEvent({
      actor: req.user._id,
      action: 'OPPORTUNITY_ARCHIVED',
      entityType: 'Opportunity',
      entityId: opportunity._id,
      details: {},
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      data: { message: 'Opportunity archived successfully' }
    });
  } catch (error) {
    next(error);
  }
};
