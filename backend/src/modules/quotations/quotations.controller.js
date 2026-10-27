import { Quotation } from '../../models/Quotation.js';
import { Opportunity } from '../../models/Opportunity.js';
import { Activity } from '../../models/Activity.js';
import { logAuditEvent } from '../../middleware/audit.middleware.js';

// Authoritative server-side financial calculations
const computeQuotationTotals = (items, taxRatePercent = 5) => {
  let subtotal = 0;
  let discountAmount = 0;

  const validatedItems = (items || []).map((item) => {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.unitPrice) || 0;
    const discountPct = Math.min(100, Math.max(0, Number(item.discountPercent) || 0));
    
    const gross = qty * price;
    const itemDiscount = (gross * discountPct) / 100;
    const net = gross - itemDiscount;

    subtotal += gross;
    discountAmount += itemDiscount;

    return {
      product: item.product || null,
      description: item.description || 'Service line item',
      quantity: qty,
      unitPrice: price,
      discountPercent: discountPct,
      lineTotal: Math.round(net * 100) / 100
    };
  });

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(((taxableAmount * taxRatePercent) / 100) * 100) / 100;
  const totalAmount = Math.round((taxableAmount + taxAmount) * 100) / 100;

  return {
    items: validatedItems,
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    taxRatePercent,
    taxAmount,
    totalAmount
  };
};

export const getQuotations = async (req, res, next) => {
  try {
    const { status, company, opportunity } = req.query;
    const query = {};

    if (status) query.status = status;
    if (company) query.company = company;
    if (opportunity) query.opportunity = opportunity;

    const quotations = await Quotation.find(query)
      .populate('company', 'name email phone')
      .populate('contact', 'firstName lastName email')
      .populate('opportunity', 'title amount stage')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: quotations,
      meta: { total: quotations.length }
    });
  } catch (error) {
    next(error);
  }
};

export const getQuotationById = async (req, res, next) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate('company')
      .populate('contact')
      .populate('opportunity')
      .populate('createdBy', 'name email');

    if (!quotation) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Quotation not found' }
      });
    }

    res.status(200).json({
      success: true,
      data: quotation
    });
  } catch (error) {
    next(error);
  }
};

export const createQuotation = async (req, res, next) => {
  try {
    const { company, contact, opportunity, items, taxRatePercent, validUntil, terms } = req.body;

    const calculations = computeQuotationTotals(items, taxRatePercent || 5);
    const count = await Quotation.countDocuments();
    const quoteNumber = `QUO-2026-${String(count + 1001).padStart(5, '0')}`;

    const quotation = await Quotation.create({
      quoteNumber,
      company,
      contact: contact || null,
      opportunity: opportunity || null,
      status: 'draft',
      validUntil: validUntil || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      terms: terms || undefined,
      createdBy: req.user._id,
      ...calculations
    });

    if (opportunity) {
      await Activity.create({
        type: 'note',
        subject: `Quotation ${quoteNumber} Generated`,
        description: `Proposal created with total value $${calculations.totalAmount.toLocaleString()}`,
        performedBy: req.user._id,
        opportunity,
        company
      });
    }

    await logAuditEvent({
      actor: req.user._id,
      action: 'QUOTATION_CREATED',
      entityType: 'Quotation',
      entityId: quotation._id,
      details: { quoteNumber, totalAmount: calculations.totalAmount },
      ip: req.ip
    });

    const populated = await Quotation.findById(quotation._id)
      .populate('company', 'name')
      .populate('contact', 'firstName lastName')
      .populate('opportunity', 'title');

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

export const updateQuotationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Quotation not found' }
      });
    }

    const prevStatus = quotation.status;
    quotation.status = status;
    await quotation.save();

    if (status === 'accepted' && quotation.opportunity) {
      await Opportunity.findByIdAndUpdate(quotation.opportunity, {
        stage: 'closed_won',
        probability: 100,
        amount: quotation.totalAmount,
        wonDate: new Date()
      });
    }

    await logAuditEvent({
      actor: req.user._id,
      action: 'QUOTATION_STATUS_CHANGED',
      entityType: 'Quotation',
      entityId: quotation._id,
      details: { from: prevStatus, to: status },
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      data: quotation
    });
  } catch (error) {
    next(error);
  }
};
