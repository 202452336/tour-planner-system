import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  let user = {};
  try { user = JSON.parse(localStorage.getItem("user")) || {}; } catch {}

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!token) return null;

  const isAdmin = user.role === "admin";

  const userLinks = [
    { to: "/dashboard",    label: "Dashboard" },
    { to: "/create-tour",  label: "Create Tour" },
    { to: "/my-tours",     label: "My Tours" },
    { to: "/destinations", label: "Destinations" },
  ];

  const adminLinks = [
    { to: "/admin",        label: "🛡️ Admin Panel" },
    { to: "/destinations", label: "Destinations" },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <header className="navbar">
      <div className="brand" onClick={() => navigate(isAdmin ? "/admin" : "/dashboard")}>
        <div className="brand-icon">✈</div>
        <div>
          <h2>Tour Planner</h2>
          <p>Smart journeys, beautifully planned</p>
        </div>
      </div>

      <nav className="nav-links">
        {links.map(link => (
          <Link key={link.to} className={location.pathname === link.to ? "active" : ""} to={link.to}>
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="nav-user">
        {/* Profile link */}
        <div onClick={() => navigate("/profile")} style={{
          display: "flex", alignItems: "center", gap: "8px", cursor: "pointer",
          padding: "6px 12px", borderRadius: "999px",
          background: location.pathname === "/profile" ? "rgba(232,201,126,0.12)" : "rgba(255,255,255,0.06)",
          border: `1px solid ${location.pathname === "/profile" ? "rgba(232,201,126,0.3)" : "var(--border)"}`,
          transition: "all 0.2s",
        }}>
          <div style={{ width:"28px",height:"28px",borderRadius:"50%",background:"linear-gradient(135deg,var(--accent),var(--accent2))",display:"grid",placeItems:"center",fontWeight:700,color:"#06080f",fontSize:"0.8rem",flexShrink:0 }}>
            {(user.name||"U")[0].toUpperCase()}
          </div>
          <span style={{ fontSize:"0.85rem",fontWeight:500,color:"var(--text)" }}>
            {user.name?.split(" ")[0] || "Profile"}
          </span>
        </div>

        <button className="btn btn-danger" onClick={handleLogout}
          style={{ padding: "9px 18px", fontSize: "0.85rem" }}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
