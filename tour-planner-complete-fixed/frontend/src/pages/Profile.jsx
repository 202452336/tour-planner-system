import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const Profile = () => {
  const navigate = useNavigate();
  let stored = {};
  try { stored = JSON.parse(localStorage.getItem("user")) || {}; } catch {}

  const [profile, setProfile] = useState({ name: stored.name || "", email: stored.email || "", phone: stored.phone || "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [profileMsg, setProfileMsg] = useState({ text: "", type: "" });
  const [passMsg, setPassMsg] = useState({ text: "", type: "" });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const showMsg = (setter, text, type) => { setter({ text, type }); setTimeout(() => setter({ text: "", type: "" }), 4000); };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await API.put("/auth/profile", { name: profile.name, phone: profile.phone });
      const updated = { ...stored, ...res.data.user };
      localStorage.setItem("user", JSON.stringify(updated));
      showMsg(setProfileMsg, "Profile updated successfully!", "success");
    } catch (err) {
      showMsg(setProfileMsg, err.response?.data?.message || "Failed to update profile", "error");
    } finally { setProfileLoading(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm)
      return showMsg(setPassMsg, "New passwords do not match", "error");
    if (passwords.newPassword.length < 6)
      return showMsg(setPassMsg, "Password must be at least 6 characters", "error");
    setPassLoading(true);
    try {
      await API.put("/auth/change-password", { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      showMsg(setPassMsg, "Password changed successfully!", "success");
      setPasswords({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      showMsg(setPassMsg, err.response?.data?.message || "Failed to change password", "error");
    } finally { setPassLoading(false); }
  };

  const roleColor = stored.role === "admin"
    ? { bg: "rgba(155,109,255,0.15)", color: "#9b6dff", border: "rgba(155,109,255,0.3)" }
    : { bg: "rgba(79,142,247,0.15)",  color: "#4f8ef7", border: "rgba(79,142,247,0.3)" };

  return (
    <div className="page">
      <div className="row-between section-header">
        <div>
          <span className="eyebrow">Account</span>
          <h1>My Profile</h1>
          <p>Manage your personal information and security settings.</p>
        </div>
        {stored.role === "admin" && (
          <button className="btn btn-secondary" style={{ padding: "11px 20px", fontSize: "0.85rem" }}
            onClick={() => navigate("/admin")}>
            🛡️ Admin Panel
          </button>
        )}
      </div>

      {/* Avatar + role card */}
      <div className="glass" style={{ borderRadius: "24px", padding: "28px 32px", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "24px" }}>
        <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), var(--accent2))", display: "grid", placeItems: "center", fontSize: "1.8rem", fontWeight: 900, color: "#06080f", flexShrink: 0 }}>
          {(stored.name || "U")[0].toUpperCase()}
        </div>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", fontWeight: 700 }}>{stored.name}</h2>
          <p style={{ color: "var(--muted)", fontSize: "0.88rem", marginTop: "4px" }}>{stored.email}</p>
          <span style={{ display: "inline-block", marginTop: "8px", padding: "4px 12px", borderRadius: "999px", fontSize: "0.78rem", fontWeight: 600, textTransform: "capitalize", background: roleColor.bg, color: roleColor.color, border: `1px solid ${roleColor.border}` }}>
            {stored.role === "admin" ? "🛡️ Admin" : "👤 User"}
          </span>
        </div>
      </div>

      {/* Edit profile */}
      <form className="form-card glass" onSubmit={handleProfileSave}>
        <h3>✏️ Edit Profile</h3>
        {profileMsg.text && <div className={`alert ${profileMsg.type === "success" ? "success" : ""}`} style={{ marginBottom: "16px" }}>{profileMsg.text}</div>}
        <div className="form-grid">
          <div className="input-group">
            <label>Full Name</label>
            <input type="text" value={profile.name} required onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="input-group">
            <label>Email Address</label>
            <input type="email" value={profile.email} readOnly style={{ opacity: 0.5, cursor: "not-allowed" }} />
          </div>
          <div className="input-group">
            <label>Phone Number</label>
            <input type="text" value={profile.phone} placeholder="+1-234-567-8900" onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={profileLoading}>
            {profileLoading ? "Saving..." : "💾 Save Changes"}
          </button>
        </div>
      </form>

      {/* Change password */}
      <form className="form-card glass" onSubmit={handlePasswordChange}>
        <h3>🔒 Change Password</h3>
        {passMsg.text && <div className={`alert ${passMsg.type === "success" ? "success" : ""}`} style={{ marginBottom: "16px" }}>{passMsg.text}</div>}
        <div className="form-grid">
          <div className="input-group">
            <label>Current Password</label>
            <input type="password" value={passwords.currentPassword} required onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} />
          </div>
          <div className="input-group">
            <label>New Password</label>
            <input type="password" value={passwords.newPassword} required onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} />
          </div>
          <div className="input-group">
            <label>Confirm New Password</label>
            <input type="password" value={passwords.confirm} required onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} />
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-warning" type="submit" disabled={passLoading}>
            {passLoading ? "Changing..." : "🔑 Change Password"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
