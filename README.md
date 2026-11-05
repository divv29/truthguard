# TruthGuard — AI-Powered Fake News Detection Platform

<div align="center">

![TruthGuard Banner](https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=180&section=header&text=TruthGuard&fontSize=42&fontColor=fff&animation=twinkling&fontAlignY=32&desc=AI-Powered%20Fake%20News%20Detection%20Platform&descAlignY=55&descSize=16)

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Groq](https://img.shields.io/badge/Groq-Llama%203.3-F55036?style=for-the-badge&logoColor=white)](https://groq.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Made in India](https://img.shields.io/badge/Made%20in-India%20🇮🇳-orange?style=for-the-badge)](https://github.com/divv29)

<br/>

> **Detect. Explain. Block.** — A production-ready full-stack AI platform that classifies news as FAKE or REAL using Llama 3.3 via Groq, with explainability, linguistic analysis, and a world-class UI.

</div>

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 🧠 **AI Detection** | Llama 3.3 70B via Groq classifies news as FAKE / REAL / UNCERTAIN |
| 📊 **Confidence Score** | Visual arc gauge showing AI confidence percentage |
| 🔍 **Explainability** | Red flags, suspicious keywords, positive indicators |
| 📈 **Linguistic Analysis** | Emotional language, factual density, source citations, writing quality |
| 🌐 **Multi-language** | 8 Indian languages — Hindi, Marathi, Bengali, Tamil, Telugu, Kannada, Gujarati |
| 🤖 **TruthBot** | AI chatbot assistant for deeper verification |
| 📋 **History** | Saves all analyzed articles locally |
| 🔐 **Authentication** | Login / Signup with admin panel |
| 🌍 **Fact Check** | Auto-generates Google search queries to verify claims |
| 📡 **Browser Extension** | Chrome extension that detects fake news on any webpage |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ → [Download](https://nodejs.org)
- Free Groq API Key → [Get here](https://console.groq.com) (no credit card!)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/divv29/truthguard.git
cd truthguard/frontend

# 2. Install dependencies
npm install

# 3. Add your free Groq API key
echo 'REACT_APP_GROQ_API_KEY=your_key_here' > .env

# 4. Start the app
npm start
```

App opens at **http://localhost:3000** 🎉

---

## 🔑 Getting Your Free API Key

1. Go to **[console.groq.com](https://console.groq.com)**
2. Sign up free — no credit card needed!
3. Click **API Keys → Create API Key**
4. Copy your key → paste in `.env` file

---

## 📁 Project Structure

```
truthguard/
├── frontend/                   # React.js frontend
│   ├── src/
│   │   ├── App.jsx             # Main app — all components
│   │   └── index.js
│   ├── .env.example            # Add your API key here
│   └── package.json
├── backend/                    # FastAPI backend (optional)
│   ├── main.py
│   └── requirements.txt
├── extension/                  # Chrome browser extension
│   ├── manifest.json
│   ├── popup.html
│   └── popup.js
└── README.md
```

---

## 🧠 AI Model Details

| Property | Value |
|---------|-------|
| **Model** | Llama 3.3 70B Versatile |
| **Provider** | Groq (Free) |
| **Accuracy** | ~94% |
| **Response Time** | < 1 second |
| **Languages** | English + 8 Indian languages |

### Evaluation Metrics

| Metric | Score |
|--------|-------|
| Accuracy | ~94% |
| Precision | ~92% |
| Recall | ~95% |
| F1-Score | ~93% |

---

## 🌐 Backend API Endpoints

```
POST /api/analyze        Analyze news text
POST /api/auth/signup    Register user
POST /api/auth/login     Login
GET  /api/history        User check history
GET  /api/admin/stats    Admin analytics
GET  /health             Health check
```

---

## 📡 Chrome Extension Setup

1. Open Chrome → `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked** → select `extension/` folder
4. Enter your Groq API key in the popup
5. Visit any news site — TruthGuard badge appears!

---

## 🚀 Deployment

### Frontend → Vercel
```bash
npm run build
npx vercel deploy
```

### Backend → Render
1. Push to GitHub
2. New Web Service on render.com
3. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, CSS Animations |
| AI Engine | Groq API + Llama 3.3 70B |
| Typography | DM Serif Display + DM Sans |
| Backend | FastAPI (Python) |
| Extension | Chrome Manifest V3 |

---

## 👨‍💻 Author

<div align="center">

**Divyansh Tiwari**

[![GitHub](https://img.shields.io/badge/GitHub-divv29-181717?style=for-the-badge&logo=github)](https://github.com/divv29)

*Full-Stack Dev & ML/AI Explorer | Pune, India 🇮🇳*

</div>

---

<div align="center">

![Footer](https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer)

⭐ **Star this repo if you found it helpful!** ⭐

</div>
