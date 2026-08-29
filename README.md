# AstraOS

**AI Operating System for Public Infrastructure**

## 1. Introduction

AstraOS is a civic infrastructure platform that combines a web application with
AI-powered analysis to help citizens report issues (potholes, garbage,
streetlights, etc.), and help municipal officers triage, assign, and resolve
them efficiently. This repository currently contains **Step 1: the project
foundation** — the architecture and scaffolding the rest of AstraOS will be
built on.

## 2. Mission

To give local governments and citizens a shared, AI-assisted operating layer
for public infrastructure — faster complaint resolution, transparent
tracking, and data-driven prioritization.

## 3. Current Architecture

AstraOS is split into three independent services that communicate over HTTP
(and, in a future step, WebSockets):

- **`client/`** — React (Vite) single-page application.
- **`server/`** — Node.js/Express REST API and business logic.
- **`ai/`** — Python/FastAPI service for AI-driven analysis (image
  classification, NLP, prioritization, etc.).

Each service has its own dependency manifest and `.env.example`, and can be
started independently.

## 4. Technology Stack

**Frontend:** React, Vite, Tailwind CSS, React Router, Axios, Framer Motion,
Lucide React, Recharts, React Hook Form, Leaflet

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, Multer,
Nodemailer, Socket.io, Express Validator, dotenv, CORS

**AI Service:** Python, FastAPI (with YOLOv8, OpenCV, Groq API,
scikit-learn, NumPy, and Pandas reserved for future modules)

## 5. Folder Structure

```
astraos/
├── client/
│   ├── src/
│   │   ├── components/     # Reusable UI components (future modules)
│   │   ├── pages/          # Route-level page components
│   │   ├── layouts/        # Shared page layouts (future)
│   │   ├── services/       # API clients (axios instance lives here)
│   │   ├── hooks/          # Custom React hooks (future)
│   │   ├── context/        # React context providers (future)
│   │   ├── utils/          # Frontend utility functions (future)
│   │   ├── assets/         # Static assets
│   │   ├── App.jsx         # Route registration
│   │   └── main.jsx        # React entrypoint
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env.example
│
├── server/
│   ├── src/
│   │   ├── config/         # DB connection and other config (modular)
│   │   ├── controllers/    # Route handlers (future modules)
│   │   ├── middleware/     # Error handling, auth, etc.
│   │   ├── models/         # Mongoose schemas (future modules)
│   │   ├── routes/         # Express routers (health is here now)
│   │   ├── services/       # Business logic / integrations (future)
│   │   ├── utils/          # Backend utility functions (future)
│   │   ├── app.js          # Express app + middleware wiring
│   │   └── server.js       # HTTP server entrypoint
│   ├── package.json
│   └── .env.example
│
├── ai/
│   ├── app/
│   │   ├── routes/         # FastAPI routers (health is here now)
│   │   ├── services/       # AI/ML service logic (future modules)
│   │   ├── models/         # ML model wrappers (future modules)
│   │   ├── utils/          # AI service utility functions (future)
│   │   └── main.py         # FastAPI entrypoint
│   ├── requirements.txt
│   └── .env.example
│
├── .gitignore
├── README.md
└── package.json             # Root dev-orchestration scripts
```

## 6. How to Install

From the repository root:

```bash
# Root (optional, only needed for `npm run dev` orchestration)
npm install

# Frontend
cd client && npm install

# Backend
cd server && npm install

# AI service
cd ai && pip install -r requirements.txt
```

Then copy each `.env.example` to `.env` in `client/`, `server/`, and `ai/`,
and fill in real values (never commit `.env` files).

## 7. How to Run the Frontend

```bash
cd client
npm run dev
```

Visit **http://localhost:5173** — you should see the "AstraOS" placeholder
landing page.

## 8. How to Run the Backend

```bash
cd server
npm run dev
```

The API starts on **http://localhost:5000** (configurable via `PORT`).

## 9. How to Run the AI Service

```bash
cd ai
uvicorn app.main:app --reload --port 8000
```

The service starts on **http://localhost:8000**.

## 10. Environment Variables

**`server/.env`**

| Variable | Purpose |
|---|---|
| `PORT` | Port the Express server listens on |
| `CLIENT_URL` | Frontend origin, used for CORS |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret used to sign JWTs (future auth module) |
| `AI_SERVICE_URL` | Base URL of the AI service |
| `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_USER` / `EMAIL_PASSWORD` | SMTP config for Nodemailer (future notifications module) |

**`ai/.env`**

| Variable | Purpose |
|---|---|
| `PORT` | Port the FastAPI service listens on |
| `CLIENT_URL` | Frontend origin, used for CORS |
| `GROQ_API_KEY` | Groq API key (future AI module) |

**`client/.env`**

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Base URL the frontend uses to call the backend |
| `VITE_AI_SERVICE_URL` | Base URL the frontend uses to call the AI service |

No real secrets are stored in this repository — only `.env.example` files
with placeholder keys.

## 11. Development Roadmap

This repository currently implements **only the project foundation**. The
following modules are **not yet implemented** and will be added
incrementally in future steps, without restructuring what exists today:

- Authentication (JWT-based login/signup, roles: citizen/officer/admin)
- Complaint management (create, track, status updates)
- AI-powered complaint analysis (image classification, NLP categorization)
- GIS / mapping features (Leaflet-based complaint location tracking)
- Real-time updates via Socket.io
- Officer assignment logic
- Analytics dashboards (Recharts)
- Rewards / gamification system
- Email notifications (Nodemailer)
- Admin panel
- Emergency management module

---

**Status: Step 1 — Foundation complete.** No business logic, auth, or
domain modules have been implemented yet.
