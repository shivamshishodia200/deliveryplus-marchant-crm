# DeliveryPlus Driver Mobile App — API Compatibility & Boundary Contract

> **CRITICAL DIRECTIVE**: The React Native Driver mobile app (`DeliveryPlusDriverApp`) is **complete, verified on physical iPhone hardware, and strictly ON HOLD**.  
> No mobile source files, iOS builds, Cocoapods, native bridges, or mobile API contracts shall be altered or rebuilt during this web upgrade.

---

## 1. Boundary Contract & Integration Status

| Component | Status | Verification State | Operational Approach |
| :--- | :---: | :---: | :--- |
| **Driver Mobile App (iOS / Android)** | **ON HOLD** | Pre-verified on physical iPhone (`Raj’s iPhone`) | **Untouched**. Zero edits, zero rebuilds, zero deployments. |
| **Driver Authentication Contract** | Preserved | Pre-verified (`Bearer <JWT>`) | Consumed as-is by web dispatch adapters. |
| **Location & Telemetry Contract** | Preserved | Pre-verified (`NativeLocationManager.swift`) | Additive backend ingestion adapter receives coordinates safely. |
| **Physical App Live Verification** | **DEFERRED** | Deferred during web scope | Isolated mock fixtures used in automated tests; live physical device re-verification marked deferred. |

---

## 2. Ingestion Adapter Specification

The web dispatch center receives driver telemetry without changing the driver app's request format:

### Endpoint: `POST /api/v1/dispatch/telemetry`
- **Authentication**: `Bearer <token>` (Issued to User with `role: 'driver'`)
- **Incoming Driver Payload**:
  ```json
  {
    "coords": {
      "latitude": -37.8136,
      "longitude": 144.9631,
      "accuracy": 5.0,
      "altitude": 45.2,
      "speed": 12.5,
      "heading": 180.0
    },
    "timestamp": 1729683400000,
    "battery": 85,
    "isOnline": true
  }
  ```
- **Backend Behavior**:
  - Updates driver's `lastLocation` in `DriverProfile` / `User`.
  - Records real timestamp and speed.
  - Broadcasts to Dispatcher Map (`/api/v1/dispatch/map-data`).
  - Rejects invalid coordinates (`lat < -90 || lat > 90`) and stale fixes (`age > 300s`) without throwing runtime errors.

---

## 3. Truthful Telemetry Display Policy

1. **No Simulated Movement**: The web dispatch map never generates random or synthetic driver movements.
2. **Honest Stale State**: If a driver has not reported a GPS coordinate in over 5 minutes, their status is explicitly badged as `Stale / Offline` with the exact duration since last fix.
3. **Provider Failures**: If geocoding or GPS hardware is unavailable, the UI surfaces a clean fallback banner rather than showing falsified coordinates.
