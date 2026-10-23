
import { useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");
const API_URL = `${API_BASE_URL}/events`;
const AUTH_URL = `${API_BASE_URL}/auth`;

// Parse API responses safely and explain when the frontend receives HTML.
async function readApiResponse(response) {
  const responseText = await response.text();
  if (!responseText) return {};
  try {
    return JSON.parse(responseText);
  } catch {
    throw new Error(
      `EventEase API returned a non-JSON response (HTTP ${response.status}). Restart the updated backend from the server folder and verify it is running on port 5000.`
    );
  }
}

const THEME_CSS = `
  [data-theme] { transition: background-color .28s ease, color .28s ease, border-color .28s ease; }
  [data-theme] *, [data-theme] *::before, [data-theme] *::after {
    transition: background-color .28s ease, color .28s ease, border-color .28s ease, box-shadow .28s ease;
  }

  /* Shared workspace dark theme */
  [data-theme="dark"] { color-scheme: dark; background-color: #10131c !important; color: #e9ecf5 !important; }
  [data-theme="dark"] .app-shell,
  [data-theme="dark"] .main-content { background: #10131c !important; color: #e9ecf5 !important; }
  [data-theme="dark"] .sidebar,
  [data-theme="dark"] .topbar,
  [data-theme="dark"] .stat-card,
  [data-theme="dark"] .event-card,
  [data-theme="dark"] .event-modal,
  [data-theme="dark"] .control-room,
  [data-theme="dark"] .readiness-panel,
  [data-theme="dark"] .empty-state,
  [data-theme="dark"] .control-room-section { background-color: #1a2030 !important; color: #e9ecf5 !important; border-color: #30374b !important; }
  [data-theme="dark"] .brand,
  [data-theme="dark"] .stat-card > strong,
  [data-theme="dark"] .event-card-content h3,
  [data-theme="dark"] .section-heading h2,
  [data-theme="dark"] .readiness-heading h4,
  [data-theme="dark"] .control-room-section h3,
  [data-theme="dark"] .modal-heading h2 { color: #f0f2fa !important; }
  [data-theme="dark"] .breadcrumb,
  [data-theme="dark"] .subtitle,
  [data-theme="dark"] .nav-label,
  [data-theme="dark"] .event-description,
  [data-theme="dark"] .event-detail,
  [data-theme="dark"] .sidebar-bottom p,
  [data-theme="dark"] .section-heading p,
  [data-theme="dark"] .stat-top,
  [data-theme="dark"] .stat-card > p,
  [data-theme="dark"] .event-card-footer,
  [data-theme="dark"] .readiness-heading p,
  [data-theme="dark"] .readiness-task,
  [data-theme="dark"] .control-room-section p,
  [data-theme="dark"] .control-room-section ul { color: #b9c0d4 !important; }
  [data-theme="dark"] .nav-item:not(.active),
  [data-theme="dark"] .secondary-button,
  [data-theme="dark"] .mobile-workspace-nav .nav-item:not(.active) { background: #1a2030 !important; color: #e1e5f0 !important; border-color: #343c51 !important; }
  [data-theme="dark"] .nav-item.active { background: #302b55 !important; color: #e5e0ff !important; border-color: #7164d8 !important; }
  [data-theme="dark"] .search-input,
  [data-theme="dark"] input:not([type="checkbox"]),
  [data-theme="dark"] textarea,
  [data-theme="dark"] select,
  [data-theme="dark"] .event-modal input,
  [data-theme="dark"] .event-modal textarea { background-color: #111622 !important; color: #f0f2fa !important; border-color: #353c50 !important; }
  [data-theme="dark"] .modal-backdrop { background: rgba(0,0,0,.68) !important; }
  [data-theme="dark"] .close-button { background: #292f40 !important; color: #f0f2fa !important; }
  [data-theme="dark"] .control-room-section { background: #151b29 !important; }

  /* Landing page selectors include the theme root itself; inline light styles are intentionally overridden here. */
  .eventease-landing[data-theme="dark"] { background: #10131c !important; color: #e9ecf5 !important; }
  .eventease-landing[data-theme="dark"] header,
  .eventease-landing[data-theme="dark"] footer { background: rgba(20,24,36,.97) !important; border-color: #2a3041 !important; color: #e9ecf5 !important; }
  .eventease-landing[data-theme="dark"] main > section:first-child { background: radial-gradient(ellipse at 82% 18%, rgba(126,111,246,.18), transparent 38%), linear-gradient(180deg,#171a2a 0%,#10131c 100%) !important; border-color: #292f41 !important; }
  .eventease-landing[data-theme="dark"] main > section:not(:first-child) { background-color: #10131c !important; border-color: #292f41 !important; color: #e9ecf5 !important; }
  .eventease-landing[data-theme="dark"] #landing-features { background: #141824 !important; }
  .eventease-landing[data-theme="dark"] .ee-card,
  .eventease-landing[data-theme="dark"] .ee-secondary,
  .eventease-landing[data-theme="dark"] .ee-feature-grid > div,
  .eventease-landing[data-theme="dark"] .ee-feature-grid > article,
  .eventease-landing[data-theme="dark"] .ee-event-grid > article { background-color: #1b2030 !important; border-color: #30374b !important; color: #e9ecf5 !important; }
  .eventease-landing[data-theme="dark"] .ee-nav-link { color: #c5cadd !important; }
  .eventease-landing[data-theme="dark"] h1,
  .eventease-landing[data-theme="dark"] h2,
  .eventease-landing[data-theme="dark"] h3 { color: #f0f2fa !important; }
  .eventease-landing[data-theme="dark"] p { color: #b9c0d4 !important; }
  .eventease-landing[data-theme="dark"] .ee-hero-title span { color: #a69aff !important; }
  .eventease-landing[data-theme="dark"] .ee-secondary { background: #242a3a !important; color: #ded8ff !important; border-color: #45405f !important; }
  .eventease-landing[data-theme="dark"] .ee-hero-grid > div:last-child > div:last-child { background: #1b2030 !important; border-color: #30374b !important; }
  .eventease-landing[data-theme="dark"] .ee-hero-grid > div:last-child > div:last-child > div:nth-child(2) > div:nth-child(1) { background: #292543 !important; }
  .eventease-landing[data-theme="dark"] .ee-hero-grid > div:last-child > div:last-child > div:nth-child(2) > div:nth-child(2) { background: #1e3834 !important; }
  .eventease-landing[data-theme="dark"] .ee-hero-grid > div:last-child > div:last-child > div:nth-child(2) > div:nth-child(3) { background: #3a2d24 !important; }
  .eventease-landing[data-theme="dark"] .ee-hero-grid > div:last-child > div:last-child > div:nth-child(2) > div:nth-child(4) { background: #222f45 !important; }

  /* Authentication screen: keep text, card, and fields on the same theme. */
  .eventease-auth-layout[data-theme="light"] { background: #f6f7fb !important; color: #171923 !important; }
  .eventease-auth-layout[data-theme="light"] > section:last-of-type { background: #f6f7fb !important; color: #171923 !important; }
  .eventease-auth-layout[data-theme="light"] > section:last-of-type > div { background: #fff !important; color: #20243a !important; border-color: #e8eaf1 !important; }
  .eventease-auth-layout[data-theme="light"] h2,
  .eventease-auth-layout[data-theme="light"] label { color: #20243a !important; }
  .eventease-auth-layout[data-theme="light"] input { background: #fff !important; color: #171923 !important; border-color: #dfe3eb !important; }
  .eventease-auth-layout[data-theme="dark"] { background: #10131c !important; color: #e9ecf5 !important; }
  .eventease-auth-layout[data-theme="dark"] > section:last-of-type { background: #10131c !important; color: #e9ecf5 !important; }
  .eventease-auth-layout[data-theme="dark"] > section:last-of-type > div { background: #1a2030 !important; color: #e9ecf5 !important; border-color: #30374b !important; }
  .eventease-auth-layout[data-theme="dark"] h2 { color: #f0f2fa !important; }
  .eventease-auth-layout[data-theme="dark"] label,
  .eventease-auth-layout[data-theme="dark"] > section:last-of-type > div > p:not(:first-child) { color: #c2c8d9 !important; }
  .eventease-auth-layout[data-theme="dark"] input { background: #111622 !important; color: #f0f2fa !important; border-color: #353c50 !important; }
  .eventease-auth-layout[data-theme="dark"] input::placeholder { color: #929bb0 !important; opacity: 1; }

  @media (prefers-reduced-motion: reduce) {
    [data-theme] *, [data-theme] *::before, [data-theme] *::after { transition: none !important; }
  }
`;

function ThemeStyles() {
  return <style>{THEME_CSS}</style>;
}

function ThemeToggle({ theme, onToggleTheme }) {
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={onToggleTheme}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Switch to light theme" : "Switch to dark theme"}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "9px 12px", border: "1px solid var(--border-color, #d9dee7)", borderRadius: 10, background: dark ? "#252b3c" : "#fff", color: dark ? "#f2e9b8" : "#30334a", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
    >
      <span aria-hidden="true" style={{ fontSize: 16 }}>{dark ? "☀" : "☾"}</span>
      <span>{dark ? "Light mode" : "Dark mode"}</span>
    </button>
  );
}

const READINESS_TASKS = [
  ["venueConfirmed", "Venue confirmed"],
  ["volunteersAssigned", "Volunteers assigned"],
  ["schedulePrepared", "Schedule prepared"],
  ["registrationReady", "Registration ready"],
];


function AuthScreen({ onAuthenticated, onBackToLanding, initialMode = "login", theme, onToggleTheme }) {
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submitAuth(e) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");

    try {
      const isRegister = mode === "register";
      const response = await fetch(
        `${AUTH_URL}/${isRegister ? "register" : "login"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isRegister ? { name: name.trim(), email: email.trim(), password } : {
              email: email.trim(),
              password,
            }
          ),
        }
      );

      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed.");
      }

      if (isRegister) {
        setMode("login");
        setPassword("");
        setMessage("Account created. Log in to continue.");
      } else {
        localStorage.setItem("eventease_token", data.token);
        onAuthenticated(data.token);
      }
    } catch (err) {
      setError(err.message || "Could not connect to EventEase.");
    } finally {
      setBusy(false);
    }
  }

  const pageStyle = {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.05fr) minmax(360px, 0.95fr)",
    background: theme === "dark" ? "#10131c" : "#f6f7fb",
    color: theme === "dark" ? "#e9ecf5" : "#171923",
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
  };

  const fieldStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    border: theme === "dark" ? "1px solid #353c50" : "1px solid #dfe3eb",
    borderRadius: "10px",
    background: theme === "dark" ? "#111622" : "#fff",
    color: theme === "dark" ? "#f0f2fa" : "#171923",
    fontSize: "14px",
    outlineOffset: "2px",
  };

  return (
    <div className="eventease-auth-layout" data-theme={theme} style={pageStyle}>
      <ThemeStyles />
      <div style={{ position: "fixed", top: 18, right: 18, zIndex: 20 }}><ThemeToggle theme={theme} onToggleTheme={onToggleTheme} /></div>
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "clamp(28px, 6vw, 76px)",
          background: "linear-gradient(145deg, #17182b 0%, #27254b 58%, #4b3c82 100%)",
          color: "#fff",
          minHeight: "100vh",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontWeight: 750, letterSpacing: "-0.03em", fontSize: 20 }}>
          <span style={{ display: "grid", placeItems: "center", width: 38, height: 38, borderRadius: 12, background: "#8b7cf6", color: "#fff" }}>E</span>
          EventEase
        </div>
        <div style={{ maxWidth: 560, padding: "60px 0" }}>
          <p style={{ color: "#c9c4ff", textTransform: "uppercase", letterSpacing: "0.16em", fontSize: 11, fontWeight: 700 }}>Campus events, organized</p>
          <h1 style={{ fontSize: "clamp(38px, 5vw, 68px)", lineHeight: 1.03, letterSpacing: "-0.055em", margin: "18px 0" }}>
            Make every campus event count.
          </h1>
          <p style={{ color: "#d5d4e5", fontSize: 16, lineHeight: 1.75, maxWidth: 440, margin: 0 }}>
            One place to plan events, prepare your team, and bring your campus community together.
          </p>
        </div>
        <p style={{ color: "#b8b6d0", fontSize: 12, margin: 0 }}>Plan clearly. Run smoothly.</p>
      </section>

      <section style={{ display: "grid", placeItems: "center", padding: 24, boxSizing: "border-box" }}>
        <div style={{ width: "100%", maxWidth: 410, background: theme === "dark" ? "#1a2030" : "#fff", color: theme === "dark" ? "#e9ecf5" : "#20243a", border: `1px solid ${theme === "dark" ? "#30374b" : "#e8eaf1"}`, borderRadius: 20, padding: "clamp(24px, 4vw, 40px)", boxSizing: "border-box", boxShadow: "0 18px 55px rgba(28, 30, 60, 0.07)" }}>
          {onBackToLanding && <button type="button" onClick={onBackToLanding} style={{ border: 0, background: "transparent", color: "#6556d9", padding: 0, marginBottom: 22, fontWeight: 700, cursor: "pointer" }}>← Back to home</button>}
          <p style={{ color: "#7162db", textTransform: "uppercase", letterSpacing: "0.13em", fontWeight: 750, fontSize: 11, margin: "0 0 10px" }}>
            {mode === "login" ? "Welcome back" : "Get started"}
          </p>
          <h2 style={{ fontSize: 29, letterSpacing: "-0.04em", margin: "0 0 9px" }}>
            {mode === "login" ? "Sign in to EventEase" : "Create your account"}
          </h2>
          <p style={{ color: "#737789", fontSize: 14, lineHeight: 1.6, margin: "0 0 26px" }}>
            {mode === "login" ? "Enter your details to continue to your workspace." : "Create a participant account to get started."}
          </p>

          <form onSubmit={submitAuth} style={{ display: "grid", gap: 16 }}>
            {mode === "register" && (
              <label style={{ display: "grid", gap: 7, fontSize: 13, fontWeight: 650, color: theme === "dark" ? "#d0d5e4" : "#20243a" }}>
                Full name
                <input style={fieldStyle} required maxLength={100} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </label>
            )}
            <label style={{ display: "grid", gap: 7, fontSize: 13, fontWeight: 650, color: theme === "dark" ? "#d0d5e4" : "#20243a" }}>
              Email address
              <input style={fieldStyle} required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </label>
            <label style={{ display: "grid", gap: 7, fontSize: 13, fontWeight: 650, color: theme === "dark" ? "#d0d5e4" : "#20243a" }}>
              Password
              <input style={fieldStyle} required type="password" minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
            </label>

            {message && <p role="status" style={{ color: "#217a4b", background: "#edf9f1", padding: "10px 12px", borderRadius: 9, fontSize: 13, margin: 0 }}>{message}</p>}
            {error && <p role="alert" style={{ color: "#b42318", background: "#fff0ef", padding: "10px 12px", borderRadius: 9, fontSize: 13, margin: 0 }}>{error}</p>}

            <button type="submit" disabled={busy} style={{ border: 0, borderRadius: 10, background: "#6556d9", color: "#fff", fontWeight: 700, fontSize: 14, padding: "14px 16px", cursor: busy ? "wait" : "pointer", opacity: busy ? 0.7 : 1, marginTop: 4 }}>
              {busy ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 13, color: "#737789", margin: "22px 0 0" }}>
            {mode === "login" ? "New to EventEase? " : "Already have an account? "}
            <button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setMessage(""); }} style={{ border: 0, padding: 0, background: "transparent", color: "#6556d9", fontWeight: 750, cursor: "pointer" }}>
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>
          <p style={{ fontSize: 11, lineHeight: 1.5, color: "#8a8da0", textAlign: "center", margin: "18px 0 0" }}>
            New registrations receive participant access. Organizer access is assigned separately.
          </p>
        </div>
      </section>

      <style>{`
        @media (max-width: 760px) {
          .eventease-auth-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}


function LandingPage({ onLogin, onRegister, theme, onToggleTheme }) {
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadPublicEvents() {
      try {
        const response = await fetch(API_URL);
        const data = await readApiResponse(response);
        if (!response.ok) throw new Error("Could not load events");
        const upcoming = (Array.isArray(data) ? data : [])
          .filter((event) => !event.isCancelled && String(event.status || "").toLowerCase() !== "cancelled" && new Date(event.date) >= new Date())
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 3);
        if (!cancelled) setEvents(upcoming);
      } catch {
        if (!cancelled) setEvents([]);
      } finally {
        if (!cancelled) setEventsLoading(false);
      }
    }
    loadPublicEvents();
    return () => { cancelled = true; };
  }, []);

  const scrollToEvents = () => document.getElementById("landing-events")?.scrollIntoView({ behavior: "smooth" });
  const dateLabel = (value) => new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="eventease-landing" data-theme={theme} style={{ minHeight: "100vh", background: "#fbfbfe", color: "#191a2e", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
      <ThemeStyles />
      <style>{`
        .eventease-landing * { box-sizing: border-box; }
        .ee-container { width: min(1160px, calc(100% - 48px)); margin: 0 auto; }
        .ee-nav-link { border: 0; background: transparent; color: #5f6177; font: inherit; font-size: 14px; font-weight: 650; cursor: pointer; padding: 10px 12px; }
        .ee-primary { border: 0; border-radius: 12px; background: #6556d9; color: #fff; padding: 13px 19px; font: inherit; font-weight: 750; font-size: 14px; cursor: pointer; box-shadow: 0 8px 20px rgba(101,86,217,.20); }
        .ee-secondary { border: 1px solid #dcd9fb; border-radius: 12px; background: #fff; color: #4d43b4; padding: 12px 18px; font: inherit; font-weight: 750; font-size: 14px; cursor: pointer; }
        .ee-hero-grid { display: grid; grid-template-columns: minmax(0,1.04fr) minmax(300px,.96fr); align-items: center; gap: 54px; padding: 76px 0 70px; }
        .ee-feature-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 18px; }
        .ee-event-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 18px; }
        .ee-card { background: #fff; border: 1px solid #e9e9f3; border-radius: 18px; padding: 22px; box-shadow: 0 12px 32px rgba(31,29,70,.04); }
        @media (max-width: 760px) { .ee-container { width: min(100% - 32px, 560px); } .ee-hero-grid { grid-template-columns: 1fr; gap: 34px; padding: 52px 0; } .ee-feature-grid,.ee-event-grid { grid-template-columns: 1fr; } .ee-nav-links { display:none !important; } .ee-hero-title { font-size: clamp(42px, 12vw, 60px) !important; } }
      `}</style>

      <header style={{ background: "rgba(255,255,255,.88)", borderBottom: "1px solid #eeedf6", position: "sticky", top: 0, zIndex: 5, backdropFilter: "blur(14px)" }}>
        <div className="ee-container" style={{ minHeight: 76, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18 }}>
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="EventEase home" style={{ display: "flex", alignItems: "center", gap: 11, border: 0, background: "transparent", cursor: "pointer", padding: 0, color: "#191a2e", fontSize: 20, fontWeight: 850, letterSpacing: "-.045em" }}>
            <span style={{ width: 38, height: 38, borderRadius: 12, display: "grid", placeItems: "center", color: "white", background: "linear-gradient(135deg,#7d70f3,#5545c5)", boxShadow: "0 7px 16px rgba(101,86,217,.25)" }}>E</span> EventEase
          </button>
          <nav className="ee-nav-links" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button className="ee-nav-link" onClick={scrollToEvents}>Explore events</button>
            <button className="ee-nav-link" onClick={() => document.getElementById("landing-features")?.scrollIntoView({ behavior: "smooth" })}>Features</button>
            <button className="ee-nav-link" onClick={() => document.getElementById("landing-how")?.scrollIntoView({ behavior: "smooth" })}>How it works</button>
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
            <button type="button" className="ee-nav-link" onClick={onLogin}>Log in</button>
            <button type="button" className="ee-primary" onClick={onRegister} style={{ padding: "11px 16px" }}>Get started <span aria-hidden="true">↗</span></button>
          </div>
        </div>
      </header>

      <main>
        <section style={{ background: "radial-gradient(ellipse at 82% 18%, rgba(126,111,246,.15), transparent 38%), linear-gradient(180deg,#f7f6ff 0%,#fbfbfe 100%)", borderBottom: "1px solid #f0eff9" }}>
          <div className="ee-container ee-hero-grid">
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", border: "1px solid #e1ddff", background: "#fff", borderRadius: 999, color: "#5547bd", fontSize: 12, fontWeight: 800, letterSpacing: ".04em" }}><span style={{ width: 7, height: 7, background: "#7a6bed", borderRadius: 99 }} /> CAMPUS EVENTS, MADE SIMPLE</div>
              <h1 className="ee-hero-title" style={{ fontSize: "clamp(46px,5.5vw,72px)", lineHeight: 1.02, letterSpacing: "-.065em", margin: "24px 0 20px", maxWidth: 680 }}>Your campus.<br /><span style={{ color: "#6556d9" }}>Your events.</span><br />One platform.</h1>
              <p style={{ fontSize: 17, lineHeight: 1.8, color: "#686a80", maxWidth: 550, margin: "0 0 28px" }}>Discover what's happening, register in a few clicks, and help your campus events run smoothly—from planning to event day.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                <button type="button" className="ee-primary" onClick={onRegister}>Explore and register <span aria-hidden="true">→</span></button>
                <button type="button" className="ee-secondary" onClick={onLogin}>Organizer sign in</button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 18, marginTop: 30, color: "#6e7086", fontSize: 12, fontWeight: 650 }}><span>✓ Simple event discovery</span><span>✓ One place to organize</span><span>✓ Clear event readiness</span></div>
            </div>
            <div style={{ position: "relative", minWidth: 0 }}>
              <div style={{ position: "absolute", inset: "8% 5% 2% 8%", background: "linear-gradient(135deg,#8c80ff,#5445c3)", filter: "blur(34px)", opacity: .19, borderRadius: 32 }} />
              <div style={{ position: "relative", background: "#fff", border: "1px solid #e6e3fb", borderRadius: 25, padding: 22, boxShadow: "0 28px 80px rgba(50,43,120,.12)", transform: "rotate(1deg)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}><div><div style={{ color: "#8b8ca0", fontSize: 11, fontWeight: 800, letterSpacing: ".12em" }}>EVENTEASE WORKSPACE</div><div style={{ fontSize: 20, fontWeight: 800, marginTop: 5, letterSpacing: "-.04em" }}>Make it happen.</div></div><div style={{ width: 42, height: 42, display: "grid", placeItems: "center", borderRadius: 14, background: "#f0edff", color: "#6556d9", fontSize: 22 }}>✦</div></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                  {[{n:"01",title:"Discover",desc:"Find events that excite you",bg:"#f2efff"},{n:"02",title:"Register",desc:"Save your spot in seconds",bg:"#eef8f4"},{n:"03",title:"Organize",desc:"Manage your event in one place",bg:"#fff5e9"},{n:"04",title:"Get ready",desc:"Track the details that matter",bg:"#eef5ff"}].map((item) => <div key={item.n} style={{ background: item.bg, borderRadius: 15, padding: 15, minHeight: 116 }}><div style={{ color: "#7162db", fontSize: 11, fontWeight: 850 }}>{item.n}</div><div style={{ fontWeight: 800, margin: "11px 0 5px", fontSize: 15 }}>{item.title}</div><div style={{ color: "#73758a", fontSize: 12, lineHeight: 1.5 }}>{item.desc}</div></div>)}
                </div>
                <div style={{ borderRadius: 14, padding: "14px 16px", background: "#1d1b36", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}><div><div style={{ color: "#c6c1ff", fontSize: 11, fontWeight: 700 }}>YOUR NEXT GREAT EVENT</div><div style={{ fontSize: 14, fontWeight: 750, marginTop: 4 }}>Starts with one click.</div></div><span style={{ fontSize: 24, color: "#bcb3ff" }}>↗</span></div>
              </div>
            </div>
          </div>
        </section>

        <section id="landing-events" className="ee-container" style={{ padding: "72px 0 78px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 20, marginBottom: 25, flexWrap: "wrap" }}><div><p style={{ color: "#6556d9", fontSize: 11, letterSpacing: ".15em", fontWeight: 850, margin: "0 0 10px" }}>WHAT'S HAPPENING</p><h2 style={{ fontSize: "clamp(28px,4vw,40px)", letterSpacing: "-.05em", margin: 0 }}>Upcoming campus events</h2><p style={{ color: "#77798d", margin: "10px 0 0", lineHeight: 1.6 }}>A preview of what's coming up in your campus community.</p></div><button className="ee-secondary" onClick={onRegister}>View all events →</button></div>
          {eventsLoading ? <div className="ee-card" style={{ color: "#77798d" }}>Loading upcoming events…</div> : events.length ? <div className="ee-event-grid">{events.map((event, index) => <article key={event._id} className="ee-card" style={{ padding: 0, overflow: "hidden" }}><div style={{ height: 8, background: ["linear-gradient(90deg,#7567eb,#b2a9ff)","linear-gradient(90deg,#48a88a,#a3dfc7)","linear-gradient(90deg,#efaa5d,#f8d4a1)"][index % 3] }} /><div style={{ padding: 22 }}><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 14 }}><span style={{ borderRadius: 999, padding: "6px 9px", background: "#f1efff", color: "#5e50c5", fontSize: 11, fontWeight: 800 }}>UPCOMING</span><span style={{ color: "#898a9b", fontSize: 11, fontWeight: 700 }}>{Math.max(0, Number(event.capacity || 0) - Number(event.registeredCount || 0))} seats left</span></div><h3 style={{ fontSize: 19, lineHeight: 1.3, letterSpacing: "-.03em", margin: "0 0 10px" }}>{event.title}</h3><p style={{ color: "#73758a", fontSize: 13, lineHeight: 1.65, minHeight: 43, margin: "0 0 18px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{event.description}</p><div style={{ display: "grid", gap: 9, color: "#55576c", fontSize: 12 }}><div>▦ &nbsp;{dateLabel(event.date)}</div><div>⌖ &nbsp;{event.venue}</div><div>♙ &nbsp;{Number(event.registeredCount || 0)} / {Number(event.capacity || 0)} registered</div></div><button className="ee-primary" onClick={onRegister} style={{ width: "100%", marginTop: 20, padding: 12 }}>Sign in to register</button></div></article>)}</div> : <div className="ee-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18, flexWrap: "wrap" }}><div><h3 style={{ margin: "0 0 7px", fontSize: 18 }}>Your next campus event starts here.</h3><p style={{ margin: 0, color: "#77798d", lineHeight: 1.6 }}>There are no upcoming events to show right now. Sign in to explore the workspace.</p></div><button className="ee-primary" onClick={onRegister}>Get started</button></div>}
        </section>

        <section id="landing-features" style={{ background: "#f5f4fc", borderTop: "1px solid #eceaf8", borderBottom: "1px solid #eceaf8", padding: "72px 0" }}>
          <div className="ee-container"><div style={{ maxWidth: 680, marginBottom: 28 }}><p style={{ color: "#6556d9", fontSize: 11, letterSpacing: ".15em", fontWeight: 850, margin: "0 0 10px" }}>ONE PLATFORM, TWO SIDES</p><h2 style={{ fontSize: "clamp(28px,4vw,40px)", letterSpacing: "-.05em", margin: "0 0 12px" }}>Everything your event needs to come together.</h2><p style={{ color: "#77798d", lineHeight: 1.75, margin: 0 }}>From the first announcement to the final checklist, keep the important details in one organized workspace.</p></div>
            <div className="ee-feature-grid">{[{icon:"✦",title:"Discover and register",desc:"Browse upcoming campus events, check availability, and register without a long process.",bg:"#e9e5ff"},{icon:"▤",title:"Organize with clarity",desc:"Create and update events, track registrations, and keep attendee information accessible.",bg:"#e1f5ed"},{icon:"✓",title:"Stay event-ready",desc:"Use the readiness checklist to keep venue, volunteers, schedule, and registration on track.",bg:"#fff0dd"}].map((item) => <article key={item.title} className="ee-card"><div style={{ width: 44, height: 44, borderRadius: 13, display: "grid", placeItems: "center", background: item.bg, color: "#5d50c6", fontSize: 22, fontWeight: 850 }}>{item.icon}</div><h3 style={{ fontSize: 18, letterSpacing: "-.025em", margin: "19px 0 9px" }}>{item.title}</h3><p style={{ color: "#74768b", lineHeight: 1.75, fontSize: 14, margin: 0 }}>{item.desc}</p></article>)}</div>
          </div>
        </section>

        <section id="landing-how" className="ee-container" style={{ padding: "72px 0" }}><div style={{ textAlign: "center", maxWidth: 670, margin: "0 auto 32px" }}><p style={{ color: "#6556d9", fontSize: 11, letterSpacing: ".15em", fontWeight: 850, margin: "0 0 10px" }}>GET STARTED</p><h2 style={{ fontSize: "clamp(28px,4vw,40px)", letterSpacing: "-.05em", margin: "0 0 12px" }}>A simpler way to bring people together.</h2><p style={{ color: "#77798d", lineHeight: 1.75, margin: 0 }}>Choose your role and get to the work that matters.</p></div><div className="ee-feature-grid">{[{n:"01",title:"Create your account",desc:"Join EventEase with your campus account."},{n:"02",title:"Find your place",desc:"Participants explore events; organizers manage their own."},{n:"03",title:"Make it happen",desc:"Register, track details, and keep event day organized."}].map((item) => <div key={item.n} style={{ padding: 24, borderTop: "2px solid #dcd7ff", background: "#fff" }}><div style={{ fontSize: 12, color: "#6556d9", fontWeight: 850, letterSpacing: ".1em" }}>{item.n}</div><h3 style={{ margin: "14px 0 8px", fontSize: 18 }}>{item.title}</h3><p style={{ margin: 0, color: "#77798d", fontSize: 14, lineHeight: 1.7 }}>{item.desc}</p></div>)}</div></section>

        <section style={{ padding: "0 0 76px" }}><div className="ee-container"><div style={{ borderRadius: 24, padding: "clamp(28px,5vw,52px)", background: "linear-gradient(120deg,#201d3c,#403578 70%,#6556d9)", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 28, flexWrap: "wrap" }}><div style={{ maxWidth: 600 }}><p style={{ color: "#c9c2ff", fontSize: 11, fontWeight: 850, letterSpacing: ".16em", margin: "0 0 12px" }}>READY WHEN YOU ARE</p><h2 style={{ fontSize: "clamp(28px,4vw,42px)", letterSpacing: "-.05em", margin: "0 0 12px" }}>Make your next campus event count.</h2><p style={{ color: "#dedaf5", lineHeight: 1.7, margin: 0 }}>Join your campus community on EventEase.</p></div><button type="button" onClick={onRegister} style={{ border: 0, borderRadius: 12, background: "#fff", color: "#4e42b2", padding: "15px 20px", fontWeight: 800, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap" }}>Get started →</button></div></div></section>
      </main>

      <footer style={{ borderTop: "1px solid #ecebf4", background: "#fff", padding: "27px 0" }}><div className="ee-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}><div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 850, letterSpacing: "-.03em" }}><span style={{ display: "grid", placeItems: "center", width: 30, height: 30, borderRadius: 9, background: "#6556d9", color: "#fff" }}>E</span> EventEase</div><p style={{ margin: 0, color: "#85869a", fontSize: 12 }}>Plan clearly. Run smoothly. © {new Date().getFullYear()} EventEase.</p><button className="ee-nav-link" onClick={onLogin}>Sign in →</button></div></footer>
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("eventease_theme") === "dark" ? "dark" : "light");
  const toggleTheme = () => setTheme((current) => current === "dark" ? "light" : "dark");
  useEffect(() => { localStorage.setItem("eventease_theme", theme); }, [theme]);

  const [token, setToken] = useState(() => localStorage.getItem("eventease_token") || "");
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [controlRoomEvent, setControlRoomEvent] = useState(null);
  const [participantsEvent, setParticipantsEvent] = useState(null);
  const [detailsEvent, setDetailsEvent] = useState(null);
  const [eventParticipants, setEventParticipants] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantsError, setParticipantsError] = useState("");
  const [registrationStatus, setRegistrationStatus] = useState({});
  const [registeringEvents, setRegisteringEvents] = useState({});
  const [activeView, setActiveView] = useState("overview");
  const [eventStatusFilter, setEventStatusFilter] = useState("all");
  const [showAuth, setShowAuth] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState("login");

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    venue: "",
    capacity: 50,
  });

  const canOrganize = user?.role === "organizer";

  // Load the current account, then load events.
  useEffect(() => {
    let cancelled = false;

    async function initializeSession() {
      if (!token) {
        setAuthChecking(false);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${AUTH_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await readApiResponse(response);

        if (!response.ok) {
          throw new Error(data.message || "Session expired.");
        }

        if (cancelled) return;
        setUser(data);
        await loadEvents(data);
      } catch {
        localStorage.removeItem("eventease_token");
        if (!cancelled) {
          setToken("");
          setUser(null);
          setLoading(false);
        }
      } finally {
        if (!cancelled) setAuthChecking(false);
      }
    }

    initializeSession();
    return () => { cancelled = true; };
  }, [token]);

  function handleAuthenticated(newToken) {
    localStorage.setItem("eventease_token", newToken);
    setToken(newToken);
  }

  function logout() {
    localStorage.removeItem("eventease_token");
    setShowAuth(false);
    setToken("");
    setUser(null);
    setEvents([]);
    setControlRoomEvent(null);
    setShowForm(false);
    setError("");
  }

  // Load events from the backend
  async function loadEvents(currentUser = user) {
    try {
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Could not load events.");
      }

      const data = await readApiResponse(response);
      // Keep the organizer workspace scoped to events owned by this account.
      const visibleEvents = currentUser?.role === "organizer"
        ? data.filter((event) => String(event.createdBy?._id || event.createdBy || "") === String(currentUser.id))
        : data;
      setEvents(visibleEvents);
    } catch {
      setError(
        "Cannot connect to the backend. Make sure your server is running."
      );
    } finally {
      setLoading(false);
    }
  }

  // Load this participant's registration status for visible events.
  useEffect(() => {
    if (!token || user?.role !== "participant" || events.length === 0) {
      setRegistrationStatus({});
      return;
    }

    let cancelled = false;

    async function loadRegistrationStatuses() {
      const results = await Promise.all(
        events.map(async (event) => {
          try {
            const response = await fetch(
              `${API_URL}/${event._id}/registration`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!response.ok) return [event._id, false];
            const data = await readApiResponse(response);
            return [event._id, Boolean(data.isRegistered)];
          } catch {
            return [event._id, false];
          }
        })
      );

      if (!cancelled) {
        setRegistrationStatus(Object.fromEntries(results));
      }
    }

    loadRegistrationStatuses();
    return () => {
      cancelled = true;
    };
  }, [token, user?.role, events]);

  async function registerForEvent(eventId) {
    setRegisteringEvents((current) => ({ ...current, [eventId]: true }));
    setError("");

    try {
      const response = await fetch(`${API_URL}/${eventId}/register`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Could not register for this event.");
      }

      setRegistrationStatus((current) => ({ ...current, [eventId]: true }));
      setEvents((current) =>
        current.map((event) =>
          event._id === eventId
            ? { ...event, registeredCount: data.registeredCount }
            : event
        )
      );
      setControlRoomEvent((current) =>
        current?._id === eventId
          ? { ...current, registeredCount: data.registeredCount }
          : current
      );
      return true;
    } catch (err) {
      setError(err.message || "Could not register for this event.");
      return false;
    } finally {
      setRegisteringEvents((current) => ({ ...current, [eventId]: false }));
    }
  }

  function beginEditEvent(event) {
    setError("");
    setEditingEvent(event);
    const localDate = new Date(new Date(event.date).getTime() - new Date(event.date).getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setForm({ title: event.title || "", description: event.description || "", date: localDate, venue: event.venue || "", capacity: event.capacity || 50 });
    setShowForm(true);
  }

  async function cancelEvent(event) {
    const confirmed = window.confirm(`Cancel "${event.title}"? Participants' registration records will be preserved, but no new registrations will be allowed.`);
    if (!confirmed) return;
    setError("");
    try {
      const response = await fetch(`${API_URL}/${event._id}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await readApiResponse(response);
      if (!response.ok) throw new Error(data.message || "Could not cancel event.");
      const updated = data.event;
      setEvents((current) => current.map((item) => item._id === event._id ? updated : item));
      setControlRoomEvent((current) => current?._id === event._id ? updated : current);
      setDetailsEvent((current) => current?._id === event._id ? updated : current);
    } catch (err) {
      setError(err.message || "Could not cancel event.");
    }
  }

  // Create an event
  async function createEvent(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch(editingEvent ? `${API_URL}/${editingEvent._id}` : API_URL, {
        method: editingEvent ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          capacity: Number(form.capacity),
          date: new Date(form.date).toISOString(),
        }),
      });

      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Could not create event.");
      }

      setEvents((current) => editingEvent
        ? current.map((event) => event._id === editingEvent._id ? data : event)
        : [data, ...current]);
      setEditingEvent(null);

      setForm({
        title: "",
        description: "",
        date: "",
        venue: "",
        capacity: 50,
      });

      setShowForm(false);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  // Update an event's readiness checklist
  async function updateReadiness(eventId, field, checked) {
    try {
      const response = await fetch(
        `${API_URL}/${eventId}/readiness`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            [field]: checked,
          }),
        }
      );

      const updatedEvent = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(
          updatedEvent.message || "Could not update checklist."
        );
      }

      setEvents((current) =>
        current.map((event) =>
          event._id === eventId ? updatedEvent : event
        )
      );

      // Keep the selected Control Room event in sync
      setControlRoomEvent((current) =>
        current?._id === eventId ? updatedEvent : current
      );
    } catch (err) {
      setError(err.message || "Could not update readiness.");
    }
  }

  async function openParticipants(event) {
    setParticipantsEvent(event);
    setEventParticipants([]);
    setParticipantsError("");
    setParticipantsLoading(true);

    try {
      const response = await fetch(`${API_URL}/${event._id}/participants`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const responseText = await response.text();
      let data;

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error(
          `The participants endpoint returned HTML instead of JSON (HTTP ${response.status}). Restart the backend and confirm it is running on port 5000.`
        );
      }

      if (!response.ok) {
        throw new Error(data.message || "Could not load participants.");
      }

      setEventParticipants(Array.isArray(data.participants) ? data.participants : []);
    } catch (err) {
      setParticipantsError(err.message || "Could not load participants.");
    } finally {
      setParticipantsLoading(false);
    }
  }

  const filteredEvents = events.filter((event) =>
    `${event.title} ${event.venue} ${event.description}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const upcomingEvents = events.filter(
    (event) => new Date(event.date) >= new Date()
  ).length;
  const totalRegistrations = events.reduce(
    (total, event) => total + (Number(event.registeredCount) || 0),
    0
  );
  const totalCapacity = events.reduce(
    (total, event) => total + (Number(event.capacity) || 0),
    0
  );
  const averageReadiness = events.length
    ? Math.round(events.reduce((total, event) => total + getReadinessScore(event), 0) / events.length)
    : 0;
  const capacityUsage = totalCapacity
    ? Math.round((totalRegistrations / totalCapacity) * 100)
    : 0;

  const registeredEvents = events.filter(
    (event) => Boolean(registrationStatus[event._id])
  );
  const upcomingRegisteredEvents = registeredEvents.filter(
    (event) => new Date(event.date) >= new Date()
  );
  const displayedEvents = activeView === "registrations"
    ? registeredEvents.filter((event) =>
        `${event.title} ${event.venue} ${event.description}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    : filteredEvents;

  function getReadinessScore(event) {
    const checklist = event.readinessChecklist || {};

    const completed = READINESS_TASKS.filter(
      ([key]) => checklist[key]
    ).length;

    return Math.round(
      (completed / READINESS_TASKS.length) * 100
    );
  }

  // Explicit row layout prevents global label styles from stacking
  // the checkbox above its text.
  function renderReadinessTasks(event, editable = canOrganize) {
    const checklist = event.readinessChecklist || {};

    return (
      <div
        className="readiness-tasks"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          gap: "12px",
        }}
      >
        {READINESS_TASKS.map(([key, label]) => (
          <label
            key={key}
            className="readiness-task"
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "10px",
              width: "100%",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={Boolean(checklist[key])}
              disabled={!editable}
              onChange={(e) =>
                updateReadiness(
                  event._id,
                  key,
                  e.target.checked
                )
              }
              style={{
                display: "inline-block",
                flex: "0 0 16px",
                opacity: editable ? 1 : 0.65,
                width: "16px",
                height: "16px",
                margin: 0,
                cursor: "pointer",
              }}
            />

            <span>{label}</span>
          </label>
        ))}
      </div>
    );
  }

  if (authChecking) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "system-ui, sans-serif", color: "#565b70" }}>
        Checking your EventEase session...
      </div>
    );
  }

  if (!token || !user) {
    if (!showAuth) {
      return (
        <LandingPage
          theme={theme}
          onToggleTheme={toggleTheme}
          onLogin={() => { setAuthInitialMode("login"); setShowAuth(true); }}
          onRegister={() => { setAuthInitialMode("register"); setShowAuth(true); }}
        />
      );
    }
    return (
      <AuthScreen
        key={authInitialMode}
        initialMode={authInitialMode}
        theme={theme}
        onToggleTheme={toggleTheme}
        onAuthenticated={handleAuthenticated}
        onBackToLanding={() => setShowAuth(false)}
      />
    );
  }

  return (
    <div className="app-shell" data-theme={theme}>
      <ThemeStyles />
      <aside className="sidebar">
        <a className="brand" href="#">
          <span className="brand-mark">E</span>
          <span>EventEase</span>
        </a>

        <p className="nav-label">WORKSPACE</p>

        <button
          className={`nav-item ${activeView === "overview" ? "active" : ""}`}
          onClick={() => setActiveView("overview")}
        >
          <span>▦</span> Overview
        </button>

        <button
          className={`nav-item ${activeView === "events" ? "active" : ""}`}
          onClick={() => {
            setActiveView("events");
            document.getElementById("events-section")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <span>▣</span> All Events
        </button>

        {!canOrganize && (
          <button
            className={`nav-item ${activeView === "registrations" ? "active" : ""}`}
            style={{ flex: "0 0 auto", width: "auto", minHeight: "40px", padding: "9px 13px", border: activeView === "registrations" ? "1px solid #6b5cf6" : "1px solid #dfe3eb", borderRadius: "9px", background: activeView === "registrations" ? "#eeebff" : "#fff", color: "#30334a", whiteSpace: "nowrap", cursor: "pointer" }}
            onClick={() => {
              setActiveView("registrations");
              setSearch("");
              document.getElementById("events-section")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <span>✓</span> My Registrations
          </button>
        )}

        <div className="sidebar-bottom">
          <div className="club-avatar">{(user.name || user.email || "U").charAt(0).toUpperCase()}</div>
          <div style={{ minWidth: 0 }}>
            <strong>{user.name || user.email}</strong>
            <p>{canOrganize ? "Event Organizer" : "Participant"}</p>
          </div>
          <button type="button" onClick={logout} title="Sign out" aria-label="Sign out" style={{ marginLeft: "auto", border: 0, background: "transparent", cursor: "pointer", fontSize: 18 }}>↪</button>
        </div>
      </aside>

      <main className="main-content">
        <header
          className="topbar"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <span className="breadcrumb">Workspace / {activeView === "registrations" ? "My Registrations" : activeView === "events" ? "All Events" : "Overview"}</span>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span className="status">
              <span /> System online
            </span>
            <ThemeToggle theme={theme} onToggleTheme={toggleTheme} />
            <button
              type="button"
              onClick={logout}
              aria-label="Log out of EventEase"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "9px 14px",
                border: "1px solid var(--border-color, #d9dee7)",
                borderRadius: "9px",
                background: "var(--card-bg, #ffffff)",
                color: "var(--text-color, #243047)",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              <span aria-hidden="true">↪</span>
              Log out
            </button>
          </div>
        </header>

        <nav
          className="mobile-workspace-nav"
          aria-label="Workspace navigation"
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "8px",
            padding: "12px 0 16px",
            marginBottom: "20px",
            borderBottom: "1px solid #e3e7f0",
          }}
        >
          <button
            type="button"
            className={`nav-item ${activeView === "overview" ? "active" : ""}`}
            style={{ flex: "0 0 auto", width: "auto", minHeight: "40px", padding: "9px 13px", border: activeView === "overview" ? "1px solid #6b5cf6" : "1px solid #dfe3eb", borderRadius: "9px", background: activeView === "overview" ? "#eeebff" : "#fff", color: "#30334a", whiteSpace: "nowrap", cursor: "pointer" }}
            onClick={() => setActiveView("overview")}
          >
            ▦ Overview
          </button>
          <button
            type="button"
            className={`nav-item ${activeView === "events" ? "active" : ""}`}
            style={{ flex: "0 0 auto", width: "auto", minHeight: "40px", padding: "9px 13px", border: activeView === "events" ? "1px solid #6b5cf6" : "1px solid #dfe3eb", borderRadius: "9px", background: activeView === "events" ? "#eeebff" : "#fff", color: "#30334a", whiteSpace: "nowrap", cursor: "pointer" }}
            onClick={() => {
              setActiveView("events");
              setSearch("");
              document.getElementById("events-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            ▣ All Events
          </button>
          {!canOrganize && (
            <button
              type="button"
              className={`nav-item ${activeView === "registrations" ? "active" : ""}`}
              onClick={() => {
                setActiveView("registrations");
                setSearch("");
                document.getElementById("events-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              ✓ My Registrations
            </button>
          )}
        </nav>

        <section className="welcome-row">
          <div>
            <p className="eyebrow">{canOrganize ? "EVENT MANAGEMENT" : "PARTICIPANT DASHBOARD"}</p>
            <h1>{canOrganize ? "Plan something great." : activeView === "registrations" ? "Your registrations." : "Find your next campus event."}</h1>
            <p className="subtitle">
              {canOrganize
                ? "Create workshops, manage events, and bring your campus together."
                : activeView === "registrations"
                  ? "Review the events you have registered for and keep track of what's coming up."
                  : "Discover campus events and keep your registrations in one place."}
            </p>
          </div>

          {canOrganize && (
            <button
              className="primary-button"
              onClick={() => {
                setError("");
                setShowForm(true);
              }}
            >
              <span>＋</span> Create event
            </button>
          )}
        </section>

        <section className="stats-grid">
          <article className="stat-card">
            <div className="stat-top">
              <span>{canOrganize ? "Total events" : "My registrations"}</span>
              <span className="stat-icon">▦</span>
            </div>
            <strong>{canOrganize ? events.length : registeredEvents.length}</strong>
            <p>{canOrganize ? "Events in your workspace" : "Events you've joined"}</p>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>{canOrganize ? "Upcoming events" : "Upcoming registrations"}</span>
              <span className="stat-icon">◷</span>
            </div>
            <strong>{canOrganize ? upcomingEvents : upcomingRegisteredEvents.length}</strong>
            <p>{canOrganize ? "Scheduled for the future" : "Registered events still to come"}</p>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>{canOrganize ? "Total capacity" : "Open events"}</span>
              <span className="stat-icon">♙</span>
            </div>
            <strong>{canOrganize
              ? events.reduce((total, event) => total + (event.capacity || 0), 0)
              : events.filter((event) => new Date(event.date) > new Date() && (event.registeredCount || 0) < event.capacity).length}
            </strong>
            <p>{canOrganize ? "Available attendee places" : "Upcoming events with seats available"}</p>
          </article>
        </section>

        {canOrganize && activeView === "overview" && (
          <section className="organizer-dashboard" style={{ margin: "28px 0 34px" }}>
            <div className="section-heading" style={{ marginBottom: "18px" }}>
              <div>
                <h2>Organizer dashboard</h2>
                <p>Track registrations, capacity, and event readiness at a glance.</p>
              </div>
              <button
                type="button"
                className="primary-button"
                onClick={() => { setError(""); setShowForm(true); }}
              >
                ＋ Create event
              </button>
            </div>

            {error && <div className="error-message" role="alert" style={{ marginBottom: "16px" }}>{error}</div>}

            <div className="stats-grid" style={{ marginBottom: "24px" }}>
              <article className="stat-card">
                <div className="stat-top"><span>Total registrations</span><span className="stat-icon">✓</span></div>
                <strong>{totalRegistrations}</strong>
                <p>Across events currently listed</p>
              </article>
              <article className="stat-card">
                <div className="stat-top"><span>Average readiness</span><span className="stat-icon">◷</span></div>
                <strong>{averageReadiness}%</strong>
                <p>Checklist completion across events</p>
              </article>
              <article className="stat-card">
                <div className="stat-top"><span>Capacity used</span><span className="stat-icon">♙</span></div>
                <strong>{capacityUsage}%</strong>
                <p>{Math.max(0, totalCapacity - totalRegistrations)} seats remain</p>
              </article>
            </div>

            <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color, #e4e7ef)", borderRadius: "14px", overflow: "hidden" }}>
              <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border-color, #e4e7ef)" }}>
                <h3 style={{ margin: 0, fontSize: "16px" }}>Event performance</h3>
                <p style={{ margin: "6px 0 0", color: "var(--muted-text, #7a8194)", fontSize: "13px" }}>Review attendance demand and preparation progress.</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginTop: "14px" }}>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {[{ value: "all", label: `All events (${events.length})` }, { value: "active", label: `Active (${events.filter((item) => !item.isCancelled).length})` }, { value: "cancelled", label: `Cancelled (${events.filter((item) => item.isCancelled).length})` }].map((filter) => (
                      <button key={filter.value} type="button" className={eventStatusFilter === filter.value ? "primary-button" : "secondary-button"} onClick={() => setEventStatusFilter(filter.value)} style={{ padding: "8px 12px", fontSize: "12px" }}>
                        {filter.label}
                      </button>
                    ))}
                  </div>
                  <span style={{ color: "#7a8194", fontSize: "12px" }}>Cancelled events and their registrations are retained.</span>
                </div>
              </div>
              {loading ? (
                <div className="empty-state">Loading event performance…</div>
              ) : events.filter((item) => eventStatusFilter === "all" || (eventStatusFilter === "cancelled" ? Boolean(item.isCancelled) : !item.isCancelled)).length === 0 ? (
                <div className="empty-state">
                  <h3>{events.length === 0 ? "No events yet" : eventStatusFilter === "cancelled" ? "No cancelled events" : "No active events"}</h3>
                  <p>{events.length === 0 ? "Create your first event to start tracking registrations and readiness." : eventStatusFilter === "cancelled" ? "Cancelled events will remain listed here for your records." : "All your events are currently cancelled."}</p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "760px", textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "#f8f9fc", color: "#737b8e", fontSize: "11px", textTransform: "uppercase", letterSpacing: ".08em" }}>
                        <th style={{ padding: "13px 18px", fontWeight: 700 }}>Event</th>
                        <th style={{ padding: "13px 14px", fontWeight: 700 }}>Date</th>
                        <th style={{ padding: "13px 14px", fontWeight: 700 }}>Registrations</th>
                        <th style={{ padding: "13px 14px", fontWeight: 700 }}>Readiness</th>
                        <th style={{ padding: "13px 14px", fontWeight: 700 }}>Status</th>
                        <th style={{ padding: "13px 18px", fontWeight: 700 }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...events]
                        .filter((event) => eventStatusFilter === "all" || (eventStatusFilter === "cancelled" ? Boolean(event.isCancelled) : !event.isCancelled))
                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                        .map((event) => {
                        const readiness = getReadinessScore(event);
                        const count = Number(event.registeredCount) || 0;
                        const capacity = Number(event.capacity) || 0;
                        return (
                          <tr key={event._id} style={{ borderTop: "1px solid #edf0f5", fontSize: "13px" }}>
                            <td style={{ padding: "15px 18px", maxWidth: "220px" }}>
                              <strong style={{ display: "block", color: "#20253a", marginBottom: "4px" }}>{event.title}</strong>
                              <span style={{ color: "#7a8194" }}>{event.venue}</span>
                            </td>
                            <td style={{ padding: "15px 14px", whiteSpace: "nowrap", color: "#60697d" }}>
                              {new Date(event.date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                            </td>
                            <td style={{ padding: "15px 14px", minWidth: "130px" }}>
                              <strong>{count} / {capacity}</strong>
                              <div style={{ height: "5px", background: "#ecebfa", borderRadius: "99px", overflow: "hidden", marginTop: "7px" }}>
                                <div style={{ height: "100%", width: `${capacity ? Math.min(100, count / capacity * 100) : 0}%`, background: "#6958ed", borderRadius: "99px" }} />
                              </div>
                            </td>
                            <td style={{ padding: "15px 14px", minWidth: "125px" }}>
                              <strong>{readiness}%</strong>
                              <div style={{ height: "5px", background: "#ecebfa", borderRadius: "99px", overflow: "hidden", marginTop: "7px" }}>
                                <div style={{ height: "100%", width: `${readiness}%`, background: readiness === 100 ? "#299764" : "#6958ed", borderRadius: "99px" }} />
                              </div>
                            </td>
                            <td style={{ padding: "15px 14px", whiteSpace: "nowrap" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", padding: "5px 9px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, color: event.isCancelled ? "#b42332" : "#18794e", background: event.isCancelled ? "#fff0f1" : "#eaf8f0", border: `1px solid ${event.isCancelled ? "#ffd1d5" : "#c9eed8"}` }}>
                                {event.isCancelled ? "Cancelled" : "Active"}
                              </span>
                            </td>
                            <td style={{ padding: "15px 18px" }}>
                              <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
                                {!event.isCancelled ? (
                                  <button type="button" className="secondary-button" style={{ whiteSpace: "nowrap", padding: "8px 10px", fontSize: "12px" }} onClick={() => { setError(""); setControlRoomEvent(event); }}>
                                    Manage →
                                  </button>
                                ) : (
                                  <span style={{ display: "inline-flex", alignItems: "center", padding: "8px 10px", fontSize: "12px", color: "#b42332" }}>
                                    Operations closed
                                  </span>
                                )}
                                <button type="button" className="secondary-button" style={{ whiteSpace: "nowrap", padding: "8px 10px", fontSize: "12px" }} onClick={() => openParticipants(event)}>
                                  Participants
                                </button>
                                {!event.isCancelled && <button type="button" className="secondary-button" style={{ whiteSpace: "nowrap", padding: "8px 10px", fontSize: "12px" }} onClick={() => beginEditEvent(event)}>Edit</button>}
                                {!event.isCancelled && <button type="button" className="secondary-button" style={{ whiteSpace: "nowrap", padding: "8px 10px", fontSize: "12px", color: "#c03945" }} onClick={() => cancelEvent(event)}>Cancel</button>}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
              <button type="button" className="secondary-button" onClick={() => { setActiveView("events"); setSearch(""); document.getElementById("events-section")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>
                View event cards →
              </button>
            </div>
          </section>
        )}

        {(!canOrganize || activeView !== "overview") && <section className="events-section" id="events-section">
          <div className="section-heading">
            <div>
              <h2>{canOrganize
                ? "Your events"
                : activeView === "registrations"
                  ? "My registrations"
                  : "Campus events"}</h2>
              <p>{canOrganize
                ? "Manage and keep track of your campus activities."
                : activeView === "registrations"
                  ? "Events you've successfully registered for."
                  : "Explore upcoming activities and reserve your place."}</p>
            </div>

            <input
              className="search-input"
              type="search"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {error && (
            <div className="error-message">{error}</div>
          )}

          {loading ? (
            <div className="empty-state">
              Loading your events...
            </div>
          ) : displayedEvents.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">▦</div>

              <h3>
                {search
                  ? "No matching events"
                  : activeView === "registrations"
                    ? "No registrations yet"
                    : canOrganize
                      ? "Your next event starts here"
                      : "No campus events yet"}
              </h3>

              <p>
                {search
                  ? "Try a different search term."
                  : activeView === "registrations"
                    ? "Browse All Events and register for an event to see it here."
                    : canOrganize
                      ? "Create your first workshop or campus event to get started."
                      : "Check back later for new campus activities."}
              </p>

              {!search && canOrganize && (
                <button
                  className="primary-button"
                  onClick={() => {
                    setError("");
                    setShowForm(true);
                  }}
                >
                  ＋ Create your first event
                </button>
              )}
            </div>
          ) : (
            <div className="event-grid">
              {displayedEvents.map((event) => {
                const score = getReadinessScore(event);
                const registeredCount = event.registeredCount || 0;

                const capacityPercentage =
                  event.capacity > 0
                    ? Math.min(
                        100,
                        (registeredCount / event.capacity) * 100
                      )
                    : 0;

                return (
                  <article
                    className="event-card"
                    key={event._id}
                  >
                    <div className="event-card-banner">
                      <span className="event-tag">
                        {event.isCancelled ? "CANCELLED EVENT" : "CAMPUS EVENT"}
                      </span>
                      <span className="event-symbol">✳</span>
                    </div>

                    <div className="event-card-content">
                      <h3>{event.title}</h3>

                      <p className="event-description">
                        {event.description}
                      </p>

                      <div className="event-detail">
                        <span>◷</span>
                        {new Date(event.date).toLocaleString([], {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </div>

                      <div className="event-detail">
                        <span>⌖</span> {event.venue}
                      </div>

                      <button
                        type="button"
                        className="secondary-button"
                        style={{ width: "100%", marginTop: "12px" }}
                        onClick={() => setDetailsEvent(event)}
                      >
                        View event details →
                      </button>

                      <div className="event-card-footer">
                        <span>
                          {registeredCount} / {event.capacity}{" "}
                          registered
                        </span>

                        <span className="seats-label">
                          {Math.max(
                            0,
                            event.capacity - registeredCount
                          )}{" "}
                          seats left
                        </span>
                      </div>

                      <div className="capacity-track">
                        <div
                          style={{
                            width: `${capacityPercentage}%`,
                          }}
                        />
                      </div>

                      {user.role === "participant" && (
                        <div style={{ margin: "14px 0" }}>
                          {event.isCancelled ? <button type="button" className="secondary-button" disabled style={{ width: "100%" }}>Event cancelled</button> : registrationStatus[event._id] ? (
                            <button
                              type="button"
                              className="secondary-button"
                              disabled
                              style={{ width: "100%", opacity: 0.8, cursor: "default" }}
                            >
                              ✓ Registered
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="primary-button"
                              style={{ width: "100%" }}
                              disabled={
                                Boolean(registeringEvents[event._id]) ||
                                registeredCount >= event.capacity ||
                                new Date(event.date).getTime() <= Date.now()
                              }
                              onClick={() => registerForEvent(event._id)}
                            >
                              {registeringEvents[event._id]
                                ? "Registering..."
                                : registeredCount >= event.capacity
                                  ? "Event full"
                                  : new Date(event.date).getTime() <= Date.now()
                                    ? "Registration closed"
                                    : "Register for event"}
                            </button>
                          )}
                        </div>
                      )}

                      {canOrganize && !event.isCancelled && <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                        <button type="button" className="secondary-button" style={{ flex: 1 }} onClick={() => beginEditEvent(event)}>Edit event</button>
                        <button type="button" className="secondary-button" style={{ flex: 1, color: "#c03945", borderColor: "#f0c7cb" }} onClick={() => cancelEvent(event)}>Cancel event</button>
                      </div>}
                      {event.isCancelled && <p style={{ color: "#c03945", fontWeight: 700, margin: "12px 0 0" }}>Event cancelled</p>}

                      {canOrganize && !event.isCancelled && <div className="readiness-panel">
                        <div className="readiness-heading">
                          <div>
                            <h4>Event readiness</h4>
                            <p>Prepare before event day</p>
                          </div>

                          <strong>{score}%</strong>
                        </div>

                        <div className="readiness-track">
                          <div
                            style={{ width: `${score}%` }}
                          />
                        </div>

                        {renderReadinessTasks(event)}
                      </div>}

                      {canOrganize && !event.isCancelled && <button
                        className="secondary-button"
                        onClick={() => {
                          setError("");
                          setControlRoomEvent(event);
                        }}
                      >
                        Open event control room →
                      </button>}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>}

        <footer className="footer">
          EventEase <span>·</span> Built for better campus experiences
        </footer>
      </main>

      {/* Event Details Modal */}
      {detailsEvent && (
        <div className="modal-backdrop" onClick={() => setDetailsEvent(null)}>
          <section
            className="event-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-details-title"
            onClick={(e) => e.stopPropagation()}
            style={{ width: "min(680px, calc(100vw - 32px))", maxWidth: "680px", maxHeight: "calc(100vh - 32px)", overflowY: "auto", boxSizing: "border-box" }}
          >
            <div className="modal-heading">
              <div>
                <p className="eyebrow">CAMPUS EVENT</p>
                <h2 id="event-details-title">{detailsEvent.title}</h2>
                <p>{new Date(detailsEvent.date).toLocaleString([], { dateStyle: "full", timeStyle: "short" })}</p>
              </div>
              <button type="button" className="close-button" onClick={() => setDetailsEvent(null)} aria-label="Close event details">×</button>
            </div>

            <div className="control-room-section" style={{ marginTop: "18px" }}>
              <h3>About this event</h3>
              <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{detailsEvent.description || "No description provided."}</p>
            </div>

            <div className="control-room-section">
              <h3>Event information</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "12px" }}>
                <div style={{ padding: "14px", border: "1px solid #e5e8ef", borderRadius: "10px" }}>
                  <span style={{ color: "#7a8194", fontSize: "12px" }}>VENUE</span>
                  <strong style={{ display: "block", marginTop: "5px", overflowWrap: "anywhere" }}>{detailsEvent.venue}</strong>
                </div>
                <div style={{ padding: "14px", border: "1px solid #e5e8ef", borderRadius: "10px" }}>
                  <span style={{ color: "#7a8194", fontSize: "12px" }}>REGISTRATIONS</span>
                  <strong style={{ display: "block", marginTop: "5px" }}>{detailsEvent.registeredCount || 0} / {detailsEvent.capacity}</strong>
                </div>
                <div style={{ padding: "14px", border: "1px solid #e5e8ef", borderRadius: "10px" }}>
                  <span style={{ color: "#7a8194", fontSize: "12px" }}>SEATS AVAILABLE</span>
                  <strong style={{ display: "block", marginTop: "5px" }}>{Math.max(0, Number(detailsEvent.capacity || 0) - Number(detailsEvent.registeredCount || 0))}</strong>
                </div>
                <div style={{ padding: "14px", border: "1px solid #e5e8ef", borderRadius: "10px" }}>
                  <span style={{ color: "#7a8194", fontSize: "12px" }}>STATUS</span>
                  <strong style={{ display: "block", marginTop: "5px", color: detailsEvent.isCancelled ? "#b42332" : new Date(detailsEvent.date).getTime() <= Date.now() ? "#7a8194" : Number(detailsEvent.registeredCount || 0) >= Number(detailsEvent.capacity || 0) ? "#c24141" : "#299764" }}>
                    {detailsEvent.isCancelled ? "Cancelled" : new Date(detailsEvent.date).getTime() <= Date.now() ? "Event ended" : Number(detailsEvent.registeredCount || 0) >= Number(detailsEvent.capacity || 0) ? "Fully booked" : "Upcoming"}
                  </strong>
                </div>
              </div>
            </div>

            {canOrganize && (
              <div className="control-room-section">
                <h3>Readiness</h3>
                <p>{getReadinessScore(detailsEvent)}% complete</p>
                <div className="readiness-track"><div style={{ width: `${getReadinessScore(detailsEvent)}%` }} /></div>
              </div>
            )}

            <div className="modal-actions">
              {!canOrganize && !registrationStatus[detailsEvent._id] && (
                <button
                  type="button"
                  className="primary-button"
                  disabled={Boolean(detailsEvent.isCancelled) || Boolean(registeringEvents[detailsEvent._id]) || Number(detailsEvent.registeredCount || 0) >= Number(detailsEvent.capacity || 0) || new Date(detailsEvent.date).getTime() <= Date.now()}
                  onClick={async () => {
                    const registered = await registerForEvent(detailsEvent._id);
                    if (registered) setDetailsEvent(null);
                  }}
                >
                  {detailsEvent.isCancelled ? "Event cancelled" : registeringEvents[detailsEvent._id] ? "Registering..." : Number(detailsEvent.registeredCount || 0) >= Number(detailsEvent.capacity || 0) ? "Event full" : new Date(detailsEvent.date).getTime() <= Date.now() ? "Registration closed" : "Register for event"}
                </button>
              )}
              {!canOrganize && registrationStatus[detailsEvent._id] && <span style={{ color: "#299764", fontWeight: 650, alignSelf: "center" }}>✓ You're registered</span>}
              <button type="button" className="secondary-button" onClick={() => setDetailsEvent(null)}>Close</button>
            </div>
          </section>
        </div>
      )}

      {/* Create Event Modal */}
      {showForm && canOrganize && (
        <div
          className="modal-backdrop"
          onClick={() => setShowForm(false)}
        >
          <section
            className="event-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <p className="eyebrow">EVENT DETAILS</p>
                <h2 id="modal-title">{editingEvent ? "Edit event" : "Create an event"}</h2>
              </div>

              <button
                className="close-button"
                onClick={() => { setShowForm(false); setEditingEvent(null); }}
                aria-label="Close form"
              >
                ×
              </button>
            </div>

            <form onSubmit={createEvent}>
              <label>
                Event title
                <input
                  required
                  maxLength={100}
                  placeholder="e.g. Web Development Workshop"
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                />
              </label>

              <label>
                Description
                <textarea
                  required
                  maxLength={1000}
                  placeholder="What will attendees learn?"
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                />
              </label>

              <div className="form-row">
                <label>
                  Date and time
                  <input
                    required
                    type="datetime-local"
                    min={new Date(
                      Date.now() -
                        new Date().getTimezoneOffset() * 60000
                    )
                      .toISOString()
                      .slice(0, 16)}
                    value={form.date}
                    onChange={(e) =>
                      setForm({ ...form, date: e.target.value })
                    }
                  />
                </label>

                <label>
                  Capacity
                  <input
                    required
                    type="number"
                    min="1"
                    max="10000"
                    value={form.capacity}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        capacity: e.target.value,
                      })
                    }
                  />
                </label>
              </div>

              <label>
                Venue
                <input
                  required
                  maxLength={150}
                  placeholder="e.g. CSE Seminar Hall"
                  value={form.venue}
                  onChange={(e) =>
                    setForm({ ...form, venue: e.target.value })
                  }
                />
              </label>

              {error && (
                <div className="error-message">{error}</div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => { setShowForm(false); setEditingEvent(null); }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving ? (editingEvent ? "Saving..." : "Creating...") : (editingEvent ? "Save changes" : "Create event")}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Event Participants Modal */}
      {participantsEvent && canOrganize && (
        <div className="modal-backdrop" onClick={() => setParticipantsEvent(null)}>
          <section
            className="event-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="participants-title"
            onClick={(e) => e.stopPropagation()}
            style={{ width: "min(680px, calc(100vw - 32px))", maxWidth: "680px", maxHeight: "calc(100vh - 32px)", overflowY: "auto", boxSizing: "border-box" }}
          >
            <div className="modal-heading">
              <div>
                <p className="eyebrow">ATTENDEE LIST</p>
                <h2 id="participants-title">Registered participants</h2>
                <p>{participantsEvent.title}</p>
              </div>
              <button className="close-button" onClick={() => setParticipantsEvent(null)} aria-label="Close participants list">×</button>
            </div>
            <div className="control-room-section">
              <p><strong>{eventParticipants.length}</strong> participant{eventParticipants.length === 1 ? "" : "s"} loaded · Capacity {participantsEvent.capacity}</p>
              {participantsLoading ? (
                <div className="empty-state">Loading participants…</div>
              ) : participantsError ? (
                <div className="error-message" role="alert">{participantsError}</div>
              ) : eventParticipants.length === 0 ? (
                <div className="empty-state"><h3>No registrations yet</h3><p>Participants will appear here after they register for this event.</p></div>
              ) : (
                <div style={{ border: "1px solid #e5e8ef", borderRadius: "10px", overflow: "hidden" }}>
                  {eventParticipants.map((participant, index) => (
                    <div key={participant.registrationId || participant.email || index} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "13px 14px", borderTop: index ? "1px solid #edf0f5" : 0 }}>
                      <div style={{ width: "36px", height: "36px", flex: "0 0 36px", display: "grid", placeItems: "center", borderRadius: "50%", background: "#eeebff", color: "#6556d9", fontWeight: 750 }}>
                        {(participant.name || participant.email || "P").charAt(0).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <strong style={{ display: "block", fontSize: "13px" }}>{participant.name || "Participant"}</strong>
                        <span style={{ display: "block", fontSize: "12px", color: "#7a8194", overflowWrap: "anywhere" }}>{participant.email}</span>
                      </div>
                      <span style={{ marginLeft: "auto", color: "#299764", fontSize: "12px", whiteSpace: "nowrap" }}>Registered</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button type="button" className="primary-button" onClick={() => setParticipantsEvent(null)}>Done</button>
          </section>
        </div>
      )}

      {/* Event Control Room */}
      {controlRoomEvent && canOrganize && !controlRoomEvent.isCancelled && (
        <div
          className="modal-backdrop"
          onClick={() => setControlRoomEvent(null)}
        >
          <section
            className="event-modal control-room"
            role="dialog"
            aria-modal="true"
            aria-labelledby="control-room-title"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(760px, calc(100vw - 32px))",
              maxWidth: "760px",
              maxHeight: "calc(100vh - 32px)",
              overflowY: "auto",
              boxSizing: "border-box",
            }}
          >
            <div className="modal-heading">
              <div>
                <p className="eyebrow">EVENT OPERATIONS</p>
                <h2 id="control-room-title">
                  Event Control Room
                </h2>
                <p>{controlRoomEvent.title}</p>
              </div>

              <button
                className="close-button"
                onClick={() => setControlRoomEvent(null)}
                aria-label="Close control room"
              >
                ×
              </button>
            </div>

            <div className="control-room-section">
              <h3>Event overview</h3>

              <p>Venue: {controlRoomEvent.venue}</p>

              <p>
                Date:{" "}
                {new Date(
                  controlRoomEvent.date
                ).toLocaleString()}
              </p>

              <p>
                Registrations:{" "}
                {controlRoomEvent.registeredCount || 0} /{" "}
                {controlRoomEvent.capacity}
              </p>
            </div>

            <div className="control-room-section">
              <h3>Event readiness</h3>

              <p>
                Your event is {getReadinessScore(controlRoomEvent)}%
                ready based on its preparation checklist.
              </p>

              {renderReadinessTasks(controlRoomEvent)}
            </div>

            <div className="control-room-section">
              <h3>Event-day checklist</h3>
              <p>
                Use this checklist to coordinate event execution.
              </p>

              <ul>
                <li>Confirm venue and equipment</li>
                <li>Brief volunteers before the event</li>
                <li>Prepare attendee check-in</li>
                <li>Verify the event schedule</li>
              </ul>
            </div>

            <button
              className="primary-button"
              onClick={() => setControlRoomEvent(null)}
            >
              Close control room
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
