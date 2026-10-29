# DeliveryPlus Dispatcher & Merchant Operations — Gap Audit & Capability Inventory

> **Document Status**: Baseline Audit Completed & Verified Against Active Repository  
> **Repository Root**: `/Users/rajjeet/Developer/deliveryplus-marchant-crm-main`  
> **Date**: October 2026  
> **Engineers**: DeliveryPlus Full-Stack Engineering Team  

---

## 1. Executive Summary

This gap audit cross-examines the requested Dispatcher and Merchant Portal capabilities against the current implementation in the DeliveryPlus repository. Each capability is audited for:
- Source of requirement (Screenshot-observed vs Proposed DeliveryPlus behavior)
- Existing frontend implementation
- Existing backend implementation
- Underlying database model
- Enforced permissions & scope
- Status: **Verified Working**, **Partial**, **Missing**, or **Blocked**
- Required implementation action & acceptance check

---

## 2. Comprehensive Capability Matrix

| Capability | Source | Existing Frontend | Existing Backend | Data Model | Permissions | Status | Implementation Action | Acceptance Check |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| **1. Operations Dashboard** | Screenshot-Observed | Partially implemented (`Dashboard.jsx`), sales-oriented metrics only | `/api/v1/reports/dashboard` aggregates CRM metrics (leads, opportunities, pipeline) | `Lead`, `Opportunity`, `Quotation` | Authenticated staff | **Partial** | Implement dedicated `/api/v1/delivery-tasks/dashboard` aggregation endpoint for active tasks, due today, completion history, team workload, and merchant distribution. Connect frontend widgets with refresh/date filters. | Dashboard returns exact counts matching database queries across UTC/business timezone boundaries without hardcoded numbers. |
| **2. Delivery Task Workspace (List & Tabs)** | Screenshot-Observed | Mock list in `TasksView.jsx` with in-memory `INITIAL_TASKS` | `/api/v1/tasks` exists but only handles internal CRM follow-up to-dos | `Task.js` (CRM to-do) | CRM user role | **Partial** | Create separate `DeliveryTask.js` model and `/api/v1/delivery-tasks` endpoint. Connect `TasksView.jsx` to TanStack Query with tabs: Active, Completed, Failed, New, Cancelled, Search. | Task tabs filter server-side records accurately; counts match database; pagination, date range, and search operate seamlessly. |
| **3. New/Edit Delivery Task Form (Overview, Items, Attachments)** | Screenshot-Observed | Static form inside `TasksView.jsx` with incomplete fields | None for delivery tasks | None | None | **Missing** | Build comprehensive 3-tab modal: 1) Overview (merchant, service, type, external ID, recipient, address, completeBefore, team, driver, completionRequirements, fees, configurable fields), 2) Items (SKU, qty, weight, dimensions), 3) Attachments (file uploads/metadata). | Full persistence of all 3 tabs into MongoDB; optimistic concurrency guard (`version`); validation errors displayed inline. |
| **4. Task Assignment & Workload** | Screenshot-Observed | Hardcoded dropdown | None | None | Admin/Dispatcher | **Missing** | Implement assignment endpoint `/api/v1/delivery-tasks/:id/assign`. Reconcile driver active task counts and log `AssignmentHistory`. | Assigning a task changes status to `Assigned`, updates driver workload metric, records history entry, and notifies driver. |
| **5. Map & Dispatch Center** | Screenshot-Observed | `TelematicsMap.jsx` with static `MOCK_PINS` and `MOCK_DRIVERS` | None | None | Admin/Dispatcher | **Partial** | Implement `/api/v1/dispatch/map-data` delivering real geocoded task coordinates, real driver telemetry locations, honest offline states, and task-driver synchronization. | Live tasks render as pins with status colors; side panel toggles Tasks/Drivers; clicking pin highlights corresponding list row. |
| **6. Users & Team Capacity** | Screenshot-Observed | `AdminManagement.jsx` manages staff roles | `/api/v1/users` lists users | `User.js` | SuperAdmin / Admin | **Partial** | Add `'dispatcher'` and `'driver'` roles to `User.js`. Create `Team.js` and `DriverProfile.js` models. Add tabs: All Users, Dispatchers, Drivers with capacity metrics and status. | Admins can view/filter dispatchers and drivers, manage team assignments, and view driver capacity. |
| **7. Merchants Directory & Management** | Screenshot-Observed | `MerchantsView.jsx` exists and connects to API | `/api/v1/merchants` CRUD exists with 12 permission toggles | `Merchant.js` | Admin / Dispatcher | **Verified Working** | Refine team linking, atomic credential generation, and ensure 12 permissions are strictly checked in all downstream endpoints. | Creating a merchant creates account record, persists all 12 permission flags, and allows seamless editing. |
| **8. Merchant Portal — Tenant-Scoped Tasks** | Proposed (DeliveryPlus) | `MerchantPortalView.jsx` with in-memory `mockOrders` | `/api/v1/merchants/portal/login` issues tenant token | `Merchant.js` | Merchant Tenant Token | **Partial** | Implement `/api/v1/merchants/portal/tasks` CRUD enforcing tenant isolation (`merchant: req.merchant._id`), checking the 12 permissions, and redacting `shippingFee` if disallowed. | Merchant A cannot view or modify Merchant B's tasks; permissions like `create_task` and `view_shipping_fee` are enforced at the API layer. |
| **9. Shipping Labels & Barcodes** | Screenshot-Observed | Browser alert in `MerchantPortalView.jsx` | None | `DeliveryTask.js` | Merchant / Staff (`print_shipping_label`) | **Missing** | Implement printable label view / modal displaying standard Code128 barcode format, QR tracking payload, address, recipient, and package details. | Clicking "Print Shipping Label" opens a clean, printable label preview with readable barcodes and correct task metadata. |
| **10. Telematics & Driver App Bridge** | Reference (On-Hold) | Telematics dashboard view | Separate production endpoint `api.deliveryplus.tech` | Mobile Core Location | Driver Auth | **Blocked / Read-Only** | Treat driver mobile app as strictly ON HOLD. Implement backend additive ingestion adapter `/api/v1/dispatch/telemetry` compatible with existing contracts. Mark physical device testing as deferred. | Ingestion endpoint accepts valid telemetry payloads without requiring changes to the React Native driver app. |
| **11. Fleet Vehicles & Maintenance** | Screenshot-Observed | `VehiclesView.jsx` with mock vehicles | None | None | Admin / Dispatcher | **Partial** | Create `Vehicle.js` model and `/api/v1/vehicles` endpoints. Link vehicles to drivers and odometer/service schedules. | Vehicle roster displays real records, driver assignments, and odometer service alerts. |
| **12. Driver Rostering & Shifts** | Screenshot-Observed | `RosterView.jsx` with static shifts | None | None | Admin / Dispatcher | **Partial** | Create roster shift data structure linking drivers to dates, shift times, and team allocations with conflict prevention. | Shifts display by week/day, preventing double-booking of drivers. |

---

## 3. Discrepancy & Ambiguity Resolutions

1. **Port Discrepancy**:
   - `README.md` previously cited port `5000`.
   - On macOS, port `5000` is bound to the AirPlay Receiver daemon (`ControlCenter`).
   - Resolution: Backend runs on port `5001`; Vite proxies `/api` to `http://localhost:5001`. Documented in `.env` and `vite.config.js`.

2. **CRM Tasks vs Delivery Tasks**:
   - CRM tasks (`models/Task.js`, `/api/v1/tasks`) are internal sales/support follow-up to-dos.
   - Delivery tasks (`models/DeliveryTask.js`, `/api/v1/delivery-tasks`) represent freight, parcels, and moving jobs with dispatch statuses, items, recipients, and tracking.
   - Resolution: Maintained as two separate, non-colliding entities and endpoints.

3. **Status Taxonomy**:
   - Canonical status lifecycle: `Unassigned` → `Assigning` → `Assigned` → `Processed` → `Loaded` → `Transit` → `Arrived` → `Completed` (or `Failed` / `Cancelled`).
   - Mobile driver app contracts: Compatible status transitions mapped without modifying the React Native application.
