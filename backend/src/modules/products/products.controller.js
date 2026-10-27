import { Product } from '../../models/Product.js';
import { logAuditEvent } from '../../middleware/audit.middleware.js';

export const getProducts = async (req, res, next) => {
  try {
    const { category, search, activeOnly } = req.query;
    const query = {};

    if (category) query.category = category;
    if (activeOnly === 'true') query.isActive = true;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query).sort({ category: 1, name: 1 });

    res.status(200).json({
      success: true,
      data: products,
      meta: { total: products.length }
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);

    await logAuditEvent({
      actor: req.user._id,
      action: 'PRODUCT_CREATED',
      entityType: 'Product',
      entityId: product._id,
      details: { sku: product.sku, unitPrice: product.unitPrice },
      ip: req.ip
    });

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Product not found' }
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Product not found' }
      });
    }

    product.isActive = false;
    await product.save();

    res.status(200).json({
      success: true,
      data: { message: 'Product deactivated successfully' }
    });
  } catch (error) {
    next(error);
  }
};
