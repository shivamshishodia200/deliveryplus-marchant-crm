# DeliveryPlus CRM — Advanced Enterprise Full-Stack System

An enterprise-grade Customer Relationship Management (CRM) application for moving, logistics, and service enterprises, built strictly to the DeliveryPlus visual design system.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v20+ LTS (tested on Node v24.12.0)
- **MongoDB**: Running locally on `mongodb://127.0.0.1:27017`

### 1. Setup & Installation
In the root directory, install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Seed Database
Populate MongoDB with realistic accounts, leads, deals, tasks, quotations, and support tickets:
```bash
cd backend
npm run seed
```

Default credentials created:
- **Super Admin**: `admin@deliveryplus.com` / `DeliveryPlus2026!`
- **Operations Manager**: `manager@deliveryplus.com` / `DeliveryPlus2026!`
- **Sales Rep**: `sarah.sales@deliveryplus.com` / `DeliveryPlus2026!`
- **Support Agent**: `support@deliveryplus.com` / `DeliveryPlus2026!`

### 3. Run Automated Tests
Execute backend integration tests:
```bash
cd backend
npm test
```
*11/11 tests passing (Health, Auth Login, RBAC, Lead Creation & Conversion, Kanban Aggregation, Quotation Calculations, Audit Logging)*.

### 4. Start Development Servers
Run backend:
```bash
cd backend
npm start
# API listening on http://localhost:5000
# Swagger OpenAPI docs: http://localhost:5000/api/v1/docs
```

Run frontend in another terminal:
```bash
cd frontend
npm run dev
# Vite Web App available at http://localhost:5173/
```

---

## 📁 Ultra-Readable Modular Folder Structure

```
deliveryplus-marchant/
├── docs/                               # Enterprise Architecture Documents
│   ├── PROJECT_PLAN.md                 # Architecture, roadmaps, milestones
│   ├── DATABASE_DESIGN.md              # Collections, schemas, relationships, indexes
│   ├── API_SPECIFICATION.md            # RESTful API endpoints & Swagger contracts
│   ├── SECURITY_MODEL.md               # RBAC matrix, sessions, and data protection
│   └── TEST_PLAN.md                    # Integration & acceptance testing matrix
│
├── backend/                             # Express.js + Mongoose REST API Monolith
│   ├── src/
│   │   ├── config/                     # Environment, MongoDB connection, logger, swagger
│   │   ├── middleware/                 # Auth, RBAC, Zod validation, rate limiting, audit, error
│   │   ├── models/                     # Mongoose schemas (User, Lead, Contact, Company, etc.)
│   │   ├── modules/                    # Feature-based business logic (Controller + Route + Validator)
│   │   │   ├── auth/                   # Session, HttpOnly cookie, login/logout, me
│   │   │   ├── users/                  # User accounts and roles
│   │   │   ├── leads/                  # CRUD, scoring, atomic conversion to Deal
│   │   │   ├── contacts/               # Contact directory & company linkage
│   │   │   ├── companies/              # Enterprise accounts & annual revenue
│   │   │   ├── opportunities/          # Kanban pipeline & stage transitions
│   │   │   ├── activities/             # Chronological timeline logs
│   │   │   ├── tasks/                  # To-dos, deadlines, and daily assignments
│   │   │   ├── quotations/             # Authoritative server calculations & pricing
│   │   │   ├── products/               # SKU catalog and service rates
│   │   │   ├── support/                # Ticket threads & SLA categories
│   │   │   ├── notifications/          # In-app real-time notification alerts
│   │   │   ├── reports/                # Aggregated metrics & CSV exports
│   │   │   ├── settings/               # Organization preferences & branding
│   │   │   └── audit/                  # Immutable compliance ledger
│   │   ├── seeds/                      # Seed script (seedData.js)
│   │   ├── tests/                      # Automated Supertest/Node test runner
│   │   ├── app.js                      # Express application assembly
│   │   └── server.js                   # Server listen with graceful shutdown
│   ├── package.json
│   └── .env.example
│
├── frontend/                            # Vite + React 18 Single Page Application
│   ├── src/
│   │   ├── app/                        # App root, React Router, AuthContext
│   │   ├── components/                 # Reusable Design System components
│   │   │   ├── layout/                 # Sidebar, Topbar, AppShell, Logo
│   │   │   └── ui/                     # Button, Badge, Card, Modal, LoadingSkeleton
│   │   ├── features/                   # Core Business Modules
│   │   │   ├── auth/                   # Split-pane Login (Matches Image 2)
│   │   │   ├── dashboard/              # Metrics, Donut chart, Recent Jobs (Matches Image 1)
│   │   │   ├── leads/                  # Leads table, search, filters, atomic conversion
│   │   │   ├── contacts/               # Contact profiles & company linkage
│   │   │   ├── companies/              # Enterprise accounts & tier badges
│   │   │   ├── opportunities/          # Interactive Kanban pipeline board & table
│   │   │   ├── tasks/                  # Task board, Due Today, urgent tags
│   │   │   ├── quotations/             # Quotation builder, line items & status
│   │   │   ├── products/               # SKU catalogue & pricing
│   │   │   ├── support/                # Support tickets & threaded comments
│   │   │   ├── reports/                # Analytics charts & CSV data exports
│   │   │   ├── admin/                  # Staff & user management, audit logs
│   │   │   └── settings/               # Organization branding & tax configuration
│   │   ├── services/                   # Centralized API service client
│   │   ├── styles/                     # Tailwind directives & design tokens
│   │   └── main.jsx                    # React DOM entry
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── package.json                        # Monorepo orchestration scripts
└── README.md
```

---

## 🎨 Design System & Theme Alignment
The application is custom-styled to match the provided DeliveryPlus branding:
- **Navy Palette**: Deep navy sidebar and hero (`#0a1128` / `#0b1329`)
- **Brand Teal**: Vibrant active highlights (`#00a8b5` / `#06b6d4`)
- **Coral / Orange CTA**: Primary action buttons and gradients (`#f97316` / `#ff5722`)
- **Metric Cards**: Distinct border strips (teal for total leads, emerald for won deals, crimson for tasks due today, purple for pipeline value) with percentage trend badges (+12%, +18%, +15%).
- **Interactive Kanban Pipeline**: Drag/move deals across Discovery, Qualification, Proposal, Negotiation, Won, and Lost.
- **Split Login Layout**: Left hero featuring brand pillars and night skyline illustration, right card featuring quick 1-click test credentials.
