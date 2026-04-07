import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage("");
    try {
      const res = await API.post("/auth/login", formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate(res.data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed. Please check your credentials.");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-hero">
          <span className="eyebrow">Welcome Back</span>
          <h1>Plan dream tours with style and simplicity</h1>
          <p>Organize destinations, trips, budgets, and day-wise itineraries in one beautiful travel dashboard.</p>
          <div className="hero-points">
            <span>Manage all your tours in one place</span>
            <span>Track budgets clearly</span>
            <span>Build smart day-wise itineraries</span>
          </div>
        </div>

        <form className="auth-form glass" onSubmit={handleSubmit}>
          <h2>Sign In</h2>
          {message && <div className="alert">{message}</div>}

          <div className="input-group">
            <label>Email Address</label>
            <input type="email" placeholder="you@example.com" value={formData.email} required
              onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="Enter your password" value={formData.password} required
              onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}
            style={{ padding: "14px", fontSize: "0.95rem", marginTop: "8px" }}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>
          <p className="switch-text" style={{ textAlign: "center" }}>
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;