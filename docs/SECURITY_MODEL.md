# DeliveryPlus CRM - Security Model & Access Control Architecture

## 1. Security Architecture & Threat Boundaries
DeliveryPlus CRM implements defense-in-depth across the entire application lifecycle:
1. **Network & Transport Layer**:
   - Helmet HTTP headers (`Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`).
   - Strict CORS policy with explicit origin whitelisting (`http://localhost:5173` in development, dedicated domain in production).
   - Rate limiting on authentication routes (max 10 attempts per 15 minutes per IP) and API endpoints.
2. **Authentication & Session Handling**:
   - Password hashing with Bcrypt using a computational cost factor of 12.
   - HttpOnly, SameSite=Strict cookies to guard against XSS token harvesting.
   - Access token + Refresh token rotation to allow immediate session revocation.
   - Automatic session invalidation upon password reset or account suspension.
3. **Data Access & Injection Prevention**:
   - Protection against NoSQL operator injection (disallowing arbitrary `$` and `.` in unvalidated request parameters).
   - Strict input validation with Zod schemas before any data touches controller or database layers.
   - Mass assignment protection via explicit field whitelisting.

---

## 2. Role-Based Access Control (RBAC) Matrix

| Feature / Resource | Super Admin | Admin | Sales Manager | Sales Rep | Support Agent |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **System Settings & Audit Logs** | Full | Read-Only | Denied | Denied | Denied |
| **User & Team Management** | Full | Full (Except Super Admin) | View Team | Denied | Denied |
| **Leads (Create, Read, Edit)** | Full | Full | Full | Assigned Only | Denied |
| **Lead Conversion** | Full | Full | Full | Assigned Only | Denied |
| **Opportunities & Pipeline** | Full | Full | Full | Assigned Only | Read Only |
| **Quotations & Pricing** | Full | Full | Full / Approve | Create / Edit Own | Read Only |
| **Product Catalogue Editing** | Full | Full | Full | Read Only | Read Only |
| **Support Tickets** | Full | Full | View All | Assigned Only | Full |
| **Reports & CSV Data Export** | Full | Full | Full | Limited | Denied |
| **Delete / Archive Records** | Full | Full | Soft Delete Own | Denied | Denied |

---

## 3. Sensitive Data Handling
- **Passwords**: Never stored in plain text; never included in API responses or log statements (`select: false` on Mongoose `password` field).
- **Audit Logs**: Immutable. Once written, records cannot be modified or deleted via API.
- **Error Responses**: Generic error messages in production; stack traces and internal paths are strictly logged to internal logs and never exposed to the client.
