# How to Set Up FundBridge

This guide covers everything needed to run the platform locally — backend (Docker) and frontend (static server).

---

## Prerequisites

Make sure the following are installed on your machine:

- **Docker Desktop** — [Download](https://www.docker.com/products/docker-desktop/)
- **Git** — [Download](https://git-scm.com/)
- **Python 3.10+** — [Download](https://www.python.org/) (only needed for the frontend dev server)

---

## 1. Clone the Repository

```bash
git clone https://github.com/tammam-bt/Venture.git
cd Venture
```

---

## 2. Configure Environment Variables

Create the file `Backend/.env` with the following variables:

```env
# Database — Supabase PostgreSQL connection string
DATABASE_URL=postgresql://postgres.<project_ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?sslmode=require

# JWT Secret — any random string
JWT_SECRET_KEY=your-secret-key-here

# Groq API — required for AI evaluation
GROQ_API_KEY=gsk_your_groq_api_key

# Supabase (optional — for future storage integration)
SUPABASE_URL=https://<project_ref>.supabase.co
SUPABASE_KEY=your-supabase-anon-key
```

> **Important:** The `DATABASE_URL` must point to a live PostgreSQL instance. The platform uses **Supabase** for hosted PostgreSQL. Create a free project at [supabase.com](https://supabase.com) if you don't have one.

> **Important:** Get a free Groq API key at [console.groq.com](https://console.groq.com). Without it, the AI scoring will fall back to placeholder scores.

---

## 3. Start the Backend (Docker)

From the project root:

```bash
docker-compose build --no-cache
docker-compose up -d
```

This will:
- Build the Python 3.11 container
- Install all dependencies from `requirements.txt`
- Start Gunicorn with 3 workers on port **5000**

### Verify the Backend

```bash
docker logs venture_backend
```

You should see:
```
[INFO] Starting gunicorn 25.3.0
[INFO] Listening at: http://0.0.0.0:5000
[INFO] Booting worker with pid: 7
```

### Initialize the Database

If this is a fresh database, create the tables:

```bash
docker exec venture_backend python init_db.py
```

---

## 4. Start the Frontend

Open a **second terminal** and serve the frontend files:

```bash
cd Frontend
python -m http.server 3000
```

The frontend will be available at: **http://localhost:3000**

---

## 5. Open the Application

Navigate to the authentication page in your browser:

```
http://localhost:3000/accueil_authentification_2/code.html
```

### Quick Test Flow

1. **Register** a new account with role **Promoteur**
2. **Login** → you'll be redirected to the project upload page
3. **Fill in** project details (title, company, industry, stage, funding)
4. **Upload** two real PDF files (Pitch Deck + Financial Model)
5. **Click "Next Step"** → wait ~5s for AI evaluation → see your score
6. **Click "Submit & Pay"** → project is listed
7. **Go back** to the auth page, register a new **Investisseur** account
8. **Login** as investor → see the project in the AI-ranked feed
9. **Click "Voir les Détails"** → unlock the project → see full details + contact info

---

## Troubleshooting

### Backend won't start

```bash
# Check container logs
docker logs venture_backend

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Database connection error (SSL)

The SSL configuration is handled automatically via `config.py`. Make sure your `DATABASE_URL` in `.env` includes `?sslmode=require` — the backend strips it from the URL and passes it via SQLAlchemy engine options instead.

### "Network error" in the frontend

- Make sure the Docker backend is running on port 5000
- Make sure you're accessing the frontend via `http://localhost:3000` (not `file://`)
- Check the browser console (F12) for CORS errors

### AI evaluation returns placeholder scores

- Verify your `GROQ_API_KEY` is set in `Backend/.env`
- Make sure you're uploading **real PDF files** (not renamed .txt files)
- Check Docker logs: `docker logs venture_backend`

---

## Useful Commands

| Command | Description |
|---|---|
| `docker-compose up -d` | Start the backend in background |
| `docker-compose down` | Stop the backend |
| `docker-compose build --no-cache` | Rebuild the backend image |
| `docker logs venture_backend` | View backend logs |
| `docker exec venture_backend python init_db.py` | Initialize DB tables |
| `docker exec venture_backend python fix_db.py` | Run DB migration fixes |
| `python -m http.server 3000` | Start frontend dev server (run from `Frontend/`) |

---

## Environment Summary

| Service | URL | Port |
|---|---|---|
| **Backend API** | `http://localhost:5000` | 5000 |
| **Frontend** | `http://localhost:3000` | 3000 |
| **Database** | Supabase (remote) | 6543 |
| **AI Engine** | Groq API (remote) | — |
