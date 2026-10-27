# DeliveryPlus CRM - Enterprise Architecture & Project Plan

## 1. Executive Summary & Vision
DeliveryPlus CRM is an enterprise-grade Customer Relationship Management platform engineered for logistics, service, moving, and B2B enterprises. It orchestrates the full customer lifecycle:
`Lead → Contact → Company → Opportunity → Activity → Proposal/Quotation → Customer → Invoicing/Payment → Reporting`

Built with modern full-stack standards:
- **Frontend**: React 18 / Vite / Tailwind CSS / TanStack Query / React Hook Form / Zod / Lucide Icons / Recharts
- **Backend**: Node.js LTS / Express.js / MongoDB (Mongoose) / RESTful APIs under `/api/v1` / OpenAPI Swagger
- **Security**: Argon2/Bcrypt password hashing, HttpOnly secure cookies, JWT session rotation, Helmet, rate limiting, granular RBAC, audit logging
- **Theme & UX**: Custom DeliveryPlus design system featuring deep navy sidebar (`#0a1128`), vibrant teal accents (`#00b4d8`), coral/orange primary CTAs (`#f97316`), KPI cards with status metrics, pipeline Kanban boards, and dual-pane enterprise auth layout.

---

## 2. Ultra-Readable Modular Folder Structure

```
deliveryplus-marchant/
├── docs/                                # Architecture & System Design
│   ├── PROJECT_PLAN.md                 # Architecture, milestones, roadmap
│   ├── DATABASE_DESIGN.md              # Collections, schemas, indexes, retention
│   ├── API_SPECIFICATION.md            # RESTful API endpoints & OpenAPI spec
│   ├── SECURITY_MODEL.md               # RBAC matrix, tokens, data protection
│   └── TEST_PLAN.md                    # Integration & acceptance testing suites
│
├── backend/                             # Express + Mongoose REST API Monolith
│   ├── src/
│   │   ├── config/                     # Environment, database, logger, constants
│   │   │   ├── db.js                   # MongoDB Mongoose connection handler
│   │   │   ├── env.js                  # Validated environment configurations
│   │   │   ├── logger.js               # Structured logger
│   │   │   └── swagger.js              # OpenAPI 3.0 configuration
│   │   ├── middleware/                 # Express cross-cutting middleware
│   │   │   ├── auth.middleware.js      # JWT & session verification
│   │   │   ├── role.middleware.js      # RBAC permission checks
│   │   │   ├── validate.middleware.js  # Zod schema request validation
│   │   │   ├── rateLimiter.js          # IP & user-based rate limiters
│   │   │   ├── audit.middleware.js     # Automatic audit event logging
│   │   │   └── error.middleware.js     # Centralized error handler
│   │   ├── models/                     # Enterprise Mongoose Schemas
│   │   │   ├── User.js                 # Accounts, passwords, MFA, session tracking
│   │   │   ├── Role.js                 # Roles and granular permission sets
│   │   │   ├── Lead.js                 # Prospects, scoring, source, status
│   │   │   ├── Contact.js              # Individual business contacts
│   │   │   ├── Company.js              # Accounts / Corporate organizations
│   │   │   ├── Opportunity.js          # Deals, pipeline stages, revenue forecasting
│   │   │   ├── Activity.js             # Calls, meetings, notes, emails timeline
│   │   │   ├── Task.js                 # To-dos, deadlines, assignments
│   │   │   ├── Quotation.js            # Proposals, calculated line items, taxes
│   │   │   ├── Product.js              # Catalogue, SKUs, standard pricing
│   │   │   ├── SupportTicket.js        # SLA, priority, tickets, comments
│   │   │   ├── Notification.js         # In-app alerts, read state
│   │   │   ├── AuditLog.js             # Immutable compliance trail
│   │   │   └── Setting.js              # Organization profile, currency, stages
│   │   ├── modules/                    # Feature-based business logic (Controller + Service)
│   │   │   ├── auth/                   # Login, register, logout, me, refresh
│   │   │   ├── users/                  # User lifecycle & team assignments
│   │   │   ├── leads/                  # Lead CRUD, scoring, convert-to-deal
│   │   │   ├── contacts/               # Contact profiles & company linkage
│   │   │   ├── companies/              # Organization management
│   │   │   ├── opportunities/          # Pipeline stages, stage drag updates
│   │   │   ├── activities/             # Record timelines & notes
│   │   │   ├── tasks/                  # Task scheduling & completion
│   │   │   ├── quotations/             # Quotation calculations & status
│   │   │   ├── products/               # SKU inventory & pricing
│   │   │   ├── support/                # Customer service tickets
│   │   │   ├── notifications/          # Push & in-app alerts
│   │   │   ├── reports/                # Analytics & aggregated KPI metrics
│   │   │   ├── settings/               # Org branding & workflow settings
│   │   │   └── audit/                  # Audit trail inspection
│   │   ├── utils/                      # Response helpers, security utilities
│   │   ├── seeds/                      # Seed scripts with realistic sample data
│   │   │   └── seedData.js             # SuperAdmin, Admin, Sales, sample records
│   │   ├── tests/                      # Automated test scripts (Supertest / Node runner)
│   │   ├── app.js                      # Express application assembly
│   │   └── server.js                   # Server entrypoint with graceful shutdown
│   ├── package.json
│   └── .env.example
│
├── frontend/                            # Vite + React 18 Single Page Application
│   ├── src/
│   │   ├── app/                        # Root application wrappers
│   │   │   ├── router.jsx              # React Router v6 definitions & guards
│   │   │   ├── App.jsx                 # App root with QueryClient & Providers
│   │   │   └── AuthContext.jsx         # Global authentication & user state
│   │   ├── components/                 # Reusable Design System components
│   │   │   ├── layout/                 # Sidebar, Topbar, AppShell, PageHeader
│   │   │   ├── ui/                     # Button, Badge, Modal, Card, Dropdown, Tabs
│   │   │   ├── forms/                  # Input, Select, Textarea, FormField
│   │   │   └── tables/                 # DataTable, Pagination, SearchFilterBar
│   │   ├── features/                   # Business modules & screens
│   │   │   ├── auth/                   # Split-pane Login, ForgotPassword
│   │   │   ├── dashboard/              # Metrics, Donut chart, Recent records, KPIs
│   │   │   ├── leads/                  # Lead management, modal, convert dialog
│   │   │   ├── contacts/               # Contacts directory & profiles
│   │   │   ├── companies/              # Enterprise company accounts
│   │   │   ├── opportunities/          # Visual Kanban pipeline & table
│   │   │   ├── tasks/                  # Task board, due dates, priority
│   │   │   ├── quotations/             # Proposal builder with live calculations
│   │   │   ├── products/               # Catalog, SKUs & pricing
│   │   │   ├── support/                # Support tickets & resolution status
│   │   │   ├── reports/                # Charts, revenue trends, CSV export
│   │   │   ├── settings/               # Org settings, users, custom fields
│   │   │   └── audit/                  # Audit log viewer
│   │   ├── hooks/                      # Custom React hooks (useDebounce, useAuth, etc.)
│   │   ├── services/                   # Axios API service clients
│   │   ├── styles/                     # Tailwind directives & design tokens
│   │   └── main.jsx                    # React DOM render entry
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── index.html
│   └── .env.example
│
├── package.json                        # Root package for workspace orchestration
└── README.md                           # System overview & quickstart guide
```

---

## 3. Technology Stack & Decision Matrix
| Layer | Chosen Technology | Justification |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + Vite | High-performance bundling, modular component ecosystem |
| **Styling & Theme** | Tailwind CSS + Custom CSS Variables | Direct implementation of DeliveryPlus brand palette |
| **State Management** | TanStack React Query v5 | Automatic caching, optimistic updates, background refetching |
| **Forms & Validation** | React Hook Form + Zod | Type-safe, declarative schemas with zero performance overhead |
| **Icons & Visuals** | Lucide React + Recharts | Consistent iconography and responsive SVG charting |
| **Backend Runtime** | Node.js (v24 LTS) + Express | Production-hardened REST API monolith |
| **Database** | MongoDB + Mongoose ODM | Document flexibility for custom fields, rich relationships |
| **Auth & Security** | JWT (HttpOnly Cookie) + Bcrypt | Mitigates XSS/CSRF token theft; strictly follows prompt rules |
| **API Docs** | Swagger / OpenAPI 3.0 | Living interactive documentation under `/api/v1/docs` |

---

## 4. Delivery Milestones & Execution Path
1. **Milestone 1**: Project Plan, Specifications, Design Tokens, Root orchestration, App Shell.
2. **Milestone 2**: Database connection, Mongoose schemas, Validation, Authentication, RBAC, Seed script.
3. **Milestone 3**: Leads, Contacts, Companies, Main Dashboard aggregations.
4. **Milestone 4**: Opportunities (Kanban & Table), Activities timeline, Tasks, In-App Notifications.
5. **Milestone 5**: Products, Quotations (authoritative server pricing), Support Tickets, Audit Logs.
6. **Milestone 6**: Reports & Analytics, Global Search, CSV Export, Settings.
7. **Milestone 7**: Integration tests, security audit, regression validation.
8. **Milestone 8**: Production build verification and final handover documentation.
