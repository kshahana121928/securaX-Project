# 🛡️ SecuraX – Smart Personal Safety & Emergency Response Platform

> **Tagline:** *Your Safety. Your Control. Always.*  
> **Major Engineering Project & Portfolio Demonstration**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)

---

## 📌 Executive Summary

**SecuraX** is a modern, commercial-grade full-stack personal safety and emergency response web application engineered for everyone—including women, students, solo travellers, cab passengers, and elderly citizens. 

Designed specifically for **college project evaluations, placement interviews, and technical portfolio review**, SecuraX goes far beyond static landing pages or prototypes. It is a fully functional platform with a reactive frontend, a robust TypeScript REST API backend, MongoDB persistence (with zero-config in-memory fallback), real-time bidirectional WebSocket telemetry, interactive Leaflet geo-corridors, and anti-coercion stealth camouflaging.

---

## 🎨 Design System & Color Palette

SecuraX incorporates a modern, trustworthy safety-tech aesthetic inspired by SaaS emergency command centers and Google-style clean interfaces:

| Color Token | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Primary Navy** | `#0B1F3A` | Navigation bars, primary cards, authority headers |
| **Dark Navy** | `#071629` | Background shell, sidebar, footer |
| **Royal Blue** | `#2563EB` | Primary brand accents, primary buttons, route polyline |
| **Cyan** | `#06B6D4` | Real-time GPS beacon glow, live telemetry indicators |
| **Emergency Red** | `#DC2626` | Central SOS button, emergency alerts, siren active |
| **Success Green** | `#16A34A` | Protected status, verified helpers, safe confirmations |
| **Warning Amber** | `#F59E0B` | Route deviation warnings, overdue prompts, offline mode |
| **Light BG** | `#F4F7FB` | Dashboard workspace and page background |

---

## 🚀 15 Core Features Implemented

### 1. One-Tap Emergency SOS
- Prominent central pulsating Red SOS button with tactile feedback.
- 5-second countdown with instant dispatch override or cancellation.
- Automatically creates an `EmergencySession` in MongoDB, captures GPS coordinates, and dispatches multi-channel alerts to saved contacts.
- Includes direct device dialer links for National Emergency **112** and Ambulance **102**.

### 2. Live GPS Location Sharing
- High-accuracy geolocation streaming with accuracy radius (±m), heading, and speed.
- Dynamic Leaflet & OpenStreetMap interactive map with custom pulsating beacon markers.
- Secure, shareable public tracking link (`/track/:shareToken`) allowing trusted family members to track real-time position without creating an account.

### 3. Emergency Audio Evidence Recording
- Built on the HTML5 `MediaRecorder` API and Web Audio API `AnalyserNode`.
- Visual animated live audio waveform visualizer while capturing ambient microphone evidence.
- Encrypts and securely uploads audio files (`.webm`) to protected storage (`backend/uploads/`) and links them directly to the incident session.

### 4. One-Tap Emergency Calling Hub
- Dedicated quick-dial grid with direct `tel:112` (Police/Unified Emergency), `tel:102` (Ambulance), `tel:1091` (Women in Distress), and primary contact speed dials.
- Bypasses internet dependence; works 100% offline directly through the mobile network dialer.

### 5. Fake PIN / Anti-Coercion Silent SOS
- Dual PIN architecture with bcrypt hashing:
  - **Normal PIN (`1234`):** Unlocks the app and confirms safe cancellation of an SOS.
  - **Secret Duress PIN (`9999`):** Silently initiates an emergency SOS in the backend, records coordinates, and alerts contacts while displaying a normal "Access Granted" screen without any warning indicator to deceive an assailant.

### 6. Smart Cab Journey Monitoring
- Comprehensive manual ride setup: pick-up, destination, cab provider (Uber/Ola/Auto), vehicle registration plate number, driver name, and driver phone.
- Real-time journey timer, estimated arrival countdown, and route corridor tracking.
- Automated overdue detector: Prompts *"Are you safe?"*. If answered **NO** or left unresponded after the grace period, an emergency SOS is automatically escalated.

### 7. Route Deviation Detection Engine
- Cross-track Haversine algorithm compares live coordinates against the planned route corridor.
- Configurable corridor threshold (150m, 300m, 500m, 1000m).
- Detects unexpected detours or prolonged roadside stops, triggering safety verification banners with false-alarm dismissal controls.

### 8. Safety Check-In Timer (Dead-Man Switch)
- Presets for 15, 30, and 60 minutes, custom intervals, plus a 10-second fast test for placement demonstrations.
- Visual animated circular countdown dial.
- Audio alert on expiry prompting *"I AM SAFE"* or *"NEED HELP"*. Escalates automatically to contacts if unresponded.

### 9. Shake to Activate SOS
- Utilizes the HTML5 `DeviceMotion` accelerometer API to detect repeated vigorous physical shaking.
- Configurable sensitivity (Low, Medium, High) and cooldown thresholds to prevent false positives.
- Includes on-screen shake simulator for testing on laptop and desktop environments.

### 10. Nearby Trusted Helpers Network
- Community guardian registry with verified badges: *Medical First Responder*, *Civil Safety Volunteer*, *Women Safety Marshal*.
- Interactive Leaflet radius map showing nearby active volunteers.
- "Broadcast Request to Nearby Helpers" pushes proximity pings to volunteers within 5km.
- Built-in privacy protection: masks precise volunteer residential coordinates with spatial jitter.

### 11. Emergency Evidence Locker
- Tamper-evident incident evidence repository.
- Built-in audio player with play/pause controls, metadata inspection, file size, and timestamps.
- Direct download and export controls for legal/family reporting.
- Prominent legal compliance disclaimer.

### 12. Offline Emergency Mode (PWA)
- PWA service worker (`sw.js`) and manifest caching essential assets.
- Automatically detects online/offline transition, displaying an offline emergency bar with direct dialer shortcuts and prefilled emergency SMS templates (`sms:?body=...`).

### 13. Voice-Activated SOS
- Integrated with the Web Speech Recognition API (`SpeechRecognition`).
- Listens for a user-customizable emergency keyword (default: *"Help SecuraX"*).
- Triggers hands-free emergency confirmation with manual fallback.

### 14. Disguise / Calculator Camouflage Mode
- Full-screen, fully functional calculator interface (`/calculator` or stealth modal).
- Computes standard arithmetic (`+`, `-`, `×`, `÷`, `%`, decimals).
- Entering `1234 =` unlocks back to the dashboard.
- Entering `9999 =` silently triggers emergency SOS in the backend while keeping the calculator screen completely clean.

### 15. Automatic Multi-Channel Notification Engine
- Multi-tier alert dispatcher supporting Web Push notifications, SMTP email dispatches (via Nodemailer), and SMS fallback.
- Centralized notification audit log displaying timestamps, recipient names, channels, and delivery statuses (`DELIVERED`, `SIMULATED`, `FAILED`).
- Includes a *"Trigger Test Dispatch"* simulator for immediate evaluation.

---

## 🏗️ System Architecture

```
                                    +-----------------------------------------+
                                    |         User Client Devices             |
                                    |  (Mobile PWA, Desktop Browser, Tablet)  |
                                    +--------------------+--------------------+
                                                         |
                                 HTTPS REST / JSON       |      WebSockets (Socket.IO)
                                                         v
                                    +--------------------+--------------------+
                                    |        SecuraX Express Backend API       |
                                    |     (Port 5001, TypeScript, Helmet)     |
                                    +----+---------------+---------------+----+
                                         |               |               |
             +---------------------------+               |               +---------------------------+
             |                                           |                                           |
             v                                           v                                           v
+--------------------------+               +--------------------------+               +--------------------------+
|     MongoDB Database     |               |   Notification Engine    |               |    Evidence Storage      |
|  - Users                 |               |  - Web Push              |               |  - Protected Audio       |
|  - EmergencySessions     |               |  - Nodemailer (SMTP)     |               |  - Incident Snapshots    |
|  - LocationHistories     |               |  - Twilio / Fallback SMS |               |  - Telemetry Logs        |
|  - Journeys & Helpers    |               +--------------------------+               +--------------------------+
+--------------------------+
```

---

## 🗄️ Database Models (11 Collections)

1. **User**: Name, email, phone, bcrypt password hash, avatar, blood group, medical notes, emergency notes, role (`user`/`volunteer`/`admin`).
2. **EmergencyContact**: User ID, name, phone, relationship, email, notification preference (`all`/`sms`/`call`/`email`), primary flag, verified status.
3. **EmergencySession**: User ID, status (`active`/`resolved`/`cancelled`), trigger type (`one_tap_sos`, `silent_pin`, `voice_sos`, `shake_sos`, `timer_expired`, `cab_deviation`), trigger source, unique `shareToken`, start/end timestamps, initial and last coordinates.
4. **LocationHistory**: Coordinates (`lat`, `lng`), accuracy, speed, heading, altitude, timestamps.
5. **Journey**: Start & destination coordinates, planned polyline route, expected duration, cab details (provider, plate number, driver name/phone), safety check-in log.
6. **SafetyCheckIn**: Duration minutes, start time, expiry timestamp, status (`active`/`safe`/`expired`/`escalated`), response time.
7. **EvidenceFile**: File type (`audio`/`incident_report`), file path, MIME type, size, duration, timestamps, legal disclaimer acknowledgment.
8. **Notification**: Channel (`push`/`email`/`sms`), recipient, title, body, delivery status (`delivered`/`simulated`/`failed`), metadata, sent timestamp.
9. **Volunteer**: Name, phone, coordinates, verified status, badge title, skills array, community rating, assisted count.
10. **UserSettings**: Voice trigger keyword, shake sensitivity, cooldown seconds, route deviation threshold (meters), simulation toggles.
11. **PINConfiguration**: Bcrypt hashes of Normal PIN and Secret Duress PIN, lockout counter.

---

## 🛠️ Quick Start & Installation

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- *Optional:* Local MongoDB instance (If MongoDB is not installed, SecuraX **automatically boots an in-memory MongoDB database** so it runs seamlessly out of the box with zero external dependencies!)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/securax-platform.git
cd "SecuraX Project"

# Install both backend and frontend dependencies
npm run install:all
```

### 2. Configure Environment Variables
Environment templates are already created:
```bash
# Backend configuration
cat backend/.env.example

# Frontend configuration
cat frontend/.env.example
```

### 3. Start the Platform
You can start backend and frontend concurrently or in separate terminals:

**Terminal 1 (Backend API - Port 5001):**
```bash
npm run dev:backend
```

**Terminal 2 (Frontend Client - Port 5173):**
```bash
npm run dev:frontend
```

Now open your browser and navigate to:
👉 **`http://localhost:5173`**

---

## 🔑 Demonstration & Evaluation Credentials

For seamless evaluation, SecuraX comes pre-seeded with a comprehensive test account:

| Attribute | Demo Value |
| :--- | :--- |
| **Email** | `demo@securax.com` |
| **Password** | `SecuraX@123` |
| **Fast Login** | Click **"One-Click Demo Login"** on `/login` |
| **Normal Security PIN** | `1234` (Used for safe unlock and cancelling SOS) |
| **Secret Duress Emergency PIN** | `9999` (Used for silent emergency activation) |
| **Emergency Voice Keyword** | `"help securax"` |
| **Pre-Seeded Contacts** | Sunita Sharma (Mother), Rohan Sharma (Brother), Priya Verma (Friend) |

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new safety account |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT |
| `POST` | `/api/auth/demo-login` | Instant one-click authentication for evaluators |
| `GET` | `/api/auth/me` | Fetch active user profile |
| `GET` | `/api/contacts` | Retrieve emergency contacts list |
| `POST` | `/api/contacts` | Add new emergency contact (max 10) |
| `POST` | `/api/contacts/:id/test` | Dispatch test notification to contact |
| `POST` | `/api/emergency/activate` | Trigger emergency SOS broadcast |
| `POST` | `/api/emergency/silent-activate` | Trigger silent duress emergency |
| `POST` | `/api/emergency/cancel` | Verify safety and resolve active SOS |
| `GET` | `/api/emergency/track/:shareToken` | Public live GPS tracking view (no login required) |
| `POST` | `/api/journey/start` | Initialize protected cab journey |
| `POST` | `/api/journey/deviation-check` | Check real-time route deviation against corridor |
| `POST` | `/api/journey/check-in` | Respond to cab safety prompt |
| `POST` | `/api/safety/timer/start` | Start dead-man check-in timer |
| `POST` | `/api/safety/pin/verify` | Verify Normal vs Secret Duress PIN |
| `POST` | `/api/evidence/upload` | Upload audio recording evidence (multipart/form-data) |
| `GET` | `/api/helpers/nearby` | Query verified community helpers within radius |
| `GET` | `/api/notifications` | Fetch multi-channel alert delivery logs |

---

## 🔒 Security, Privacy & Compliance Highlights

- **Bcrypt Hashing**: All passwords and security PINs are hashed using salt rounds.
- **JWT & HTTP-Only Cookies**: Secure authentication token storage with dual bearer fallback.
- **Anti-Coercion Stealth Defense**: Ensures an assailant cannot detect that an alert was triggered when coerced to enter a PIN.
- **Location Privacy Protection**: Volunteer residential markers use spatial coordinate jittering to prevent stalking or reverse-doxxing.
- **Zero Background Intrusion**: Conforms to standard Web APIs—audio recording and speech recognition require explicit user action and operate with visual transparency.
- **Legal Accuracy Compliance**: Never claims official law enforcement dispatch unless a physical call was connected or verified integration confirms it.

---

## 🎓 Placement & Interview Discussion Points

When presenting SecuraX during major project reviews or technical placement interviews, highlight:
1. **Full-Stack Architectural Cohesion:** Full TypeScript type safety spanning MongoDB models, Express controllers, and React UI components.
2. **Real-Time WebSockets:** Custom room scoping (`user:{id}`, `emergency:{id}`, `tracking:{token}`) for scalable broadcast streams.
3. **Computational Geometry in Geo-Fencing:** The cross-track Haversine projection formula used in `geoService.ts` to calculate real-time distance from a coordinate to a polyline segment.
4. **Resilient Zero-Config Developer Experience:** The automatic failover in `db.ts` to `mongodb-memory-server` when local MongoDB service is inactive.
5. **Human-Centered Security Design:** The dual-PIN model and calculator disguise addressing real-world physical coercion scenarios.

---

## 📄 License
This project is developed for educational and portfolio demonstration purposes under the MIT License.
