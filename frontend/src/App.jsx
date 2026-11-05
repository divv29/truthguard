import { useState, useEffect, useRef } from "react";

// ============================================================
// TRUTHGUARD — Powered by Groq (100% FREE)
// Model: llama-3.3-70b-versatile via Groq API
// ============================================================

const GROQ_MODEL = "llama-3.3-70b-versatile";

async function analyzeNewsWithAI(text, source = "") {
  const prompt = `You are an expert fake news detection system. Analyze this news for authenticity.
Respond ONLY in this exact JSON format with no extra text whatsoever:
{
  "verdict": "FAKE",
  "confidence": 85,
  "credibility_score": 20,
  "risk_level": "HIGH",
  "explanation": "2-3 sentence explanation of why this is fake or real.",
  "red_flags": ["flag1", "flag2", "flag3"],
  "suspicious_keywords": ["word1", "word2", "word3"],
  "positive_indicators": ["indicator1"],
  "linguistic_analysis": {"emotional_language": 90, "factual_density": 10, "source_citations": 5, "writing_quality": 30},
  "recommendation": "One sentence action for the reader.",
  "fact_check_queries": ["search query 1", "search query 2"]
}

News to analyze:
${text.slice(0, 2500)}
${source ? "Source: " + source : ""}`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + process.env.REACT_APP_GROQ_API_KEY,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      max_tokens: 1000,
      temperature: 0.1,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || "API error: " + response.status);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content || "{}";
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Invalid response format");
  return JSON.parse(raw.slice(start, end + 1));
}

async function askBot(question, context) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + process.env.REACT_APP_GROQ_API_KEY,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      max_tokens: 500,
      messages: [{
        role: "user",
        content: "You are TruthBot, an expert in media literacy and fake news detection. Be concise and helpful. Context: " + JSON.stringify(context) + ". Question: " + question
      }],
    }),
  });
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "Sorry, try again.";
}

// ── Utilities ────────────────────────────────────────────────
// ── API Configuration ────────────────────────────────────────
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
function timeAgo(ts) {
  const d = Date.now() - ts;
  if (d < 60000) return "just now";
  if (d < 3600000) return Math.floor(d / 60000) + "m ago";
  if (d < 86400000) return Math.floor(d / 3600000) + "h ago";
  return Math.floor(d / 86400000) + "d ago";
}

// Save article to PostgreSQL via Express API
async function saveArticle(a) {
  try {
    const res = await fetch(`${API_URL}/api/articles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: a.text,
        source: a.source || null,
        verdict: a.verdict || "UNCERTAIN",
        confidence: a.confidence || 0,
        result: a,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Save failed");
    }
    return await res.json();
  } catch (e) {
    console.warn("API save error:", e.message);
  }
}

// Load articles from PostgreSQL via Express API
async function loadArticles() {
  try {
    const res = await fetch(`${API_URL}/api/articles`);
    if (!res.ok) throw new Error("Failed to load articles");
    const data = await res.json();
    // Map DB rows back to the shape the UI expects
    return (data.data || []).map(row => ({
      ...(row.result || {}),
      id: String(row.id),
      text: row.text,
      source: row.source,
      verdict: row.verdict,
      confidence: row.confidence,
      timestamp: new Date(row.created_at).getTime(),
    }));
  } catch (e) {
    console.warn("API load error:", e.message);
    return [];
  }
}

// ── Global CSS ───────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #f8f7f4; --bg2: #f0ede8; --bg3: #e4e0d9; --bg4: #d4d0c8;
    --ink: #1a1814; --ink2: #3a3630; --ink3: #7a7670; --ink4: #b0aba5;
    --fake: #c0392b; --fake-bg: #fdf0ef; --fake-b: #f5c6c3;
    --real: #1a7a4a; --real-bg: #eef8f3; --real-b: #b8e8ce;
    --warn: #b8640a; --warn-bg: #fef8f0; --warn-b: #f5d9b0;
    --r-sm: 8px; --r-md: 14px; --r-lg: 20px; --r-xl: 28px; --r-pill: 9999px;
    --s1: 0 1px 3px rgba(26,24,20,.06),0 1px 2px rgba(26,24,20,.04);
    --s2: 0 4px 16px rgba(26,24,20,.08),0 2px 6px rgba(26,24,20,.05);
    --s3: 0 20px 60px rgba(26,24,20,.12),0 8px 24px rgba(26,24,20,.08);
    --s4: 0 40px 100px rgba(26,24,20,.18);
    --ease: cubic-bezier(.4,0,.2,1);
    --spring: cubic-bezier(.34,1.56,.64,1);
    --font-d: 'DM Serif Display', Georgia, serif;
    --font-b: 'DM Sans', system-ui, sans-serif;
  }
  html { scroll-behavior: smooth; }
  body { font-family: var(--font-b); background: var(--bg); color: var(--ink); -webkit-font-smoothing: antialiased; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: var(--bg4); border-radius: 3px; }
  ::selection { background: var(--ink); color: var(--bg); }
  @keyframes fadeUp { from { opacity:0;transform:translateY(20px) } to { opacity:1;transform:none } }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes scaleIn { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:none} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
  @keyframes barIn { from{transform:scaleX(0)} to{transform:scaleX(1)} }
  @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes orb { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,-15px) scale(1.04)} }
  @keyframes slideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
  .card { background:var(--bg); border:1px solid var(--bg3); border-radius:var(--r-xl); box-shadow:var(--s1); }
  .btn { display:inline-flex;align-items:center;justify-content:center;gap:7px;border:none;cursor:pointer;font-family:var(--font-b);font-weight:500;transition:all .2s var(--ease);position:relative;overflow:hidden;letter-spacing:-.01em; }
  .btn:active { transform:scale(.97)!important; }
  .btn-primary { background:var(--ink);color:var(--bg);padding:13px 26px;border-radius:var(--r-pill);font-size:14px;box-shadow:0 2px 8px rgba(26,24,20,.2); }
  .btn-primary:hover { transform:translateY(-2px);box-shadow:0 6px 20px rgba(26,24,20,.25); }
  .btn-primary:disabled { opacity:.5;cursor:not-allowed;transform:none!important; }
  .btn-secondary { background:var(--bg2);color:var(--ink);padding:11px 22px;border-radius:var(--r-pill);font-size:13px;border:1px solid var(--bg3); }
  .btn-secondary:hover { background:var(--bg3); }
  .btn-ghost { background:transparent;color:var(--ink3);padding:8px 16px;border-radius:var(--r-pill);font-size:13px;border:1px solid var(--bg3); }
  .btn-ghost:hover { background:var(--bg2);color:var(--ink); }
  .btn-sm-fake { background:var(--fake-bg);color:var(--fake);padding:7px 14px;border-radius:var(--r-pill);font-size:12px;border:1px solid var(--fake-b); }
  .btn-sm-fake:hover { background:var(--fake-b); }
  .btn-sm-real { background:var(--real-bg);color:var(--real);padding:7px 14px;border-radius:var(--r-pill);font-size:12px;border:1px solid var(--real-b); }
  .btn-sm-real:hover { background:var(--real-b); }
  input, textarea, select { font-family:var(--font-b); }
  .inp { width:100%;background:var(--bg2);border:1.5px solid var(--bg3);border-radius:var(--r-md);padding:11px 14px;color:var(--ink);font-size:14px;transition:border-color .2s;outline:none; }
  .inp:focus { border-color:var(--ink); }
  .pill { display:inline-flex;align-items:center;gap:6px;border-radius:var(--r-pill);padding:5px 12px;font-size:12px;font-weight:500; }
  .pill-fake { background:var(--fake-bg);color:var(--fake);border:1px solid var(--fake-b); }
  .pill-real { background:var(--real-bg);color:var(--real);border:1px solid var(--real-b); }
  .pill-warn { background:var(--warn-bg);color:var(--warn);border:1px solid var(--warn-b); }
  .tab-nav { display:flex;background:var(--bg2);border-radius:var(--r-pill);padding:4px;border:1px solid var(--bg3); }
  .tab { flex:1;padding:8px 14px;border-radius:var(--r-pill);border:none;cursor:pointer;font-family:var(--font-b);font-size:13px;font-weight:500;transition:all .2s var(--ease);background:transparent;color:var(--ink3);text-transform:capitalize; }
  .tab.active { background:var(--bg);color:var(--ink);box-shadow:var(--s1); }
  .history-card { background:var(--bg);border:1px solid var(--bg3);border-radius:var(--r-lg);padding:16px 20px;cursor:pointer;transition:all .2s var(--ease); }
  .history-card:hover { transform:translateY(-2px);box-shadow:var(--s2);border-color:var(--bg4); }
`;

// ── Components ───────────────────────────────────────────────
function VerdictPill({ verdict, size }) {
  const cfg = {
    FAKE: { label: "Fake", cls: "pill-fake", icon: "✕" },
    REAL: { label: "Real", cls: "pill-real", icon: "✓" },
    UNCERTAIN: { label: "Uncertain", cls: "pill-warn", icon: "?" },
  };
  const c = cfg[verdict] || cfg.UNCERTAIN;
  const lg = size === "lg";
  return (
    <span className={"pill " + c.cls} style={{ fontSize: lg ? 14 : 12, padding: lg ? "7px 16px" : "4px 11px", gap: lg ? 8 : 5 }}>
      <span style={{ width: lg ? 18 : 12, height: lg ? 18 : 12, borderRadius: "50%", background: c.cls === "pill-fake" ? "var(--fake)" : c.cls === "pill-real" ? "var(--real)" : "var(--warn)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: lg ? 10 : 7, fontWeight: 700, flexShrink: 0 }}>{c.icon}</span>
      {c.label}
    </span>
  );
}

function ArcGauge({ value, verdict, size = 100 }) {
  const colors = { FAKE: "#c0392b", REAL: "#1a7a4a", UNCERTAIN: "#b8640a" };
  const color = colors[verdict] || "#7a7670";
  const r = 38, cx = 50, cy = 50, circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ * 0.75;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: "rotate(-135deg)" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg3)" strokeWidth={7}
          strokeDasharray={circ * 0.75 + " " + circ * 0.25} strokeDashoffset={-circ * 0.125} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={dash + " " + (circ - dash)} strokeDashoffset={-circ * 0.125} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1.2s var(--spring)", filter: "drop-shadow(0 0 5px " + color + "50)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size * 0.2, fontWeight: 700, color, fontFamily: "var(--font-d)", lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: size * 0.1, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>%</span>
      </div>
    </div>
  );
}

function AnimNum({ n }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const end = parseInt(n) || 0;
    if (!end) { setV(0); return; }
    let cur = 0;
    const step = Math.max(1, Math.floor(end / 25));
    const t = setInterval(() => { cur = Math.min(cur + step, end); setV(cur); if (cur >= end) clearInterval(t); }, 35);
    return () => clearInterval(t);
  }, [n]);
  return <>{v}</>;
}

function StatCard({ label, val, color = "var(--ink)", delay = 0 }) {
  return (
    <div className="card" style={{ padding: "18px 22px", flex: 1, minWidth: 110, animation: "fadeUp .5s var(--ease) " + delay + "s both" }}>
      <div style={{ fontSize: 11, color: "var(--ink3)", letterSpacing: ".09em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 600, color, fontFamily: "var(--font-d)", letterSpacing: "-.03em" }}><AnimNum n={val} /></div>
    </div>
  );
}

function LoadingSpinner() {
  const [step, setStep] = useState(0);
  const steps = ["Analyzing linguistic patterns…", "Checking source credibility…", "Evaluating fact consistency…", "Generating verdict…"];
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % 4), 1000); return () => clearInterval(t); }, []);
  return (
    <div style={{ padding: "44px 28px", textAlign: "center", animation: "scaleIn .4s var(--spring)" }}>
      <div style={{ position: "relative", width: 64, height: 64, margin: "0 auto 24px" }}>
        <div style={{ position: "absolute", inset: 0, border: "2px solid var(--bg3)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", inset: 0, border: "2px solid transparent", borderTopColor: "var(--ink)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <div style={{ position: "absolute", inset: 14, border: "1.5px solid transparent", borderTopColor: "var(--ink3)", borderRadius: "50%", animation: "spin .7s linear infinite reverse" }} />
        <div style={{ position: "absolute", inset: 26, background: "var(--ink)", borderRadius: "50%", animation: "pulse 1.5s ease-in-out infinite" }} />
      </div>
      <p style={{ fontFamily: "var(--font-d)", fontSize: 18, color: "var(--ink)", fontStyle: "italic", marginBottom: 6 }}>Analyzing…</p>
      <p style={{ fontSize: 12, color: "var(--ink3)", height: 18 }} key={step}>{steps[step]}</p>
      <div style={{ height: 2, background: "var(--bg3)", borderRadius: 1, marginTop: 20, overflow: "hidden" }}>
        <div style={{ height: "100%", background: "linear-gradient(90deg,var(--ink),var(--ink3),var(--ink))", borderRadius: 1, backgroundSize: "200% auto", animation: "shimmer 1.5s linear infinite" }} />
      </div>
    </div>
  );
}

function ResultPanel({ result, text }) {
  const [tab, setTab] = useState("overview");
  const vcfg = {
    FAKE: { color: "var(--fake)", bg: "var(--fake-bg)", border: "var(--fake-b)", label: "This appears to be fake news" },
    REAL: { color: "var(--real)", bg: "var(--real-bg)", border: "var(--real-b)", label: "This appears to be real news" },
    UNCERTAIN: { color: "var(--warn)", bg: "var(--warn-bg)", border: "var(--warn-b)", label: "Verdict is uncertain" },
  };
  const cfg = vcfg[result.verdict] || vcfg.UNCERTAIN;

  return (
    <div style={{ marginTop: 20, animation: "scaleIn .5s var(--spring)" }}>
      <div style={{ background: cfg.bg, border: "1px solid " + cfg.border, borderRadius: "var(--r-xl)", padding: "24px 28px", marginBottom: 14, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -50, top: -50, width: 200, height: 200, borderRadius: "50%", background: cfg.color, opacity: .04, pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 10 }}><VerdictPill verdict={result.verdict} size="lg" /></div>
            <h3 style={{ fontFamily: "var(--font-d)", fontSize: 20, color: "var(--ink)", fontStyle: "italic", letterSpacing: "-.02em", marginBottom: 8 }}>{cfg.label}</h3>
            <p style={{ fontSize: 14, color: "var(--ink2)", lineHeight: 1.7, maxWidth: 500 }}>{result.explanation}</p>
          </div>
          <ArcGauge value={result.confidence} verdict={result.verdict} size={90} />
        </div>
        <div style={{ display: "flex", gap: 0, marginTop: 18, paddingTop: 16, borderTop: "1px solid " + cfg.border, flexWrap: "wrap" }}>
          {[
            { label: "Risk", val: result.risk_level, color: result.risk_level === "HIGH" ? "var(--fake)" : result.risk_level === "MEDIUM" ? "var(--warn)" : "var(--real)" },
            { label: "Credibility", val: result.credibility_score + "/100", color: cfg.color },
            { label: "Red flags", val: result.red_flags?.length || 0, color: "var(--fake)" },
            { label: "Positives", val: result.positive_indicators?.length || 0, color: "var(--real)" },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, minWidth: 70, paddingRight: 12 }}>
              <div style={{ fontSize: 10, color: "var(--ink3)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: s.color, fontFamily: "var(--font-d)" }}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="tab-nav" style={{ marginBottom: 12 }}>
        {["overview", "linguistics", "keywords", "verify"].map(t => (
          <button key={t} className={"tab" + (tab === t ? " active" : "")} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      <div className="card" style={{ padding: "22px 26px", animation: "fadeIn .25s ease" }}>
        {tab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {result.red_flags?.length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: "var(--fake)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 10, fontWeight: 600 }}>✕ Red flags detected</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {result.red_flags.map((f, i) => <span key={i} className="pill pill-fake">{f}</span>)}
                </div>
              </div>
            )}
            {result.positive_indicators?.length > 0 && (
              <div>
                <div style={{ fontSize: 11, color: "var(--real)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 10, fontWeight: 600 }}>✓ Positive indicators</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {result.positive_indicators.map((f, i) => <span key={i} className="pill pill-real">{f}</span>)}
                </div>
              </div>
            )}
            <div style={{ background: "var(--bg2)", borderRadius: "var(--r-md)", padding: "14px 18px", borderLeft: "3px solid var(--bg4)" }}>
              <div style={{ fontSize: 11, color: "var(--ink3)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 5, fontWeight: 600 }}>Recommendation</div>
              <p style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.6 }}>{result.recommendation}</p>
            </div>
          </div>
        )}
        {tab === "linguistics" && result.linguistic_analysis && (
          <div>
            <p style={{ fontSize: 13, color: "var(--ink3)", marginBottom: 20, lineHeight: 1.6 }}>Higher emotional language + lower factual density = common fake news markers.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { key: "emotional_language", label: "Emotional Language", inv: true, desc: "High = more emotional" },
                { key: "factual_density", label: "Factual Density", inv: false, desc: "High = more factual" },
                { key: "source_citations", label: "Source Citations", inv: false, desc: "High = well cited" },
                { key: "writing_quality", label: "Writing Quality", inv: false, desc: "High = professional" },
              ].map(({ key, label, inv, desc }) => {
                const v = result.linguistic_analysis[key] || 0;
                const color = inv ? (v > 60 ? "var(--fake)" : v > 30 ? "var(--warn)" : "var(--real)") : (v > 60 ? "var(--real)" : v > 30 ? "var(--warn)" : "var(--fake)");
                return (
                  <div key={key}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                      <span style={{ fontSize: 14, color: "var(--ink)", fontWeight: 500 }}>{label} <span style={{ fontSize: 11, color: "var(--ink3)" }}>{desc}</span></span>
                      <span style={{ fontSize: 15, fontWeight: 600, color, fontFamily: "var(--font-d)" }}>{v}%</span>
                    </div>
                    <div style={{ height: 6, background: "var(--bg3)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: v + "%", background: color, borderRadius: 3, transformOrigin: "left", animation: "barIn .8s var(--spring) both" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {tab === "keywords" && (
          <div>
            <p style={{ fontSize: 13, color: "var(--ink3)", marginBottom: 14, lineHeight: 1.6 }}>Suspicious words highlighted in the original text.</p>
            {result.suspicious_keywords?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                {result.suspicious_keywords.map((kw, i) => (
                  <span key={i} style={{ background: "var(--fake-bg)", color: "var(--fake)", border: "1px solid var(--fake-b)", borderRadius: "var(--r-pill)", padding: "3px 10px", fontSize: 12, fontFamily: "monospace" }}>{kw}</span>
                ))}
              </div>
            )}
            <div style={{ background: "var(--bg2)", borderRadius: "var(--r-md)", padding: "14px 16px", fontSize: 13, lineHeight: 1.9, border: "1px solid var(--bg3)" }}>
              {text?.slice(0, 600).split(/\s+/).map((word, i) => {
                const clean = word.replace(/[^a-zA-Z]/g, "").toLowerCase();
                const flagged = result.suspicious_keywords?.some(k => clean.includes(k.toLowerCase()) || k.toLowerCase().includes(clean));
                return <span key={i} style={{ background: flagged ? "var(--fake-bg)" : "transparent", color: flagged ? "var(--fake)" : "var(--ink2)", borderRadius: flagged ? 3 : 0, padding: flagged ? "1px 2px" : 0, fontWeight: flagged ? 600 : 400 }}>{word} </span>;
              })}…
            </div>
          </div>
        )}
        {tab === "verify" && (
          <div>
            <p style={{ fontSize: 13, color: "var(--ink3)", marginBottom: 14, lineHeight: 1.6 }}>Use these queries to independently verify the claims.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {result.fact_check_queries?.map((q, i) => (
                <a key={i} href={"https://www.google.com/search?q=" + encodeURIComponent(q)} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg2)", borderRadius: "var(--r-md)", padding: "12px 16px", border: "1px solid var(--bg3)", textDecoration: "none", color: "var(--ink)", fontSize: 13, transition: "all .2s var(--ease)" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--bg3)"; e.currentTarget.style.transform = "translateX(4px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "var(--bg2)"; e.currentTarget.style.transform = ""; }}>
                  <span>🔍 {q}</span><span style={{ color: "var(--ink3)" }}>↗</span>
                </a>
              ))}
            </div>
            <div style={{ marginTop: 14, padding: "12px 16px", background: "var(--bg2)", borderRadius: "var(--r-md)", fontSize: 12, color: "var(--ink3)", lineHeight: 1.7 }}>
              Also check: <strong style={{ color: "var(--ink2)" }}>Snopes, FactCheck.org, PolitiFact, AFP Fact Check</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TruthBot({ analysis, onClose }) {
  const [msgs, setMsgs] = useState([{ role: "bot", text: "Hi! I'm TruthBot 🤖 Ask me anything about this analysis or how to spot fake news." }]);
  const [inp, setInp] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  const send = async () => {
    if (!inp.trim() || loading) return;
    const q = inp.trim(); setInp(""); setMsgs(m => [...m, { role: "user", text: q }]); setLoading(true);
    try { const r = await askBot(q, analysis || {}); setMsgs(m => [...m, { role: "bot", text: r }]); }
    catch { setMsgs(m => [...m, { role: "bot", text: "Connection error. Try again." }]); }
    setLoading(false);
  };
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, width: 340, zIndex: 1000, background: "var(--bg)", border: "1px solid var(--bg3)", borderRadius: "var(--r-xl)", display: "flex", flexDirection: "column", height: 420, boxShadow: "var(--s4)", animation: "scaleIn .4s var(--spring)" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--bg3)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🤖</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>TruthBot</div>
            <div style={{ fontSize: 10, color: "var(--real)", display: "flex", alignItems: "center", gap: 3 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--real)", display: "inline-block" }} />Online
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: "var(--bg2)", border: "1px solid var(--bg3)", borderRadius: "50%", width: 26, height: 26, cursor: "pointer", fontSize: 14, color: "var(--ink2)", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: 9 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "83%", padding: "9px 13px", borderRadius: m.role === "user" ? "16px 16px 3px 16px" : "3px 16px 16px 16px", fontSize: 13, lineHeight: 1.6, background: m.role === "user" ? "var(--ink)" : "var(--bg2)", color: m.role === "user" ? "var(--bg)" : "var(--ink)", border: m.role === "user" ? "none" : "1px solid var(--bg3)" }}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 5, padding: "9px 13px", background: "var(--bg2)", borderRadius: "3px 16px 16px 16px", width: "fit-content", border: "1px solid var(--bg3)" }}>
            {[0, 1, 2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ink3)", display: "inline-block", animation: "float 1s ease-in-out " + i * 0.15 + "s infinite" }} />)}
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div style={{ padding: "9px 12px", borderTop: "1px solid var(--bg3)", display: "flex", gap: 7 }}>
        <input value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask about fake news…" className="inp" style={{ flex: 1, fontSize: 13, padding: "8px 12px", borderRadius: "var(--r-pill)" }} />
        <button onClick={send} disabled={loading || !inp.trim()} style={{ background: "var(--ink)", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", color: "var(--bg)", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", opacity: loading || !inp.trim() ? 0.4 : 1, flexShrink: 0 }}>↑</button>
      </div>
    </div>
  );
}

function HistCard({ article, onClick, delay = 0 }) {
  const colors = { FAKE: "var(--fake)", REAL: "var(--real)", UNCERTAIN: "var(--warn)" };
  return (
    <div className="history-card" onClick={() => onClick(article)} style={{ borderLeft: "3px solid " + (colors[article.verdict] || "var(--bg4)"), animation: "fadeUp .4s var(--ease) " + delay + "s both" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <p style={{ fontSize: 13, color: "var(--ink2)", lineHeight: 1.5, flex: 1 }}>{article.text?.slice(0, 100)}…</p>
        <VerdictPill verdict={article.verdict} />
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 9, fontSize: 11, color: "var(--ink3)" }}>
        <span>{article.confidence}% confidence</span>
        {article.source && <span>· {article.source}</span>}
        <span style={{ marginLeft: "auto" }}>{timeAgo(article.timestamp)}</span>
      </div>
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [authErr, setAuthErr] = useState("");
  const [view, setView] = useState("checker");
  const [text, setText] = useState("");
  const [src, setSrc] = useState("");
  const [lang, setLang] = useState("en");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [articles, setArticles] = useState([]);
  const [showBot, setShowBot] = useState(false);
  const [toast, setToast] = useState(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => { loadArticles().then(setArticles); }, []);

  const showToast = (msg, type = "info") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const handleAuth = async () => {
  if (!form.email || !form.password || (authMode === "signup" && !form.name)) {
    setAuthErr("Please fill all fields.");
    return;
  }

  try {
    if (authMode === "signup") {
      // 🔥 CALL BACKEND API
      const res = await fetch("http://localhost:3001/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthErr(data.message || "Signup failed");
        return;
      }

      showToast("Account created successfully! 🎉", "success");
    }

    // 🔥 LOGIN (still frontend-based)
    setUser({
      name: form.name || form.email.split("@")[0],
      email: form.email,
      role: form.email.includes("admin") ? "admin" : "user",
    });

  } catch (err) {
    console.error(err);
    setAuthErr("Server error");
  }
};

  const handleAnalyze = async () => {
    if (text.trim().length < 50) { showToast("Please enter at least 50 characters.", "error"); return; }
    setAnalyzing(true); setResult(null);
    try {
      const analysis = await analyzeNewsWithAI(text, "", src);
      setResult(analysis);
      const article = { id: generateId(), text, source: src, language: lang, ...analysis, timestamp: Date.now(), userId: user?.email };
      setArticles(prev => [article, ...prev]);
      await saveArticle(article);
      showToast("Analysis complete!", "success");
    } catch (e) { showToast("Error: " + e.message, "error"); }
    setAnalyzing(false);
  };

  const stats = {
    total: articles.length,
    fake: articles.filter(a => a.verdict === "FAKE").length,
    real: articles.filter(a => a.verdict === "REAL").length,
    fakeP: articles.length ? Math.round(articles.filter(a => a.verdict === "FAKE").length / articles.length * 100) : 0
  };

  const langs = [
    { code: "en", l: "English" }, { code: "hi", l: "हिन्दी" },
    { code: "mr", l: "मराठी" }, { code: "bn", l: "বাংলা" },
    { code: "ta", l: "தமிழ்" }, { code: "te", l: "తెలుగు" },
  ];

  if (!user) return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "var(--bg)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "5%", left: "10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(192,57,43,.05) 0%,transparent 70%)", animation: "orb 14s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: "5%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(26,122,74,.05) 0%,transparent 70%)", animation: "orb 18s ease-in-out infinite reverse" }} />
        </div>
        <div style={{ width: "100%", maxWidth: 400, position: "relative" }}>
          <div style={{ textAlign: "center", marginBottom: 36, animation: "fadeUp .6s var(--ease)" }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", boxShadow: "0 8px 28px rgba(26,24,20,.2)" }}>
              <span style={{ fontSize: 22, color: "var(--bg)" }}>⊘</span>
            </div>
            <h1 style={{ fontFamily: "var(--font-d)", fontSize: 30, color: "var(--ink)", letterSpacing: "-.03em", fontStyle: "italic" }}>TruthGuard</h1>
            <p style={{ color: "var(--ink3)", fontSize: 14, marginTop: 5 }}>AI Fake News Detector — Powered by Groq (Free)</p>
          </div>
          <div className="card" style={{ padding: 28, boxShadow: "var(--s3)", animation: "fadeUp .7s var(--ease) .1s both" }}>
            <div style={{ display: "flex", background: "var(--bg2)", borderRadius: "var(--r-pill)", padding: 4, marginBottom: 24, border: "1px solid var(--bg3)" }}>
              {["login", "signup"].map(m => (
                <button key={m} onClick={() => { setAuthMode(m); setAuthErr(""); }} style={{ flex: 1, padding: "8px", borderRadius: "var(--r-pill)", border: "none", cursor: "pointer", background: authMode === m ? "var(--bg)" : "transparent", color: authMode === m ? "var(--ink)" : "var(--ink3)", fontFamily: "var(--font-b)", fontSize: 13, fontWeight: 500, boxShadow: authMode === m ? "var(--s1)" : "none", transition: "all .2s var(--ease)" }}>
                  {m === "login" ? "Sign in" : "Sign up"}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              {authMode === "signup" && (
                <div>
                  <label style={{ fontSize: 12, color: "var(--ink3)", display: "block", marginBottom: 5, fontWeight: 500 }}>Full name</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="inp" />
                </div>
              )}
              <div>
                <label style={{ fontSize: 12, color: "var(--ink3)", display: "block", marginBottom: 5, fontWeight: 500 }}>Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="inp" />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--ink3)", display: "block", marginBottom: 5, fontWeight: 500 }}>Password</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} onKeyDown={e => e.key === "Enter" && handleAuth()} placeholder="••••••••" className="inp" />
              </div>
            </div>
            {authErr && <div style={{ marginTop: 12, padding: "9px 13px", background: "var(--fake-bg)", border: "1px solid var(--fake-b)", borderRadius: "var(--r-md)", fontSize: 13, color: "var(--fake)" }}>{authErr}</div>}
            <button className="btn btn-primary" onClick={handleAuth} style={{ width: "100%", marginTop: 18, padding: "13px" }}>{authMode === "login" ? "Sign in →" : "Create account →"}</button>
            <p style={{ textAlign: "center", fontSize: 11, color: "var(--ink4)", marginTop: 14 }}>Any email & password works · admin@truth.ai for admin</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      {toast && (
        <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 9999, background: "var(--ink)", color: "var(--bg)", borderRadius: "var(--r-pill)", padding: "9px 18px", fontSize: 13, fontWeight: 500, boxShadow: "var(--s3)", animation: "slideUp .3s var(--spring)", display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap" }}>
          {toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : "·"} {toast.msg}
        </div>
      )}
      {showBot && <TruthBot analysis={result} onClose={() => setShowBot(false)} />}

      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-15%", right: "-8%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(192,57,43,.04) 0%,transparent 70%)", animation: "orb 20s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "3%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(26,122,74,.04) 0%,transparent 70%)", animation: "orb 25s ease-in-out infinite reverse" }} />
      </div>

      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(248,247,244,.85)", backdropFilter: "blur(20px) saturate(1.8)", WebkitBackdropFilter: "blur(20px) saturate(1.8)", borderBottom: "1px solid var(--bg3)", padding: "0 28px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 26, height: 26, background: "var(--ink)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "var(--bg)", fontSize: 13 }}>⊘</span>
            </div>
            <span style={{ fontFamily: "var(--font-d)", fontSize: 16, color: "var(--ink)", fontStyle: "italic" }}>TruthGuard</span>
            
          </div>
          <div style={{ display: "flex", gap: 3 }}>
            {["checker", "history", "about"].map(v => (
              <button key={v} onClick={() => setView(v)} style={{ background: view === v ? "var(--bg2)" : "transparent", border: view === v ? "1px solid var(--bg3)" : "1px solid transparent", borderRadius: "var(--r-pill)", padding: "5px 13px", color: view === v ? "var(--ink)" : "var(--ink3)", cursor: "pointer", fontSize: 13, fontWeight: view === v ? 500 : 400, fontFamily: "var(--font-b)", transition: "all .2s var(--ease)", textTransform: "capitalize" }}>
                {v === "checker" ? "Detector" : v}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <button className="btn btn-ghost" onClick={() => setShowBot(true)} style={{ fontSize: 12, padding: "6px 14px" }}>🤖 TruthBot</button>
          <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 11px", background: "var(--bg2)", borderRadius: "var(--r-pill)", border: "1px solid var(--bg3)" }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "var(--bg)", fontWeight: 600 }}>{user.name[0].toUpperCase()}</div>
            <span style={{ fontSize: 13, color: "var(--ink2)" }}>{user.name}</span>
            {user.role === "admin" && <span style={{ background: "var(--ink)", color: "var(--bg)", borderRadius: "var(--r-pill)", padding: "1px 7px", fontSize: 9, fontWeight: 600, letterSpacing: ".06em" }}>ADMIN</span>}
          </div>
          <button className="btn btn-ghost" onClick={() => setUser(null)} style={{ fontSize: 12, padding: "6px 13px" }}>Logout</button>
        </div>
      </nav>

      <main style={{ maxWidth: 820, margin: "0 auto", padding: "30px 22px", position: "relative", zIndex: 1 }}>
        {view === "checker" && (
          <>
            <div style={{ marginBottom: 28, animation: "fadeUp .6s var(--ease)" }}>
              <h1 style={{ fontFamily: "var(--font-d)", fontSize: 40, color: "var(--ink)", letterSpacing: "-.03em", lineHeight: 1.1, fontStyle: "italic", marginBottom: 9 }}>Is it real,<br />or is it fake?</h1>
              
            </div>
            <div style={{ display: "flex", gap: 11, marginBottom: 26, flexWrap: "wrap" }}>
              <StatCard label="Total checked" val={stats.total} delay={.05} />
              <StatCard label="Fake detected" val={stats.fake} color="var(--fake)" delay={.1} />
              <StatCard label="Real verified" val={stats.real} color="var(--real)" delay={.15} />
              <StatCard label="Fake rate" val={stats.fakeP} color="var(--ink3)" delay={.2} />
            </div>
            <div className="card" style={{ border: "1.5px solid " + (focused ? "var(--ink)" : "var(--bg3)"), boxShadow: focused ? "0 0 0 4px rgba(26,24,20,.05),var(--s2)" : "var(--s1)", transition: "all .3s var(--ease)", overflow: "hidden", animation: "fadeUp .6s var(--ease) .2s both" }}>
              <div style={{ padding: "16px 22px 13px", borderBottom: "1px solid var(--bg3)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 9 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>News Detector</span>
                <select value={lang} onChange={e => setLang(e.target.value)} style={{ background: "var(--bg2)", border: "1px solid var(--bg3)", borderRadius: "var(--r-pill)", padding: "5px 11px", color: "var(--ink)", fontSize: 12, fontFamily: "var(--font-b)", outline: "none", cursor: "pointer" }}>
                  {langs.map(l => <option key={l.code} value={l.code}>{l.l}</option>)}
                </select>
              </div>
              <div style={{ padding: "15px 22px" }}>
                <div style={{ display: "flex", gap: 9, marginBottom: 11 }}>
                  <input value={src} onChange={e => setSrc(e.target.value)} placeholder="Source name (optional)" className="inp" style={{ flex: 1, fontSize: 12, padding: "9px 13px" }} />
                </div>
                <div style={{ position: "relative" }}>
                  <textarea value={text} onChange={e => setText(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    placeholder={"Paste your news article here…\n\nTip: More text = more accurate analysis."}
                    rows={8} className="inp" style={{ resize: "vertical", lineHeight: 1.7, borderRadius: "var(--r-lg)" }} />
                  <span style={{ position: "absolute", bottom: 11, right: 13, fontSize: 11, color: text.length < 50 ? "var(--fake)" : "var(--ink4)" }}>
                    {text.length} chars {text.length < 50 ? "(" + (50 - text.length) + " more needed)" : "✓"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 13, flexWrap: "wrap" }}>
                  <button className="btn btn-primary" onClick={handleAnalyze} disabled={analyzing || text.trim().length < 50}>
                    {analyzing ? "⟳ Analyzing…" : "⊘ Detect Fake News"}
                  </button>
                  <button className="btn btn-secondary" onClick={() => { setText(""); setSrc(""); setResult(null); }}>Clear</button>
                  <div style={{ marginLeft: "auto", display: "flex", gap: 7 }}>
                    <button className="btn btn-sm-fake" onClick={() => setText("SHOCKING: Government secretly adds mind-control chemicals to tap water, anonymous insider reveals. Multiple unnamed sources confirm that the deep state has been fluoridating water supplies since 1950 to control population behavior. Experts say this is 1000% true and mainstream media is covering it up. Share this before it gets deleted!!!")}>Fake sample</button>
                    <button className="btn btn-sm-real" onClick={() => setText("The Reserve Bank of India raised its benchmark interest rate by 25 basis points to 6.75% on Wednesday, according to an official statement from Governor Shaktikanta Das. The Monetary Policy Committee voted 4-2 in favor of the hike, citing persistent inflation concerns. Consumer price inflation rose 5.1% year-on-year in October, above the RBI 4% target. Economists at Goldman Sachs and Morgan Stanley had predicted this outcome.")}>Real sample</button>
                  </div>
                </div>
              </div>
            </div>
            {analyzing && <div className="card" style={{ marginTop: 18 }}><LoadingSpinner /></div>}
            {result && !analyzing && <ResultPanel result={result} text={text} />}
          </>
        )}

        {view === "history" && (
          <div style={{ animation: "fadeUp .5s var(--ease)" }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontFamily: "var(--font-d)", fontSize: 30, color: "var(--ink)", letterSpacing: "-.03em", fontStyle: "italic" }}>Check history</h2>
              <p style={{ color: "var(--ink3)", fontSize: 14, marginTop: 5 }}>{articles.length} articles analyzed</p>
            </div>
            {articles.length === 0 ? (
              <div className="card" style={{ padding: "56px 28px", textAlign: "center" }}>
                <div style={{ fontSize: 44, marginBottom: 14 }}>📋</div>
                <p style={{ color: "var(--ink3)", fontSize: 15 }}>No articles checked yet.</p>
                <button className="btn btn-primary" onClick={() => setView("checker")} style={{ marginTop: 16 }}>Check your first article →</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {articles.map((a, i) => <HistCard key={a.id} article={a} onClick={() => setView("checker")} delay={i * 0.04} />)}
              </div>
            )}
          </div>
        )}

        {view === "about" && (
          <div style={{ animation: "fadeUp .5s var(--ease)", maxWidth: 620 }}>
            <h2 style={{ fontFamily: "var(--font-d)", fontSize: 30, color: "var(--ink)", letterSpacing: "-.03em", fontStyle: "italic", marginBottom: 7 }}>About TruthGuard</h2>
            <p style={{ color: "var(--ink3)", fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>A production-ready AI platform for detecting fake news — now powered by Groq (100% free).</p>
            {[
              { e: "🚀", t: "Powered by Groq", b: "Uses Llama 3.3 70B via Groq's free API. Groq is the fastest AI inference platform — responses in under 1 second. No credit card, no payment ever." },
              { e: "🧠", t: "AI Detection", b: "Analyzes semantic patterns, emotional language, source credibility, logical consistency, and journalistic standards to classify news as FAKE, REAL, or UNCERTAIN." },
              { e: "⚡", t: "Detection pipeline", b: "Text preprocessing → Linguistic analysis → Source credibility → Claim checking → Red flag detection → Confidence scoring → Explainability." },
              { e: "🌐", t: "Multi-language", b: "Supports 8 Indian languages: Hindi, Marathi, Bengali, Tamil, Telugu, Kannada, Gujarati + English. Llama 3.3 natively understands all." },
              { e: "🔑", t: "Setup", b: "Get your free Groq API key at console.groq.com → API Keys → Create. Add it to your .env file as REACT_APP_GROQ_API_KEY=your_key_here" },
            ].map((item, i) => (
              <div key={i} className="card" style={{ padding: "18px 22px", marginBottom: 9, cursor: "default", transition: "all .2s var(--ease)", animation: "fadeUp .4s var(--ease) " + i * 0.07 + "s both" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateX(5px)"; e.currentTarget.style.borderColor = "var(--bg4)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "var(--bg3)"; }}>
                <div style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{item.e}</span>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>{item.t}</h3>
                    <p style={{ fontSize: 13, color: "var(--ink3)", lineHeight: 1.7 }}>{item.b}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
