# Jharkhand Innovation Hub

> **"From Local Problems to Real Solutions."**  
> *Smart India Hackathon 2026 Production Project*

---

## 🏛️ Executive Summary

**Jharkhand Innovation Hub** is a unified statewide platform engineering ecosystem designed to close the gap between rural community problems and university engineering laboratories.

The system connects two interfaces on a **single shared backend**:
1. **Citizen Report App (`/citizen`)**: A mobile-first, installable PWA for citizens to document civic, environmental, and public health problems with GPS coordinates, photos, and severity estimates.
2. **Common Innovation Website (`/app`)**: A role-based professional workbench for Government Officials, University Administrators, Faculty Mentors, Student Innovators, Industry CSR Partners, and Startups.

---

## 🔄 The 10-Stage End-to-End Innovation Pipeline

```
Citizen
  ↓
Citizen Report App (/citizen)
  ↓
AI Analysis (Classification, Priority, Duplicate Detection)
  ↓
Government Validation (District Command Center)
  ↓
University Matching (Academic Lab Allocation)
  ↓
Faculty Mentorship (Principal Investigator)
  ↓
Student Engineering Team (Prototyping & Code)
  ↓
Industry / Startup (CSR Hardware, Grants, Cloud)
  ↓
Prototype & Pilot Testing (Field Validation in Panchayats)
  ↓
Deployment & Measurable Citizen Impact (SROI Tracking)
```

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Framer Motion, React Router v7, TanStack Query, React Hook Form, Zod, Recharts
- **Backend Architecture**: Firebase Authentication, Cloud Firestore, Firebase Storage, Firebase Cloud Messaging (FCM)
- **Maps**: Interactive SVG District Topography & Geolocation Telemetry with Google Maps API fallback
- **PWA**: Web App Manifest, Service Worker caching, and offline-friendly report drafting
- **AI Abstraction Layer**: Pluggable external Gemini API support with an offline client-side heuristic NLP and semantic vector similarity engine

---

## 👥 Role-Based Access Control (RBAC)

All professional cadres access the platform through **ONE unified route (`/app`)** with dynamic role adaptation:

| Role | Primary Dashboard | Key Capabilities |
|---|---|---|
| **Citizen** | `/citizen` | Submit reports, upload evidence, track 10-stage lifecycle, inspect impact |
| **Government** | `/app` (Command Center) | Validate challenges, review AI scores, allocate university quotas, monitor telemetry |
| **University** | `/app` (University Hub) | Review incoming challenges, assign departments, monitor student team velocity |
| **Faculty** | `/app` (Faculty Workspace)| Mentor projects, evaluate milestones, recruit students via AI matching |
| **Student** | `/app` (Student Hub) | Discover challenges, manage Kanban tasks, earn Innovation Points, download certificates |
| **Industry / Startup** | `/app` (Industry Hub) | Discover fundable projects, provide hardware/cloud credits, track CSR impact |
| **Admin** | `/app` (Admin Command) | System configuration, database re-seeding, immutable audit logs |

---

## 🌟 Flagship SIH 2026 Presentation Demo

### Case: Unsafe Drinking Water in Sikaripara Panchayat, Dumka
- **Citizen**: Rahul Mahto reports severe fluoride and arsenic contamination from handpumps affecting **2,400 villagers**.
- **AI Engine**: Categorizes into *Water Management*, assigns **High Priority (8.7/10)**, detects 2 similar groundwater reports nearby, and recommends an *AI + IoT Water Quality Monitoring System*.
- **Government**: District Magistrate validates the challenge and assigns it to **Birsa Institute of Technology (BIT Sindri)**.
- **University & Faculty**: BIT Sindri accepts; Dr. Anita Verma initiates project `proj-001`.
- **Students**: Amit Oraon (95% skill fit in Flutter & IoT) and 7 student engineers join the team.
- **Industry Partner**: **DemoTech Solutions** sponsors 15 solar-powered ESP32 telemetry sensor pods with ₹5L CSR funding.
- **Prototype & Pilot**: 15 sensors deployed across 5 villages in Sikaripara.
- **Citizen Outcome**: Rahul Mahto and 2,400 villagers receive safe water alerts. Waterborne illness incidents decline by 64%.

---

## 🚀 Quick Start & Local Development

### 1. Prerequisites
- Node.js (v18+ or v24 LTS)
- npm (v9+ or v11+)

### 2. Installation
```bash
# Navigate to project
cd jharkhand-innovation-hub

# Install dependencies
npm install

# Start development server
npm run dev
```
The application will launch at `http://localhost:5173`.

### 3. Build for Production
```bash
npm run build
```

---

## ⚙️ Environment Variables (`.env`)

Copy `.env.example` to `.env`:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=demo-api-key
VITE_FIREBASE_AUTH_DOMAIN=jharkhand-innovation-hub.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=jharkhand-innovation-hub
VITE_FIREBASE_STORAGE_BUCKET=jharkhand-innovation-hub.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Optional AI Key (App works 100% offline without key using built-in AI)
VITE_AI_API_KEY=

# Optional Google Maps Key (App includes standalone SVG map)
VITE_MAPS_API_KEY=
```

---

## 🧪 Testing the SIH Evaluation Workflow

1. **Launch App**: Open `http://localhost:5173/`
2. **Citizen Submission**: Click **"Report a Problem (/citizen)"**, navigate to `/citizen/report`, fill the 8-step form, and run the AI synthesis engine.
3. **Switch to Government**: Click **"Sign In (/app)"** or use the top Quick Persona Switcher to choose **Government**. Review the challenge on the Jharkhand map and click **Validate**.
4. **Switch to Faculty**: Open `proj-001`, advance milestone progress sliders by clicking **"+15% Advance Progress"**, move tasks on the Kanban board, and send a message.
5. **Switch to Student**: Inspect gamification badges, Innovation Points (1,560), and print the official **State Innovation Certificate**.
6. **Inspect Impact**: Navigate to `/app/impact` to view consolidated metrics: **85,000+ Citizens Benefited**, **342 Villages Covered**, **₹18.4 Cr Public Savings**.

---

## 📄 License & Ownership
Created for **Smart India Hackathon 2026** by team *Jharkhand Innovation Hub*. Open-source civic infrastructure for the Government of Jharkhand.
