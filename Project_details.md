# AI-Powered Startup Funding Platform (Hackathon Handoff)

## Project Overview

This project is an AI-powered startup funding platform designed to seamlessly match investors with potential startup ideas. It streamlines the initial vetting process using an AI scoring engine, providing a curated, high-signal feed of projects for investors while offering promoters a visible platform to showcase their ideas.

This document is structured to serve as a comprehensive context file for any AI assistant joining the development process.

## System Architecture

The project employs a decoupled architecture to facilitate concurrent development across a 3-person team:

- **Frontend:** Vanilla HTML, CSS, and JavaScript. Operates entirely independently and communicates with the backend via RESTful API calls (`fetch()`).
- **Backend:** Python with **Flask**. Serves exclusively as an API layer handling routing, business logic, authentication, and external integration.
- **Database:** **PostgreSQL** (interfaced via SQLAlchemy) for robust relational data management.
- **AI Engine:** Integrated via **OpenRouter API**/**Groq API**.
- **Payments & Monetization:** Webhook-driven pay-per-action model.

## Core Workflows

### 1. Promoter (Startup Founder) Workflow

- **Registration:** The promoter creates a user account.
- **Submission:** Submits a project by uploading key documentation(the details are in the Guidelines.md folder):
  1.  Pitch Deck (PDF)
  2.  Financial Projection (PDF/Excel)
  3.  One Linear Form Fields (Form)
- **Monetization:** The promoter pays a fixed fee per project posted.
- **AI Validation:** The system processes the inputs, simulates market research, and assigns a normalized score (0-100) along with a short, transparent evaluation summary.
- **Matchmaking:** Once an investor unlocks the project, the promoter receives a meeting request to take the discussion off-platform.

### 2. Investor Workflow

- **Registration:** The investor creates an account.
- **Discovery (Free Tier):** Browses a feed of projects sorted strictly by the AI model's score. The preview only displays the Title, a brief project summary, a non-identifying bio of the promoter, and the AI score.
- **Unlock (Paid Tier):** The investor pays a fee per project to unlock all detailed documents and the promoter's booking details.
- **Action:** Books a rendezvous with the promoter. A hand-off tracking mechanism notes if the parties later declare a successful partnership.

## AI Scoring Engine Details

Optimized for a rapid 9-hour hackathon development window, the system bypasses complex live RAG for real-time market research and instead utilizes a high-efficiency simulated market analysis approach based on the submitted context.

- **Inputs:** Project details and the 4 core documents.
- **Evaluation Criteria:** \* Viability
  - Feasibility
  - Impact
  - Return on Investment (ROI)
- **Outputs:** An aggregate score (out of 100) and a concise transparency report (short evaluation summary) provided to the user.

## API Integration Map & Data Flow (Handoff Context)

For the next AI assistant taking over, the immediate technical priorities involve establishing the Flask endpoints and PostgreSQL schemas.

**Expected Database Entities:**

- `User` (Attributes: ID, Role [Promoter/Investor], Auth Details)
- `Project` (Attributes: ID, Promoter_ID, Title, Summary, Documents_JSON, Score, Eval_Summary)
- `Transaction` (Attributes: ID, User_ID, Project_ID, Type [Post/Unlock], Status)

**Expected Flask Endpoints (JSON Only):**

- `POST /api/auth/register`
- `POST /api/projects/submit` (Handles payload parsing and triggers OpenRouter task)
- `GET /api/projects/feed` (Returns summarized, sorted list for the investor dashboard)
- `POST /api/projects/unlock/<project_id>` (Validates payment and grants access)
- `GET /api/projects/<project_id>` (Returns full document details if unlocked status is verified)

## Next Steps for AI Assistant

When continuing this thread, the AI should prioritize generating the `models.py` (SQLAlchemy schema) or configuring the Flask application factory. It must strictly enforce the separation of concerns, ensuring the backend returns only JSON and relies on the frontend for all rendering.
