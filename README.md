# FundBridge — AI-Powered Startup Funding Platform

<p align="center">
  <strong>Connecting startups with investors through intelligent AI scoring.</strong><br>
  Built for the Finnovo Hackathon 2026
</p>

---

## Overview

FundBridge is a full-stack web platform that streamlines the startup-investor matchmaking process. Promoters submit their ventures with supporting documents; an AI engine (Groq Llama-3.3-70B) evaluates each project across viability, feasibility, impact, and ROI — producing a transparent score out of 100. Investors browse a curated, score-ranked feed and unlock full project details through a pay-per-action model.

### Key Features

| Feature | Description |
|---|---|
| **AI Scoring Engine** | Evaluates pitch decks and financial models using Groq Llama-3.3-70B, producing structured scores, summaries, and red-flag analysis |
| **Role-Based Access** | Separate flows for Promoters (submit projects) and Investors (browse & unlock) |
| **PDF Processing** | Extracts text from uploaded PDFs using PyMuPDF for AI analysis |
| **JWT Authentication** | Secure token-based auth with role-aware routing |
| **Pay-Per-Action** | Mock payment gateway for project posting and unlocking |
| **Containerized** | Docker + Docker Compose for one-command deployment |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Vanilla HTML/JS)               │
│  Auth │ Upload │ AI Review │ Investor Dashboard │ Detail     │
└───────────────────────┬─────────────────────────────────────┘
                        │  REST API (JSON)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                 Backend (Flask + Gunicorn)                    │
│  /api/auth/*  │  /api/projects/*  │  /api/payments/*         │
├───────────────┼───────────────────┼──────────────────────────┤
│  JWT Auth     │  AI Engine (Groq) │  Mock Payment Gateway    │
│  Bcrypt       │  PDF Parser       │  Transaction Tracking    │
└───────────────────────┬─────────────────────────────────────┘
                        │  SQLAlchemy ORM
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL (Supabase Hosted)                     │
│  users  │  projects  │  transactions                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, Tailwind CSS (CDN), Vanilla JavaScript |
| **Backend** | Python 3.11, Flask, SQLAlchemy, Flask-JWT-Extended |
| **AI Engine** | Groq API (Llama-3.3-70B-Versatile) |
| **PDF Processing** | PyMuPDF (fitz) |
| **Database** | PostgreSQL via Supabase |
| **Deployment** | Docker, Docker Compose, Gunicorn |
| **Design System** | "Algorithmic Atelier" — Manrope + Inter, editorial aesthetic |

---

## Project Structure

```
Venture/
├── Backend/
│   ├── app.py                 # Flask application factory
│   ├── config.py              # Environment & DB configuration
│   ├── models.py              # SQLAlchemy models (User, Project, Transaction)
│   ├── Dockerfile             # Container build instructions
│   ├── requirements.txt       # Python dependencies
│   ├── init_db.py             # Database table initialization
│   ├── fix_db.py              # Database migration helper
│   ├── routes/
│   │   ├── auth.py            # POST /register, /login
│   │   ├── projects.py        # POST /submit, GET /feed, GET /<id>
│   │   └── payments.py        # POST /unlock/<id>, mock checkout
│   └── services/
│       ├── ai_engine.py       # Groq AI evaluation pipeline
│       └── pdf_processor.py   # PyMuPDF text extraction
├── Frontend/
│   ├── js/
│   │   ├── api.js             # Shared API layer (JWT, fetch helpers, toasts)
│   │   ├── auth.js            # Login & registration logic
│   │   ├── upload.js          # Project info + file upload
│   │   ├── submit.js          # AI review rendering + payment
│   │   ├── dashboard.js       # Investor feed (dynamic cards)
│   │   └── project_detail.js  # Project detail + unlock flow
│   ├── accueil_authentification_2/   # Auth page
│   ├── fundbridge_step_2_documents/  # Promoter: project info + upload
│   ├── fundbridge_step_3_review_ai_evaluation/  # AI results + payment
│   ├── tableau_de_bord_investisseur_catalogue/   # Investor dashboard
│   └── d_tails_du_projet_vue_investisseur/       # Project detail view
├── docker-compose.yml
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Register a new user (promoter or investor) |
| `POST` | `/api/auth/login` | — | Login, returns JWT token |
| `POST` | `/api/projects/submit` | JWT | Submit project with files (multipart/form-data) |
| `GET` | `/api/projects/feed` | — | Get all listed projects sorted by AI score |
| `GET` | `/api/projects/<id>` | JWT | Get full project details (must be owner or have unlocked) |
| `POST` | `/api/payments/unlock/<id>` | JWT | Initiate project unlock payment |
| `GET` | `/api/payments/mock_checkout/<tx_id>` | — | Mock payment page |
| `POST` | `/api/payments/mock_success/<tx_id>` | — | Simulate successful payment |

---

## User Flows

### Promoter Flow
1. **Register** as Promoteur → **Login** → redirected to project upload
2. **Fill project info** (title, company name, industry, stage, funding amount)
3. **Upload documents** (Pitch Deck PDF + Financial Model — required)
4. **Submit** → AI evaluates documents in ~5 seconds → displays score, summary, red flags
5. **Pay** mock submission fee → project listed in investor feed

### Investor Flow
1. **Register** as Investisseur → **Login** → redirected to dashboard
2. **Browse** the AI-scored project feed with search filtering
3. **Click** any project → see limited preview
4. **Unlock** project via payment → see full documents, AI analysis, and promoter contact info
5. **Contact** the promoter to schedule a meeting

---

## Team

| Member | Role |
|---|---|
| **Tammam** | Backend Engineer — API, database, Docker, frontend integration |
| **Teammate 1** | AI Engineer — Groq evaluation engine, PDF processing |
| **Teammate 2** | Frontend Designer — Aeon Slate design system, HTML/CSS pages |

---

## License

This project was built for the **Finnovo Hackathon 2026**. See [LICENSE](LICENSE) for details.