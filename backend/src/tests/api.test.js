import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import { connectDB } from '../config/db.js';

let authToken = '';
let testLeadId = '';

test.before(async () => {
  await connectDB();
});

test.after(async () => {
  await mongoose.disconnect();
});

test('DeliveryPlus CRM API Test Suite', async (t) => {
  await t.test('GET /api/v1/health should return status healthy', async () => {
    const res = await request(app).get('/api/v1/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'healthy');
  });

  await t.test('POST /api/v1/auth/login with valid admin credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@enterprise-crm.com', password: 'EnterpriseCRM2026!' });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.equal(res.body.data.user.email, 'admin@enterprise-crm.com');
    authToken = res.body.data.token;
  });

  await t.test('POST /api/v1/auth/login with invalid password rejects with 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@enterprise-crm.com', password: 'WrongPassword123!' });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'INVALID_CREDENTIALS');
  });

  await t.test('GET /api/v1/auth/me returns authenticated user', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.user.role, 'superadmin');
  });

  await t.test('GET /api/v1/reports/dashboard returns real calculated metrics', async () => {
    const res = await request(app)
      .get('/api/v1/reports/dashboard')
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(res.status, 200);
    assert.ok(typeof res.body.data.totalLeads === 'number');
    assert.ok(typeof res.body.data.pipelineValue === 'number');
    assert.ok(Array.isArray(res.body.data.pipelineBreakdown));
  });

  await t.test('POST /api/v1/leads creates a new validated lead', async () => {
    const res = await request(app)
      .post('/api/v1/leads')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'Arthur',
        lastName: 'Pendleton',
        email: 'arthur.p@testlogistics.com',
        phone: '+1 555-0199',
        companyName: 'Pendleton Logistics Corp',
        estimatedValue: 15000,
        source: 'website'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.firstName, 'Arthur');
    testLeadId = res.body.data._id;
  });

  await t.test('POST /api/v1/leads/:id/convert converts lead into Contact, Company & Opportunity', async () => {
    assert.ok(testLeadId, 'Lead ID must exist from previous step');
    const res = await request(app)
      .post(`/api/v1/leads/${testLeadId}/convert`)
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.contact);
    assert.ok(res.body.data.opportunity);
    assert.equal(res.body.data.lead.isConverted, true);
  });

  await t.test('GET /api/v1/opportunities?view=kanban aggregates pipeline columns', async () => {
    const res = await request(app)
      .get('/api/v1/opportunities?view=kanban')
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.data.kanban.discovery);
    assert.ok(res.body.data.kanban.proposal);
    assert.ok(typeof res.body.data.totalPipelineValue === 'number');
  });

  await t.test('POST /api/v1/quotations enforces authoritative server-side math', async () => {
    const res = await request(app)
      .post('/api/v1/quotations')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        company: (await request(app).get('/api/v1/companies').set('Authorization', `Bearer ${authToken}`)).body.data[0]._id,
        items: [
          {
            description: '53ft Semi Trailer Transit (2 Days)',
            quantity: 2,
            unitPrice: 2000,
            discountPercent: 10 // Net: 4000 - 400 = 3600
          }
        ],
        taxRatePercent: 5 // Tax: 180 -> Total: 3780
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.subtotal, 4000);
    assert.equal(res.body.data.discountAmount, 400);
    assert.equal(res.body.data.taxAmount, 180);
    assert.equal(res.body.data.totalAmount, 3780);
  });

  await t.test('GET /api/v1/audit returns immutable audit ledger', async () => {
    const res = await request(app)
      .get('/api/v1/audit')
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
  });

  await t.test('GET /api/v1/merchants returns seeded merchant roster', async () => {
    const res = await request(app)
      .get('/api/v1/merchants')
      .set('Authorization', `Bearer ${authToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.length >= 10);
    assert.equal(res.body.data[0].status, 'Active');
  });

  await t.test('POST /api/v1/merchants/portal/login authenticates merchant with tenant-scoped token', async () => {
    const res = await request(app)
      .post('/api/v1/merchants/portal/login')
      .send({
        email: 'info@deliveryplus.com.au',
        password: 'EnterpriseCRM2026!'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.token);
    assert.equal(res.body.merchant.name, 'Delivery Plus');
  });
});
