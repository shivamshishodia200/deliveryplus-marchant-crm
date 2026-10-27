import { Company } from '../../models/Company.js';
import { Contact } from '../../models/Contact.js';
import { Opportunity } from '../../models/Opportunity.js';
import { logAuditEvent } from '../../middleware/audit.middleware.js';

export const getCompanies = async (req, res, next) => {
  try {
    const { status, tier, search, page = 1, limit = 20 } = req.query;
    const query = { isArchived: false };

    if (status) query.status = status;
    if (tier) query.tier = tier;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [companies, total] = await Promise.all([
      Company.find(query)
        .populate('owner', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Company.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: companies,
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

export const getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id).populate('owner', 'name email');
    if (!company) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Company not found' }
      });
    }

    const [contacts, opportunities] = await Promise.all([
      Contact.find({ company: company._id }),
      Opportunity.find({ company: company._id }).sort({ createdAt: -1 })
    ]);

    res.status(200).json({
      success: true,
      data: { company, contacts, opportunities }
    });
  } catch (error) {
    next(error);
  }
};

export const createCompany = async (req, res, next) => {
  try {
    const company = await Company.create({
      ...req.body,
      owner: req.body.owner || req.user._id
    });

    await logAuditEvent({
      actor: req.user._id,
      action: 'COMPANY_CREATED',
      entityType: 'Company',
      entityId: company._id,
      details: { name: company.name },
      ip: req.ip
    });

    res.status(201).json({
      success: true,
      data: company
    });
  } catch (error) {
    next(error);
  }
};

export const updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!company) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Company not found' }
      });
    }

    await logAuditEvent({
      actor: req.user._id,
      action: 'COMPANY_UPDATED',
      entityType: 'Company',
      entityId: company._id,
      details: {},
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Company not found' }
      });
    }

    company.isArchived = true;
    await company.save();

    await logAuditEvent({
      actor: req.user._id,
      action: 'COMPANY_ARCHIVED',
      entityType: 'Company',
      entityId: company._id,
      details: {},
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      data: { message: 'Company archived successfully' }
    });
  } catch (error) {
    next(error);
  }
};
