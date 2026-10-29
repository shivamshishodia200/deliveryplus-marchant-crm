# DeliveryPlus CRM — Deployment, Environment & Rollback Architecture

This guide details runtime configuration, ports, migration safety, backup procedures, health monitoring, and rollback strategies.

---

## 1. Runtime Environment & Ports

| Component | Default Port | macOS Port (AirPlay Workaround) | Config Location | Notes |
| :--- | :---: | :---: | :--- | :--- |
| **Backend REST API** | `5000` | **`5001`** | `backend/.env` -> `PORT` | macOS AirPlay Receiver listens on `5000`. Port `5001` avoids `EADDRINUSE`. |
| **Frontend Vite App** | `5173` | **`5173`** | `frontend/vite.config.js` | Proxies `/api` -> `http://localhost:5001`. |
| **MongoDB Instance** | `27017` | **`27017`** | `backend/.env` -> `MONGODB_URI` | Standalone local or MongoDB Atlas replica set. |

---

## 2. Environment Variables Specification

### `backend/.env`
```ini
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/deliveryplus_crm
JWT_SECRET=super_secret_enterprise_deliveryplus_crm_key_2026_!@#$
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
COOKIE_SECRET=cookie_secret_deliveryplus_enterprise_key_9988
```

---

## 3. Database Migration Safety & Non-Destructive Deployments

1. **Zero Collection Drops**: In production, seed scripts must never execute `.deleteMany({})` or drop indexes.
2. **Additive Schemas**: New fields (`DeliveryTask`, `Team`, `Vehicle`, `DriverProfile`) have sensible defaults (`status: 'Unassigned'`, `isArchived: false`).
3. **Reversible Migrations**: If rollback is required, existing CRM collections (`Lead`, `Opportunity`, `Quotation`, `User`) remain completely intact and functional.

---

## 4. Rollback Plan

If an unexpected regression occurs during deployment:
1. **Application Rollback**:
   ```bash
   git checkout HEAD~1
   npm run build
   ```
2. **Database State**:
   - New collections (`deliverytasks`, `teams`, `vehicles`) are quarantined without affecting legacy CRM data.
   - Any added fields on `User` or `Merchant` are ignored by older code due to Mongoose schema stripping.
3. **Health Verification**:
   - `curl -f http://localhost:5001/api/v1/health`
   - Verify HTTP 200 `{"status":"healthy"}`.
