# DeliveryPlus Merchant Permissions & Multi-Tenant Security Policy

This document details the 12 explicit merchant permission switches, their backend enforcement rules, tenant boundary guarantees, and fee redaction logic.

---

## 1. The 12 Merchant Permission Switches

Each `Merchant` account contains a discrete boolean permissions map stored in MongoDB:

```json
{
  "create_task": true,
  "edit_task": true,
  "delete_task": false,
  "upload_task": true,
  "assign_task_to_driver": false,
  "print_shipping_label": true,
  "view_shipping_fee": true,
  "edit_shipping_fee": false,
  "add_contact": true,
  "edit_contact": true,
  "delete_contact": false,
  "manage_product": true
}
```

---

## 2. Server-Side Enforcement Matrix

| Permission Key | Protected Endpoint(s) | HTTP Method | Server Enforcement Rule | If Denied Response |
| :--- | :--- | :---: | :--- | :--- |
| **`create_task`** | `/api/v1/merchants/portal/tasks` | `POST` | Verified on creation requests originating from merchant portal | `403 Forbidden: "Merchant lacks permission to create tasks"` |
| **`edit_task`** | `/api/v1/merchants/portal/tasks/:id` | `PUT` | Verified on updates to non-terminal tasks | `403 Forbidden: "Merchant lacks permission to edit tasks"` |
| **`delete_task`** | `/api/v1/merchants/portal/tasks/:id` | `DELETE` | Verified before soft-deleting/cancelling tasks | `403 Forbidden: "Merchant lacks permission to cancel tasks"` |
| **`upload_task`** | `/api/v1/merchants/portal/tasks/import` | `POST` | Verified before parsing and saving CSV task rows | `403 Forbidden: "Merchant lacks permission to bulk import tasks"` |
| **`assign_task_to_driver`** | `/api/v1/merchants/portal/tasks/:id/assign` | `POST` | Allows assigning driver directly, restricted to drivers in merchant's linked team | `403 Forbidden: "Merchant lacks permission to assign drivers"` |
| **`print_shipping_label`** | `/api/v1/merchants/portal/tasks/:id/label` | `GET` | Generates printable barcode payload | `403 Forbidden: "Merchant lacks permission to print shipping labels"` |
| **`view_shipping_fee`** | `/api/v1/merchants/portal/tasks*` | `GET` | **Redaction Rule**: When `false`, the `shippingFee` field is stripped from all outgoing JSON responses | Response contains `"shippingFee": null` or field omitted |
| **`edit_shipping_fee`** | `/api/v1/merchants/portal/tasks*` | `POST`/`PUT` | Validates whether submitted `shippingFee` override is permitted | Reverts fee to automated system calculation |
| **`add_contact`** | `/api/v1/merchants/portal/contacts` | `POST` | Creates saved recipient in merchant address book | `403 Forbidden: "Merchant lacks permission to add contacts"` |
| **`edit_contact`** | `/api/v1/merchants/portal/contacts/:id`| `PUT` | Updates saved recipient | `403 Forbidden: "Merchant lacks permission to edit contacts"` |
| **`delete_contact`** | `/api/v1/merchants/portal/contacts/:id`| `DELETE` | Removes saved recipient | `403 Forbidden: "Merchant lacks permission to delete contacts"` |
| **`manage_product`** | `/api/v1/merchants/portal/products` | `POST`/`PUT` | Allows managing merchant product catalogue/SKUs | `403 Forbidden: "Merchant lacks permission to manage products"` |

---

## 3. Strict Multi-Tenant Isolation Guarantee

1. **Session-Derived Tenant Scope**:
   - The merchant identity is extracted strictly from the verified JWT token:
     ```javascript
     const merchantId = req.merchant._id;
     ```
   - An untrusted client-supplied `merchantId` in request bodies or query parameters is **never** used to determine ownership.

2. **Cross-Tenant Protection**:
   - All queries executed by merchant portal users are strictly scoped:
     ```javascript
     const task = await DeliveryTask.findOne({ _id: req.params.id, merchant: req.merchant._id });
     if (!task) return res.status(404).json({ error: 'Order not found' });
     ```
   - Under no circumstances can Merchant A view, search, export, or modify Merchant B's orders, contacts, or analytics.

3. **Fleet & Internal Data Redaction**:
   - Merchant Portal responses strictly redact:
     - Internal dispatcher notes.
     - Global GPS breadcrumbs of vehicles outside their active order delivery window.
     - Internal operational profit margins and non-merchant rates.
