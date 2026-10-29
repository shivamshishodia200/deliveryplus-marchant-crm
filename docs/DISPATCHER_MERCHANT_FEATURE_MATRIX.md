# DeliveryPlus Dispatcher & Merchant Operations — Feature Matrix

This matrix specifies all operational screens, components, user actions, data fields, and security boundaries.

---

## 1. Operations Dashboard (`/`)

| Widget / Component | Data Source | Primary Actions | Permissions | Empty / Edge States |
| :--- | :--- | :--- | :--- | :--- |
| **KPI Metric Strip** | Database aggregation over `DeliveryTask` | Click opens filtered task list (e.g. Active, Completed Today) | Authenticated staff | Shows `0` with informative subtitle |
| **Active Tasks by Status** | Grouped count by status | Click bar/status navigates to corresponding tab | Authenticated staff | "No active tasks in progress" |
| **Task History Chart** | Daily created vs completed over past 7/14/30 days | Range selector (7d, 14d, 30d) | Authenticated staff | Zero baseline axes |
| **Active Team Members** | `User` (role='driver') + active tasks count | Click driver navigates to Map filtered to driver | Dispatcher / Admin | "No drivers currently on duty" |
| **Recent Failed Tasks** | Tasks with status='Failed' | View failure reason, Retry/Reassign task | Dispatcher / Admin | "Zero delivery exceptions today" |
| **Active Tasks by Merchant**| Grouped count by merchant | Filter task list by selected merchant | Authenticated staff | "No merchant activity" |

---

## 2. Delivery Tasks Workspace (`/tasks`)

| Screen Section | Elements & Controls | Field Set | Behavior & Rules |
| :--- | :--- | :--- | :--- |
| **Header Toolbar** | - Date Range Picker<br>- Status Tabs (`Active`, `Completed`, `Failed`, `New`, `Cancelled`, `Search`)<br>- Search input<br>- "New Task" Button<br>- "Assign Driver" Button<br>- "Export CSV" Button | `search`, `tab`, `startDate`, `endDate`, `merchantId`, `team` | Real-time TanStack Query refetch, debounced search, preserved pagination |
| **Data Table** | - Multi-select checkboxes<br>- Status dot indicator<br>- Task Type badge<br>- Priority indicator<br>- Action menu (Edit, Assign, Print Label, Cancel) | Columns: Task #, Destination Address, Recipient, Merchant, Scheduled/Deadline, Driver, Type, Status | Responsive density, sticky table header, mobile detail drawer |
| **New/Edit Task Modal** | **Tab 1: Overview** | Task Type, Priority, External Reference, Merchant, Service, Notes, Pickup Location, Destination Address, Coordinates, Floor/Unit, Complete Before, Team, Driver, Completion Requirements (Photo, Signature), Shipping Fee, Duration, Configurable Fields (Paperwork, Scheduled For, Remarks) | Server Zod validation, optimistic lock guard (`version`), Save & Close, Save & Add Another |
| | **Tab 2: Items** | Product SKU/Name, Quantity, Weight (kg), Dimensions (L x W x H cm), Unit Price | Add/remove row, calculates total packages |
| | **Tab 3: Attachments** | Drag & drop file upload, file list, file size, thumbnail preview, delete | File size limit (10MB), protected access |

---

## 3. Map & Dispatch Center (`/map`)

| Component | Features | Data Synchronization |
| :--- | :--- | :--- |
| **Map Canvas** | Visual map showing geocoded pins for delivery tasks and vehicle/driver location icons | Pins color-coded by task status: Blue=Assigned, Orange=Transit, Green=Completed, Rose=Failed, Slate=Unassigned |
| **Collapsible Side Panel** | Tabs: **Tasks** (Unassigned, Assigned, Completed) and **Drivers** (Online/Offline, Workload, Search) | Clicking a task in the panel centers and highlights the map pin; clicking a map pin scrolls to and highlights the task in the panel |
| **Driver Telemetry Cards** | Driver name, assigned vehicle, active jobs count, online indicator, speed/battery | Honest offline/stale indicators; no simulated random movement |
| **Create Route / Assign** | Select multiple tasks, assign to driver, order delivery stops | Saves ordered stop sequence on backend |

---

## 4. Merchant Management & Merchant Portal

### Internal Merchant Hub (`/merchants`)
- Directory table: Merchant Name, Code, Email, Phone, Address, Linked Team, Status, Actions.
- Add/Edit Merchant Form: Name, Login Email, Initial Password / Invite, Linked Team, Store Details, Store Hours, Logo, and **12 Explicit Permission Switches**.
- One-Click Portal Link: Direct navigation to the Merchant Portal for testing and support.

### Dedicated Merchant Portal (`/merchant-portal`)
- **Strict Tenant Scoping**: Only queries and displays tasks where `merchant = req.merchant._id`.
- **Dynamic Permission Enforcement**:
  1. `create_task`: Renders "New Delivery Order" button; rejected on backend if false.
  2. `edit_task`: Allows editing unassigned/pending orders.
  3. `delete_task`: Allows cancellation/archival of unassigned orders.
  4. `upload_task`: Enables CSV bulk import.
  5. `assign_task_to_driver`: Enables manual driver assignment (only to linked team drivers).
  6. `print_shipping_label`: Enables barcode/shipping label modal.
  7. `view_shipping_fee`: Controls display of financial fees; redacted from API response if false.
  8. `edit_shipping_fee`: Enables custom shipping fee override.
  9. `add_contact`: Enables merchant address book entry creation.
  10. `edit_contact`: Enables address book modification.
  11. `delete_contact`: Enables address book deletion.
  12. `manage_product`: Enables merchant product catalogue management.
