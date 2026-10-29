import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Merchant } from '../models/Merchant.js';
import { DeliveryTask } from '../models/DeliveryTask.js';

describe('DeliveryPlus Dispatcher & Merchant Operations Test Suite', () => {
  let adminToken;
  let merchantToken;
  let restrictedMerchantToken;
  let testMerchant;
  let restrictedMerchant;
  let testTask;

  before(async () => {
    await connectDB();

    // Login as Admin
    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@enterprise-crm.com', password: 'EnterpriseCRM2026!' });
    adminToken = adminRes.body.data ? adminRes.body.data.token : adminRes.body.token;

    // Login as standard merchant (all permissions enabled)
    const merchantRes = await request(app)
      .post('/api/v1/merchants/portal/login')
      .send({ email: 'orders@barnsfurniture.com.au', password: 'EnterpriseCRM2026!' });
    merchantToken = merchantRes.body.token;
    testMerchant = merchantRes.body.merchant;

    // Create a restricted merchant with view_shipping_fee: false and create_task: false
    restrictedMerchant = await Merchant.create({
      merchantName: 'Restricted Retailer',
      merchantCode: 'MER-REST-099',
      status: 'Active',
      loginEmail: 'restricted@retailer.com',
      passwordHash: testMerchant ? await Merchant.findOne({ loginEmail: 'orders@barnsfurniture.com.au' }).select('+passwordHash').then(m => m.passwordHash) : 'dummy',
      permissions: {
        create_task: false,
        view_shipping_fee: false,
        delete_task: false,
        print_shipping_label: true
      }
    });

    const restrictedRes = await request(app)
      .post('/api/v1/merchants/portal/login')
      .send({ email: 'restricted@retailer.com', password: 'EnterpriseCRM2026!' });
    restrictedMerchantToken = restrictedRes.body.token;
  });

  after(async () => {
    if (restrictedMerchant) {
      await Merchant.deleteOne({ _id: restrictedMerchant._id });
      await DeliveryTask.deleteMany({ merchant: restrictedMerchant._id });
    }
    await mongoose.disconnect();
  });

  test('GET /api/v1/delivery-tasks returns paginated tasks with tab counts', async () => {
    const res = await request(app)
      .get('/api/v1/delivery-tasks?tab=Active')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.tabCounts);
    assert.ok(typeof res.body.tabCounts.activeCount === 'number');
  });

  test('POST /api/v1/delivery-tasks creates a validated delivery task with items', async () => {
    const res = await request(app)
      .post('/api/v1/delivery-tasks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        merchantId: testMerchant.id,
        taskType: 'Delivery',
        priority: 'High',
        service: 'VIC | EXPRESS DELIVERY',
        completeBefore: new Date(Date.now() + 86400000).toISOString(),
        destination: {
          recipientName: 'Jonathan Davis',
          phone: '0412 333 444',
          email: 'jonathan@example.com',
          address: '88 Collins St, Melbourne VIC 3000'
        },
        shippingFee: 75.0,
        items: [
          { productName: 'Ergonomic Desk Chair', quantity: 1, weightKg: 15, unitPrice: 75.0 }
        ]
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.taskNumber.startsWith('TSK-'));
    assert.strictEqual(res.body.data.status, 'Unassigned');
    testTask = res.body.data;
  });

  test('PATCH /api/v1/delivery-tasks/:id/status rejects invalid transitions and enforces state machine', async () => {
    // Unassigned cannot jump directly to Completed
    const invalidRes = await request(app)
      .patch(`/api/v1/delivery-tasks/${testTask._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Completed' });

    assert.strictEqual(invalidRes.status, 400);
    assert.strictEqual(invalidRes.body.error.code, 'INVALID_TRANSITION');

    // Valid transition: Unassigned -> Assigning
    const validRes = await request(app)
      .patch(`/api/v1/delivery-tasks/${testTask._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Assigning' });

    assert.strictEqual(validRes.status, 200);
    assert.strictEqual(validRes.body.data.status, 'Assigning');
  });

  test('GET /api/v1/delivery-tasks/dashboard returns real calculated operational metrics', async () => {
    const res = await request(app)
      .get('/api/v1/delivery-tasks/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.overview);
    assert.ok(typeof res.body.data.overview.activeTasks === 'number');
    assert.ok(res.body.data.byStatus);
    assert.ok(Array.isArray(res.body.data.recentFailedTasks));
  });

  test('GET /api/v1/dispatch/map-data returns geocoded pins and driver telemetry', async () => {
    const res = await request(app)
      .get('/api/v1/dispatch/map-data')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.pins));
    assert.ok(Array.isArray(res.body.data.drivers));
    if (res.body.data.pins.length > 0) {
      assert.ok(typeof res.body.data.pins[0].lat === 'number');
      assert.ok(typeof res.body.data.pins[0].lng === 'number');
    }
  });

  test('Merchant Portal: Scopes tasks strictly to merchant tenant', async () => {
    const res = await request(app)
      .get('/api/v1/merchants/portal/tasks')
      .set('Authorization', `Bearer ${merchantToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    // All tasks must belong to testMerchant
    res.body.data.forEach((task) => {
      assert.strictEqual(task.merchant.toString(), testMerchant.id.toString());
    });
  });

  test('Merchant Portal: Redacts shippingFee when view_shipping_fee permission is false', async () => {
    // Create task for restricted merchant
    const task = await DeliveryTask.create({
      taskNumber: 'TSK-9999',
      merchant: restrictedMerchant._id,
      merchantName: restrictedMerchant.merchantName,
      completeBefore: new Date(),
      destination: { recipientName: 'Jane Doe', phone: '0400111222', address: '123 Fake St' },
      shippingFee: 99.5
    });

    const res = await request(app)
      .get('/api/v1/merchants/portal/tasks')
      .set('Authorization', `Bearer ${restrictedMerchantToken}`);

    assert.strictEqual(res.status, 200);
    assert.ok(res.body.data.length > 0);
    // shippingFee must be redacted to null
    assert.strictEqual(res.body.data[0].shippingFee, null);

    await DeliveryTask.deleteOne({ _id: task._id });
  });

  test('Merchant Portal: Enforces create_task permission server-side', async () => {
    const res = await request(app)
      .post('/api/v1/merchants/portal/tasks')
      .set('Authorization', `Bearer ${restrictedMerchantToken}`)
      .send({
        recipientName: 'Blocked Order',
        phone: '0400000000',
        address: '100 Restricted Ave'
      });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.error.code, 'PERMISSION_DENIED');
  });

  test('Merchant Portal: Generates printable shipping label payload', async () => {
    const res = await request(app)
      .get(`/api/v1/merchants/portal/tasks/${testTask._id}/label`)
      .set('Authorization', `Bearer ${merchantToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.barcodeValue);
    assert.strictEqual(res.body.data.barcodeValue, `DP-${testTask.taskNumber}`);
  });
});
