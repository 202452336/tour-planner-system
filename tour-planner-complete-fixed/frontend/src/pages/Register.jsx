import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "user" });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage("");
    try {
      await API.post("/auth/register", formData);
      setMessageType("success");
      setMessage("Account created! Redirecting to login...");
      setTimeout(() => navigate("/"), 1200);
    } catch (error) {
      setMessageType("error");
      setMessage(error.response?.data?.message || "Registration failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-hero">
          <span className="eyebrow">Join Tour Planner</span>
          <h1>Create elegant travel plans without the confusion</h1>
          <p>Build trips faster with organized destination details, budgets, hotels, transport, and itinerary planning.</p>
          <div className="hero-points">
            <span>Clean and beautiful dashboard</span>
            <span>Smooth trip planning flow</span>
            <span>Save and manage all your tours</span>
          </div>
        </div>

        <form className="auth-form glass" onSubmit={handleSubmit}>
          <h2>Create Account</h2>
          {message && <div className={`alert ${messageType === "success" ? "success" : ""}`}>{message}</div>}

          <div className="input-group">
            <label>Full Name</label>
            <input type="text" placeholder="Your full name" value={formData.name} required
              onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="input-group">
            <label>Email Address</label>
            <input type="email" placeholder="you@example.com" value={formData.email} required
              onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="Create a strong password" value={formData.password} required
              onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} />
          </div>

          {/* Role selector */}
          <div className="input-group">
            <label>Account Type</label>
            <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
              {["user", "admin"].map(r => (
                <div key={r} onClick={() => setFormData(p => ({ ...p, role: r }))}
                  style={{
                    flex: 1, padding: "14px", borderRadius: "14px", cursor: "pointer", textAlign: "center",
                    border: `2px solid ${formData.role === r ? "var(--accent)" : "rgba(255,255,255,0.1)"}`,
                    background: formData.role === r ? "rgba(232,201,126,0.1)" : "rgba(255,255,255,0.03)",
                    transition: "all 0.2s",
                  }}>
                  <div style={{ fontSize: "1.4rem", marginBottom: "4px" }}>{r === "user" ? "👤" : "🛡️"}</div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", color: formData.role === r ? "var(--accent)" : "var(--muted)", textTransform: "capitalize" }}>{r}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "2px" }}>
                    {r === "user" ? "Plan your trips" : "Manage the platform"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}
            style={{ padding: "14px", fontSize: "0.95rem", marginTop: "8px" }}>
            {loading ? "Creating account..." : "Create Account →"}
          </button>
          <p className="switch-text" style={{ textAlign: "center" }}>
            Already have an account? <Link to="/">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
