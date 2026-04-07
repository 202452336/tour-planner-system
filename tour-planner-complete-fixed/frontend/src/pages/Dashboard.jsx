import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { extractArray } from "../services/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTours(); }, []);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const res = await API.get("/tours");
      setTours(extractArray(res.data, ["tours", "data"]));
    } catch { setTours([]); }
    finally { setLoading(false); }
  };

  const recentTours = tours.slice(0, 3);
  const safeDate = v => { try { const d = new Date(v); return isNaN(d) ? "N/A" : d.toLocaleDateString(); } catch { return "N/A"; } };

  const statusColor = (s) => {
    if (s === "completed") return { bg: "rgba(61,214,200,0.12)", color: "#3dd6c8", border: "rgba(61,214,200,0.25)" };
    if (s === "ongoing")   return { bg: "rgba(79,142,247,0.12)",  color: "#4f8ef7", border: "rgba(79,142,247,0.25)" };
    return { bg: "rgba(232,201,126,0.12)", color: "var(--accent)", border: "rgba(232,201,126,0.25)" };
  };

  const quickActions = [
    { icon: "✈️", title: "Create Tour",  desc: "Start planning a new trip with destinations and budget.", path: "/create-tour",  color: "rgba(232,201,126,0.07)", border: "rgba(232,201,126,0.2)" },
    { icon: "🗂️", title: "My Tours",     desc: "View, edit and manage all your saved tour plans.",       path: "/my-tours",    color: "rgba(79,142,247,0.07)",  border: "rgba(79,142,247,0.2)" },
    { icon: "🌍", title: "Destinations", desc: "Explore places and find nearby hotels and transport.",   path: "/destinations",color: "rgba(61,214,200,0.07)",  border: "rgba(61,214,200,0.2)" },
    { icon: "👤", title: "My Profile",   desc: "Update your personal details and change password.",      path: "/profile",     color: "rgba(155,109,255,0.07)", border: "rgba(155,109,255,0.2)" },
  ];

  return (
    <div className="page">
      {/* Hero */}
      <section className="hero-banner glass">
        <div>
          <span className="eyebrow">Welcome Back</span>
          <h1>Hello, {user?.name || "Traveler"} 👋</h1>
          <p>Your personalized travel workspace. Plan tours, track budgets, discover hotels and transport — all in one place.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/create-tour")}
          style={{ whiteSpace: "nowrap", padding: "14px 28px", fontSize: "0.95rem" }}>
          + New Tour
        </button>
      </section>

      {/* Quick Actions — replaces stats */}
      <section className="dashboard-grid" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        {quickActions.map((card, i) => (
          <div className="feature-card glass" key={i} onClick={() => navigate(card.path)}
            style={{ background: card.color, borderColor: card.border }}>
            <span className="card-icon">{card.icon}</span>
            <h2 style={{ fontSize: "1.05rem" }}>{card.title}</h2>
            <p style={{ fontSize: "0.82rem" }}>{card.desc}</p>
            <span className="card-arrow">Go →</span>
          </div>
        ))}
      </section>

      {/* Recent Tours */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem" }}>🗺️ Recent Tours</h3>
          <button className="btn btn-secondary" style={{ padding: "8px 16px", fontSize: "0.82rem" }}
            onClick={() => navigate("/my-tours")}>View All</button>
        </div>

        {loading ? (
          <div className="empty-state glass"><div style={{ fontSize: "2rem" }}>⏳</div><h3>Loading...</h3></div>
        ) : recentTours.length === 0 ? (
          <div className="empty-state glass">
            <div style={{ fontSize: "3rem", marginBottom: "12px" }}>✈️</div>
            <h3>No tours yet</h3>
            <p>Create your first tour to get started.</p>
            <button className="btn btn-primary" style={{ marginTop: "16px" }} onClick={() => navigate("/create-tour")}>Create Tour</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px" }}>
            {recentTours.map((tour, i) => {
              const sc = statusColor(tour.status);
              return (
                <div key={i} className="glass" style={{ borderRadius: "20px", padding: "22px", border: "1px solid var(--border)", cursor: "pointer", transition: "all 0.25s" }}
                  onClick={() => navigate("/my-tours")}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.05rem", fontWeight: 700 }}>{tour.title}</h3>
                    <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "999px", background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, whiteSpace: "nowrap" }}>
                      {tour.status || "planned"}
                    </span>
                  </div>
                  <p style={{ color: "var(--muted)", fontSize: "0.82rem" }}>📅 {safeDate(tour.start_date)} → {safeDate(tour.end_date)}</p>
                  {tour.total_days && <p style={{ color: "var(--muted)", fontSize: "0.82rem", marginTop: "4px" }}>🗓️ {tour.total_days} days</p>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary strip */}
      <div style={{ borderRadius: "20px", padding: "20px 28px", background: "rgba(155,109,255,0.06)", border: "1px solid rgba(155,109,255,0.15)", display: "flex", alignItems: "center", gap: "16px" }}>
        <span style={{ fontSize: "1.8rem" }}>📊</span>
        <div>
          <p style={{ fontWeight: 600, marginBottom: "4px" }}>Your stats</p>
          <p style={{ color: "var(--muted)", fontSize: "0.88rem" }}>
            You have <strong style={{ color: "var(--accent)" }}>{tours.length} tour{tours.length !== 1 ? "s" : ""}</strong> planned.{" "}
            {tours.filter(t => t.status === "completed").length > 0 && (
              <><strong style={{ color: "#3dd6c8" }}>{tours.filter(t => t.status === "completed").length} completed</strong> so far!</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
