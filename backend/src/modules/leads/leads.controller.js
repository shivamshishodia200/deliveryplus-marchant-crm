import { Lead } from '../../models/Lead.js';
import { Contact } from '../../models/Contact.js';
import { Company } from '../../models/Company.js';
import { Opportunity } from '../../models/Opportunity.js';
import { Activity } from '../../models/Activity.js';
import { logAuditEvent } from '../../middleware/audit.middleware.js';

export const getLeads = async (req, res, next) => {
  try {
    const { status, source, owner, search, page = 1, limit = 20 } = req.query;
    const query = { isArchived: false };

    if (status) query.status = status;
    if (source) query.source = source;
    if (owner) query.owner = owner;

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [leads, total] = await Promise.all([
      Lead.find(query)
        .populate('owner', 'name email department')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Lead.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: leads,
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

export const getLeadById = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('owner', 'name email department')
      .populate('convertedContactId')
      .populate('convertedCompanyId')
      .populate('convertedOpportunityId');

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Lead not found' }
      });
    }

    const activities = await Activity.find({ lead: lead._id })
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { lead, activities }
    });
  } catch (error) {
    next(error);
  }
};

export const createLead = async (req, res, next) => {
  try {
    const leadData = {
      ...req.body,
      owner: req.body.owner || req.user._id
    };

    const lead = await Lead.create(leadData);

    await Activity.create({
      type: 'status_update',
      subject: 'Lead Created',
      description: `Lead created from source: ${lead.source}`,
      performedBy: req.user._id,
      lead: lead._id
    });

    await logAuditEvent({
      actor: req.user._id,
      action: 'LEAD_CREATED',
      entityType: 'Lead',
      entityId: lead._id,
      details: { name: `${lead.firstName} ${lead.lastName}`, company: lead.companyName },
      ip: req.ip
    });

    const populated = await Lead.findById(lead._id).populate('owner', 'name email department');

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Lead not found' }
      });
    }

    const previousStatus = lead.status;
    Object.assign(lead, req.body);
    await lead.save();

    if (req.body.status && req.body.status !== previousStatus) {
      await Activity.create({
        type: 'stage_change',
        subject: `Status changed to ${req.body.status}`,
        description: `Lead status updated from ${previousStatus} to ${req.body.status}`,
        performedBy: req.user._id,
        lead: lead._id
      });
    }

    await logAuditEvent({
      actor: req.user._id,
      action: 'LEAD_UPDATED',
      entityType: 'Lead',
      entityId: lead._id,
      details: { changes: Object.keys(req.body) },
      ip: req.ip
    });

    const populated = await Lead.findById(lead._id).populate('owner', 'name email department');

    res.status(200).json({
      success: true,
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

export const convertLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Lead not found' }
      });
    }

    if (lead.isConverted) {
      return res.status(400).json({
        success: false,
        error: { code: 'ALREADY_CONVERTED', message: 'This lead has already been converted.' }
      });
    }

    // 1. Create or link Company
    let companyId = null;
    if (lead.companyName) {
      let company = await Company.findOne({ name: { $regex: `^${lead.companyName}$`, $options: 'i' } });
      if (!company) {
        company = await Company.create({
          name: lead.companyName,
          phone: lead.phone,
          email: lead.email,
          owner: lead.owner || req.user._id,
          status: 'prospect',
          notes: `Converted from lead: ${lead.firstName} ${lead.lastName}`
        });
      }
      companyId = company._id;
    }

    // 2. Create Contact
    const contact = await Contact.create({
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email || `${lead.firstName.toLowerCase()}.${lead.lastName.toLowerCase()}@client.com`,
      phone: lead.phone,
      company: companyId,
      jobTitle: lead.title || 'Client Representative',
      owner: lead.owner || req.user._id,
      leadSource: lead.source,
      notes: lead.notes
    });

    // 3. Create Opportunity
    const opportunity = await Opportunity.create({
      title: `${lead.companyName || lead.lastName} - Moving Contract`,
      company: companyId,
      contact: contact._id,
      amount: lead.estimatedValue || 2500,
      stage: 'discovery',
      probability: 25,
      owner: lead.owner || req.user._id,
      notes: `Converted from lead ${lead.firstName} ${lead.lastName}`
    });

    // 4. Mark Lead Converted
    lead.isConverted = true;
    lead.status = 'converted';
    lead.convertedAt = new Date();
    lead.convertedContactId = contact._id;
    lead.convertedCompanyId = companyId;
    lead.convertedOpportunityId = opportunity._id;
    await lead.save();

    await Activity.create({
      type: 'status_update',
      subject: 'Lead Converted',
      description: `Converted into Contact, Company and Opportunity #${opportunity._id}`,
      performedBy: req.user._id,
      lead: lead._id,
      contact: contact._id,
      company: companyId,
      opportunity: opportunity._id
    });

    await logAuditEvent({
      actor: req.user._id,
      action: 'LEAD_CONVERTED',
      entityType: 'Lead',
      entityId: lead._id,
      details: {
        contactId: contact._id,
        companyId,
        opportunityId: opportunity._id
      },
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      data: {
        message: 'Lead converted successfully',
        lead,
        contact,
        companyId,
        opportunity
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Lead not found' }
      });
    }

    lead.isArchived = true;
    await lead.save();

    await logAuditEvent({
      actor: req.user._id,
      action: 'LEAD_ARCHIVED',
      entityType: 'Lead',
      entityId: lead._id,
      details: {},
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      data: { message: 'Lead archived successfully' }
    });
  } catch (error) {
    next(error);
  }
};
