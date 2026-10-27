# DeliveryPlus CRM - RESTful API Specification (`/api/v1`)

## 1. Global API Conventions
- **Base URL**: `/api/v1`
- **Content Type**: `application/json`
- **Authentication**: JWT token sent via `Authorization: Bearer <token>` header or `access_token` secure cookie.
- **Consistent Response Envelope**:
```json
{
  "success": true,
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```
- **Consistent Error Envelope**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided.",
    "details": []
  }
}
```

---

## 2. API Endpoints Catalog

### 2.1. Authentication & Session (`/api/v1/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Public | Authenticate user, set session cookie & return user object |
| `POST` | `/auth/logout` | Authenticated | Invalidate session & clear cookies |
| `GET` | `/auth/me` | Authenticated | Retrieve profile and permissions of current user |
| `PUT` | `/auth/update-password`| Authenticated | Secure password change |
| `POST` | `/auth/refresh` | Public | Refresh token rotation |

### 2.2. Users & Team Management (`/api/v1/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/users` | Admin+ | List all team members with pagination & role filters |
| `POST` | `/users` | Admin+ | Create/invite a new staff member |
| `GET` | `/users/:id` | Authenticated | User details |
| `PUT` | `/users/:id` | Admin+ | Update user role, status or department |
| `DELETE` | `/users/:id` | SuperAdmin | Deactivate/delete user account |

### 2.3. Leads Management (`/api/v1/leads`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/leads` | Authenticated | List leads with filters (status, owner, source, search) |
| `POST` | `/leads` | Authenticated | Create a new lead |
| `GET` | `/leads/:id` | Authenticated | Lead details with populated activity timeline |
| `PUT` | `/leads/:id` | Authenticated | Update lead details |
| `POST` | `/leads/:id/convert`| Authenticated | Atomic conversion to Contact, Company & Opportunity |
| `DELETE` | `/leads/:id` | Admin+ | Archive / soft delete lead |

### 2.4. Contacts (`/api/v1/contacts`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/contacts` | Authenticated | Searchable directory of client contacts |
| `POST` | `/contacts` | Authenticated | Add a contact |
| `GET` | `/contacts/:id` | Authenticated | Contact profile with related deals and history |
| `PUT` | `/contacts/:id` | Authenticated | Update contact details |
| `DELETE` | `/contacts/:id`| Admin+ | Archive contact |

### 2.5. Companies (`/api/v1/companies`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/companies` | Authenticated | List enterprise accounts and organizations |
| `POST` | `/companies` | Authenticated | Create company record |
| `GET` | `/companies/:id`| Authenticated | Detailed company profile with associated contacts |
| `PUT` | `/companies/:id`| Authenticated | Update company metadata and tier |
| `DELETE` | `/companies/:id`| Admin+ | Soft delete company |

### 2.6. Opportunities & Pipeline (`/api/v1/opportunities`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/opportunities`| Authenticated | Deals list or pipeline Kanban grouped by stage |
| `POST` | `/opportunities`| Authenticated | Create new opportunity |
| `GET` | `/opportunities/:id` | Authenticated | Opportunity details, quotations, and timeline |
| `PUT` | `/opportunities/:id` | Authenticated | Update opportunity |
| `PATCH`| `/opportunities/:id/stage` | Authenticated | Drag-and-drop stage change with server validation |
| `DELETE`| `/opportunities/:id`| Admin+ | Delete/archive opportunity |

### 2.7. Activities & Timeline (`/api/v1/activities`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/activities` | Authenticated | Filtered timeline by lead, contact, or opportunity |
| `POST` | `/activities` | Authenticated | Log a call, meeting, note or email |

### 2.8. Tasks & Reminders (`/api/v1/tasks`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/tasks` | Authenticated | Tasks for authenticated user (due today, pending, completed) |
| `POST` | `/tasks` | Authenticated | Create task with assignment and deadline |
| `PUT` | `/tasks/:id` | Authenticated | Edit task details or mark complete |
| `DELETE` | `/tasks/:id` | Authenticated | Delete task |

### 2.9. Products & Services (`/api/v1/products`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/products` | Authenticated | Product catalogue with pricing & categories |
| `POST` | `/products` | Manager+ | Create a new SKU / product |
| `PUT` | `/products/:id`| Manager+ | Update pricing or description |
| `DELETE` | `/products/:id`| Admin+ | Soft archive product |

### 2.10. Quotations & Proposals (`/api/v1/quotations`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/quotations` | Authenticated | Quotation ledger with approval and sending status |
| `POST` | `/quotations` | Authenticated | Create quotation with server-calculated line item totals |
| `GET` | `/quotations/:id`| Authenticated | Full quote breakdown with products and pricing |
| `PATCH`| `/quotations/:id/status` | Authenticated | Transition status (draft -> sent -> accepted/rejected) |

### 2.11. Support Tickets (`/api/v1/tickets`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/tickets` | Authenticated | Customer issue tickets with SLA and priority |
| `POST` | `/tickets` | Authenticated | File new ticket |
| `GET` | `/tickets/:id` | Authenticated | View ticket thread and conversation history |
| `POST` | `/tickets/:id/comments` | Authenticated | Add public or internal agent comment |
| `PATCH`| `/tickets/:id/status` | Authenticated | Update status (open -> in_progress -> resolved) |

### 2.12. Dashboard & Analytics (`/api/v1/reports`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/reports/dashboard`| Authenticated | Aggregated metrics: total leads, pipeline revenue, win rate, tasks |
| `GET` | `/reports/pipeline` | Authenticated | Sales funnel stage breakdown and forecast |
| `GET` | `/reports/export` | Manager+ | Authorized CSV export of Leads, Contacts, or Deals |

### 2.13. Notifications (`/api/v1/notifications`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/notifications` | Authenticated | Unread and recent alerts for current user |
| `PATCH`| `/notifications/:id/read` | Authenticated | Mark alert as read |
| `PATCH`| `/notifications/read-all` | Authenticated | Mark all current alerts read |

### 2.14. Audit Logs (`/api/v1/audit`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/audit` | Admin+ | Read-only compliance audit trail with date/action filters |

---

## 3. OpenAPI / Swagger Documentation
Interactive documentation will be hosted directly on the server at `http://localhost:5000/api/v1/docs` using `swagger-ui-express`.
