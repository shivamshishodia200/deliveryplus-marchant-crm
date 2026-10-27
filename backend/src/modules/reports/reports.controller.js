import { Lead } from '../../models/Lead.js';
import { Contact } from '../../models/Contact.js';
import { Company } from '../../models/Company.js';
import { Opportunity } from '../../models/Opportunity.js';
import { Task } from '../../models/Task.js';
import { Quotation } from '../../models/Quotation.js';
import { SupportTicket } from '../../models/SupportTicket.js';

export const getDashboardMetrics = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      totalLeads,
      totalContacts,
      totalCompanies,
      totalOpportunities,
      openOpportunities,
      closedWonOpportunities,
      tasksDueToday,
      totalCompletedTasks,
      recentOpportunities,
      recentLeads,
      allDeals
    ] = await Promise.all([
      Lead.countDocuments({ isArchived: false }),
      Contact.countDocuments({ isArchived: false }),
      Company.countDocuments({ isArchived: false }),
      Opportunity.countDocuments({ isArchived: false }),
      Opportunity.find({ isArchived: false, stage: { $nin: ['closed_won', 'closed_lost'] } }),
      Opportunity.find({ isArchived: false, stage: 'closed_won' }),
      Task.countDocuments({ dueDate: { $gte: todayStart, $lte: todayEnd }, status: 'pending' }),
      Task.countDocuments({ status: 'completed' }),
      Opportunity.find({ isArchived: false })
        .populate('company', 'name')
        .sort({ createdAt: -1 })
        .limit(6),
      Lead.find({ isArchived: false })
        .sort({ createdAt: -1 })
        .limit(6),
      Opportunity.find({ isArchived: false }).select('stage amount')
    ]);

    // Authoritative pipeline value calculations
    const pipelineValue = openOpportunities.reduce((acc, deal) => acc + (deal.amount || 0), 0);
    const totalWonRevenue = closedWonOpportunities.reduce((acc, deal) => acc + (deal.amount || 0), 0);

    // Dynamic funnel stages for charts
    const stageCounts = {
      discovery: 0,
      qualification: 0,
      proposal: 0,
      negotiation: 0,
      closed_won: 0,
      closed_lost: 0
    };

    allDeals.forEach((deal) => {
      if (stageCounts[deal.stage] !== undefined) {
        stageCounts[deal.stage] += 1;
      }
    });

    const pipelineBreakdown = Object.keys(stageCounts).map((key) => ({
      stage: key,
      label: key.replace('_', ' ').toUpperCase(),
      count: stageCounts[key]
    }));

    // Lead Conversion Rate calculation
    const convertedLeads = await Lead.countDocuments({ isConverted: true });
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        totalLeads,
        totalContacts,
        totalCompanies,
        totalOpportunities,
        pipelineValue,
        totalWonRevenue,
        openDealsCount: openOpportunities.length,
        tasksDueToday,
        totalCompletedTasks,
        conversionRate,
        pipelineBreakdown,
        recentOpportunities,
        recentLeads
      }
    });
  } catch (error) {
    next(error);
  }
};

export const exportData = async (req, res, next) => {
  try {
    const { entity = 'leads' } = req.query;
    let records = [];
    let fields = [];

    if (entity === 'leads') {
      records = await Lead.find({ isArchived: false }).lean();
      fields = ['firstName', 'lastName', 'email', 'phone', 'companyName', 'status', 'source', 'leadScore', 'estimatedValue'];
    } else if (entity === 'contacts') {
      records = await Contact.find({ isArchived: false }).populate('company', 'name').lean();
      fields = ['firstName', 'lastName', 'email', 'phone', 'jobTitle'];
    } else if (entity === 'deals') {
      records = await Opportunity.find({ isArchived: false }).populate('company', 'name').lean();
      fields = ['title', 'amount', 'stage', 'probability'];
    } else {
      return res.status(400).json({ success: false, error: { message: 'Invalid entity for export' } });
    }

    // Generate CSV string
    const headerRow = fields.join(',');
    const rows = records.map((r) =>
      fields.map((f) => {
        let val = r[f];
        if (f === 'company' && typeof val === 'object') val = val?.name;
        if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`;
        return val ?? '';
      }).join(',')
    );

    const csvContent = [headerRow, ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${entity}-export-${Date.now()}.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
