import { Contact } from '../../models/Contact.js';
import { Opportunity } from '../../models/Opportunity.js';
import { Activity } from '../../models/Activity.js';
import { logAuditEvent } from '../../middleware/audit.middleware.js';

export const getContacts = async (req, res, next) => {
  try {
    const { company, search, page = 1, limit = 20 } = req.query;
    const query = { isArchived: false };

    if (company) query.company = company;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [contacts, total] = await Promise.all([
      Contact.find(query)
        .populate('company', 'name industry tier')
        .populate('owner', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Contact.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: contacts,
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

export const getContactById = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate('company')
      .populate('owner', 'name email');

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contact not found' }
      });
    }

    const [opportunities, activities] = await Promise.all([
      Opportunity.find({ contact: contact._id }).sort({ createdAt: -1 }),
      Activity.find({ contact: contact._id }).populate('performedBy', 'name email').sort({ createdAt: -1 })
    ]);

    res.status(200).json({
      success: true,
      data: { contact, opportunities, activities }
    });
  } catch (error) {
    next(error);
  }
};

export const createContact = async (req, res, next) => {
  try {
    const contactData = {
      ...req.body,
      owner: req.body.owner || req.user._id
    };

    const contact = await Contact.create(contactData);

    await logAuditEvent({
      actor: req.user._id,
      action: 'CONTACT_CREATED',
      entityType: 'Contact',
      entityId: contact._id,
      details: { email: contact.email },
      ip: req.ip
    });

    const populated = await Contact.findById(contact._id)
      .populate('company', 'name')
      .populate('owner', 'name email');

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('company', 'name')
      .populate('owner', 'name email');

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contact not found' }
      });
    }

    await logAuditEvent({
      actor: req.user._id,
      action: 'CONTACT_UPDATED',
      entityType: 'Contact',
      entityId: contact._id,
      details: {},
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contact not found' }
      });
    }

    contact.isArchived = true;
    await contact.save();

    await logAuditEvent({
      actor: req.user._id,
      action: 'CONTACT_ARCHIVED',
      entityType: 'Contact',
      entityId: contact._id,
      details: {},
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      data: { message: 'Contact archived successfully' }
    });
  } catch (error) {
    next(error);
  }
};
