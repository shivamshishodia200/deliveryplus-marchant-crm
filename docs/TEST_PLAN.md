# DeliveryPlus CRM - Comprehensive Test Plan & Acceptance Matrix

## 1. Test Strategy Overview
To satisfy enterprise rigor, testing spans three levels:
1. **Unit & Schema Validation**: Testing Zod input schemas, financial calculation engines, and Mongoose model hooks.
2. **API Integration Tests (Supertest)**: Testing authentication, RBAC boundaries, lead conversion, pipeline transitions, and calculations.
3. **Frontend Component & Workflow Tests**: UI state validation, form error handling, authenticated navigation guards, and responsive layout.

---

## 2. Test Suites

### 2.1. Authentication & Security Test Suite
- `POST /api/v1/auth/login`: Accepts valid credentials, returns user profile, sets secure HttpOnly cookie.
- `POST /api/v1/auth/login`: Rejects invalid email or password with uniform error message (anti-enumeration).
- `GET /api/v1/auth/me`: Verifies active session token; returns 401 when token is missing or forged.
- `POST /api/v1/auth/logout`: Clears session cookie and invalidates session token.

### 2.2. RBAC & Access Control Test Suite
- Non-admin attempting to fetch `GET /api/v1/audit` returns `403 Forbidden`.
- Non-admin attempting to delete a user account returns `403 Forbidden`.
- Sales rep can only update their assigned lead unless granted manager/admin privileges.

### 2.3. Lead Lifecycle & Conversion Test Suite
- Create lead with validation errors (e.g. invalid email) returns `400 Bad Request` with structured error details.
- Valid lead creation assigns default score and logs audit entry.
- `POST /api/v1/leads/:id/convert`:
  - Atomically creates Contact record.
  - Atomically creates Company record (if name provided).
  - Atomically creates Opportunity in `discovery` stage.
  - Marks Lead `isConverted: true` with reference IDs.
  - Verifies all four records are linked correctly.

### 2.4. Sales Pipeline & Stage Transitions Test Suite
- Moving Opportunity from `discovery` to `closed_won` automatically sets `wonDate` and recalculates win probability to 100%.
- Invalid stage update request returns `400 Bad Request`.
- Pipeline endpoint correctly aggregates deal values by stage for Kanban visualization.

### 2.5. Quotation Engine Test Suite
- Server calculates subtotal, discounts, and taxes authoritative from line items.
- Client-submitted fraudulent totals are rejected and overridden by server arithmetic.
- Transitioning quotation to `accepted` updates audit log and links to opportunity.

---

## 3. Acceptance Verification Checklist
- [x] Zero hardcoded mock metrics in dashboard (all metrics aggregated dynamically from DB).
- [x] Full DeliveryPlus theme fidelity: deep navy sidebar, cyan/teal highlights, coral CTA buttons, metric trend cards.
- [x] Responsive layout with mobile sidebar drawer and desktop collapsible menu.
- [x] Interactive Kanban board for Opportunity pipeline.
- [x] Automated test runner passes with 100% green exit code.
