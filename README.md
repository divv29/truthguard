# TruthGuard — Full-Stack Edition
### AI Fake News Detector · React + Node.js/Express + PostgreSQL

---

## Project Structure

```
truthguard-fullstack/
├── backend/                    # Node.js + Express + PostgreSQL API
│   ├── server.js               # Entry point
│   ├── package.json
│   ├── .env                    # Your DB credentials (edit this)
│   ├── config/
│   │   ├── db.js               # PostgreSQL connection pool
│   │   └── schema.sql          # Database schema (run once)
│   ├── models/
│   │   └── Article.js          # DB query functions
│   ├── controllers/
│   │   └── articleController.js
│   ├── routes/
│   │   └── articles.js
│   └── middleware/
│       └── errorHandler.js
│
└── frontend/                   # React app (original UI, unchanged)
    ├── src/
    │   ├── App.jsx             # Main app (storage → API calls)
    │   └── index.js
    ├── public/
    │   └── index.html
    ├── .env                    # Groq API key + backend URL
    └── package.json
```

---

## REST API

| Method   | Endpoint              | Description               |
|----------|-----------------------|---------------------------|
| `POST`   | `/api/articles`       | Save analyzed article     |
| `GET`    | `/api/articles`       | Get all articles (latest) |
| `GET`    | `/api/articles/:id`   | Get single article        |
| `DELETE` | `/api/articles/:id`   | Delete article            |
| `GET`    | `/health`             | Health check              |

---

## Setup & Run

### Step 1 — PostgreSQL Setup

Make sure PostgreSQL is installed and running.

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE truthguard;"

# Run the schema (creates the articles table)
psql -U postgres -d truthguard -f backend/config/schema.sql
```

---

### Step 2 — Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
# Open .env and set your PostgreSQL password:
#   DB_PASSWORD=your_actual_password

# Start the backend (with auto-reload)
npm run dev
```

Backend runs at: **http://localhost:5000**  
Test it: **http://localhost:5000/health**

---

### Step 3 — Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
# Open .env and set your Groq API key:
#   REACT_APP_GROQ_API_KEY=gsk_...your_key...
# (Get a free key at https://console.groq.com)

# Start the frontend
npm start
```

Frontend runs at: **http://localhost:3000**

---

## Environment Variables

### backend/.env
```
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=truthguard
DB_HOST=localhost
DB_PORT=5432
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### frontend/.env
```
REACT_APP_GROQ_API_KEY=gsk_your_groq_key_here
REACT_APP_API_URL=http://localhost:5000
```

---

## Notes

- Get a **free** Groq API key at https://console.groq.com → API Keys → Create
- Admin login: use any email containing `admin` (e.g. `admin@truth.ai`)
- All analysis history is now stored in **PostgreSQL** (not browser storage)
- The frontend UI is **completely unchanged** — only the storage layer was swapped
