import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import API from "../services/api";

// ── Modal ─────────────────────────────────────────────────────────────────────
const Modal = ({ show, onClose, title, children }) => {
  if (!show) return null;
  return createPortal(
    <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.78)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:99999,padding:"20px",backdropFilter:"blur(4px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ maxWidth:"600px",width:"100%",maxHeight:"85vh",borderRadius:"24px",background:"#0d1220",border:"1px solid rgba(232,201,126,0.25)",boxShadow:"0 32px 80px rgba(0,0,0,0.7)",display:"flex",flexDirection:"column",overflow:"hidden" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 28px",borderBottom:"1px solid rgba(255,255,255,0.08)",flexShrink:0 }}>
          <h3 style={{ fontFamily:"'Playfair Display',serif",fontSize:"1.1rem",margin:0,color:"#f0f4ff" }}>{title}</h3>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.1)",width:"34px",height:"34px",borderRadius:"50%",cursor:"pointer",color:"#8896b3",fontSize:"18px",display:"grid",placeItems:"center" }}>×</button>
        </div>
        <div style={{ padding:"24px 28px",overflowY:"auto",flex:1,color:"#f0f4ff" }}>{children}</div>
      </div>
    </div>,
    document.body
  );
};

const iStyle = { width:"100%",border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.05)",color:"#f0f4ff",padding:"11px 14px",borderRadius:"12px",outline:"none",fontSize:"0.9rem",marginBottom:"14px",boxSizing:"border-box" };
const lStyle = { fontSize:"0.78rem",fontWeight:600,letterSpacing:"0.05em",textTransform:"uppercase",color:"#8896b3",display:"block",marginBottom:"6px" };

// ── Users Tab ─────────────────────────────────────────────────────────────────
const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/auth/admin/users")
      .then(r => setUsers(Array.isArray(r.data) ? r.data : []))
      .catch(e => setError(e.response?.data?.message || "Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign:"center",padding:"40px",color:"var(--muted)" }}>⏳ Loading users...</div>;
  if (error) return <div style={{ textAlign:"center",padding:"40px",color:"#ff6b6b" }}>❌ {error}</div>;
  if (users.length === 0) return <div style={{ textAlign:"center",padding:"40px",color:"var(--muted)" }}>No users found.</div>;

  return (
    <div>
      <p style={{ color:"var(--muted)",fontSize:"0.88rem",marginBottom:"16px" }}>{users.length} registered users</p>
      <div style={{ display:"grid",gap:"10px" }}>
        {users.map((u, i) => (
          <div key={i} className="glass" style={{ borderRadius:"16px",padding:"16px 20px",border:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center",gap:"12px" }}>
            <div style={{ display:"flex",alignItems:"center",gap:"14px" }}>
              <div style={{ width:"40px",height:"40px",borderRadius:"50%",background:"linear-gradient(135deg,var(--accent),var(--accent2))",display:"grid",placeItems:"center",fontWeight:700,color:"#06080f",flexShrink:0 }}>
                {(u.name || "U")[0].toUpperCase()}
              </div>
              <div>
                <p style={{ fontWeight:600,marginBottom:"2px" }}>{u.name}</p>
                <p style={{ color:"var(--muted)",fontSize:"0.82rem" }}>{u.email}</p>
              </div>
            </div>
            <span style={{ fontSize:"11px",padding:"3px 10px",borderRadius:"999px",textTransform:"capitalize",
              background: u.role==="admin" ? "rgba(155,109,255,0.15)" : "rgba(79,142,247,0.15)",
              color: u.role==="admin" ? "#9b6dff" : "#4f8ef7",
              border: `1px solid ${u.role==="admin" ? "rgba(155,109,255,0.3)" : "rgba(79,142,247,0.3)"}` }}>
              {u.role === "admin" ? "🛡️ Admin" : "👤 User"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Tours Tab ─────────────────────────────────────────────────────────────────
const ToursTab = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/auth/admin/tours")
      .then(r => setTours(Array.isArray(r.data) ? r.data : []))
      .catch(e => setError(e.response?.data?.message || "Failed to load tours"))
      .finally(() => setLoading(false));
  }, []);

  const safeDate = v => { try { const d = new Date(v); return isNaN(d) ? "N/A" : d.toLocaleDateString(); } catch { return "N/A"; } };
  const sc = s => s==="completed" ? {bg:"rgba(61,214,200,0.12)",color:"#3dd6c8"} : s==="ongoing" ? {bg:"rgba(79,142,247,0.12)",color:"#4f8ef7"} : {bg:"rgba(232,201,126,0.12)",color:"var(--accent)"};

  if (loading) return <div style={{ textAlign:"center",padding:"40px",color:"var(--muted)" }}>⏳ Loading tours...</div>;
  if (error) return <div style={{ textAlign:"center",padding:"40px",color:"#ff6b6b" }}>❌ {error}</div>;
  if (tours.length === 0) return <div style={{ textAlign:"center",padding:"40px",color:"var(--muted)" }}>No tours found.</div>;

  return (
    <div>
      <p style={{ color:"var(--muted)",fontSize:"0.88rem",marginBottom:"16px" }}>{tours.length} total tours across all users</p>
      <div style={{ display:"grid",gap:"10px" }}>
        {tours.map((t, i) => {
          const c = sc(t.status);
          return (
            <div key={i} className="glass" style={{ borderRadius:"16px",padding:"16px 20px",border:"1px solid var(--border)" }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"8px",marginBottom:"8px" }}>
                <h4 style={{ fontFamily:"'Playfair Display',serif",fontSize:"1rem",fontWeight:700 }}>{t.title}</h4>
                <span style={{ fontSize:"11px",padding:"3px 10px",borderRadius:"999px",background:c.bg,color:c.color,whiteSpace:"nowrap" }}>{t.status || "planned"}</span>
              </div>
              <p style={{ color:"var(--muted)",fontSize:"0.82rem" }}>👤 {t.user_name} ({t.user_email})</p>
              <p style={{ color:"var(--muted)",fontSize:"0.82rem",marginTop:"4px" }}>📅 {safeDate(t.start_date)} → {safeDate(t.end_date)} · {t.total_days} days</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Destinations Tab ──────────────────────────────────────────────────────────
const DestinationsTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name:"",location:"",description:"",estimated_days:"",image_url:"" });
  const [msg, setMsg] = useState({ text:"",type:"" });

  const load = () => {
    setLoading(true);
    API.get("/destinations")
      .then(r => setItems(Array.isArray(r.data) ? r.data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);
  const showMsg = (text, type) => { setMsg({text,type}); setTimeout(() => setMsg({text:"",type:""}), 3500); };

  const openAdd = () => { setEditing(null); setForm({name:"",location:"",description:"",estimated_days:"",image_url:""}); setModal(true); };
  const openEdit = (d) => { setEditing(d); setForm({name:d.name||"",location:d.location||"",description:d.description||"",estimated_days:d.estimated_days||"",image_url:d.image_url||""}); setModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.location) return showMsg("Name and location are required", "error");
    try {
      if (editing) await API.put(`/destinations/${editing.id}`, form);
      else await API.post("/destinations", form);
      showMsg(editing ? "Destination updated!" : "Destination added!", "success");
      setModal(false); load();
    } catch(e) { showMsg(e.response?.data?.message || "Save failed", "error"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this destination?")) return;
    try { await API.delete(`/destinations/${id}`); showMsg("Deleted!", "success"); load(); }
    catch(e) { showMsg(e.response?.data?.message || "Delete failed", "error"); }
  };

  if (loading) return <div style={{ textAlign:"center",padding:"40px",color:"var(--muted)" }}>⏳ Loading...</div>;

  return (
    <div>
      {msg.text && <div className={`alert ${msg.type==="success" ? "success" : ""}`} style={{marginBottom:"14px"}}>{msg.text}</div>}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px" }}>
        <p style={{ color:"var(--muted)",fontSize:"0.88rem" }}>{items.length} destinations</p>
        <button className="btn btn-primary" style={{padding:"9px 18px",fontSize:"0.82rem"}} onClick={openAdd}>+ Add Destination</button>
      </div>
      <div style={{ display:"grid",gap:"10px" }}>
        {items.length === 0 && <div style={{textAlign:"center",padding:"40px",color:"var(--muted)"}}>No destinations yet.</div>}
        {items.map((d, i) => (
          <div key={i} className="glass" style={{ borderRadius:"16px",padding:"16px 20px",border:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center",gap:"12px" }}>
            <div>
              <p style={{ fontWeight:600,marginBottom:"2px" }}>{d.name}</p>
              <p style={{ color:"var(--muted)",fontSize:"0.82rem" }}>📍 {d.location} {d.estimated_days ? `· ${d.estimated_days} days` : ""}</p>
            </div>
            <div style={{ display:"flex",gap:"8px",flexShrink:0 }}>
              <button className="btn btn-warning" style={{padding:"7px 14px",fontSize:"0.78rem"}} onClick={() => openEdit(d)}>✏️ Edit</button>
              <button className="btn btn-danger" style={{padding:"7px 14px",fontSize:"0.78rem"}} onClick={() => handleDelete(d.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
      <Modal show={modal} onClose={() => setModal(false)} title={editing ? "Edit Destination" : "Add Destination"}>
        <label style={lStyle}>Name *</label>
        <input style={iStyle} value={form.name} onChange={e => setForm(p => ({...p,name:e.target.value}))} placeholder="e.g. Mumbai" />
        <label style={lStyle}>Location *</label>
        <input style={iStyle} value={form.location} onChange={e => setForm(p => ({...p,location:e.target.value}))} placeholder="e.g. Maharashtra, India" />
        <label style={lStyle}>Description</label>
        <input style={iStyle} value={form.description} onChange={e => setForm(p => ({...p,description:e.target.value}))} placeholder="Short description" />
        <label style={lStyle}>Estimated Days</label>
        <input style={iStyle} type="number" value={form.estimated_days} onChange={e => setForm(p => ({...p,estimated_days:e.target.value}))} placeholder="e.g. 5" />
        <label style={lStyle}>Image URL</label>
        <input style={iStyle} value={form.image_url} onChange={e => setForm(p => ({...p,image_url:e.target.value}))} placeholder="https://..." />
        <div style={{ display:"flex",gap:"10px",marginTop:"4px" }}>
          <button className="btn btn-primary" style={{flex:1,padding:"12px"}} onClick={handleSave}>{editing ? "Update" : "Add"}</button>
          <button className="btn btn-secondary" style={{padding:"12px 20px"}} onClick={() => setModal(false)}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
};

// ── Hotels Tab ────────────────────────────────────────────────────────────────
const HotelsTab = () => {
  const [items, setItems] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ destination_id:"",hotel_name:"",hotel_type:"",price_per_night:"",rating:"" });
  const [msg, setMsg] = useState({ text:"",type:"" });

  const load = () => {
    setLoading(true);
    Promise.all([API.get("/hotels"), API.get("/destinations")])
      .then(([h, d]) => {
        setItems(Array.isArray(h.data) ? h.data : []);
        setDestinations(Array.isArray(d.data) ? d.data : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, []);
  const showMsg = (text, type) => { setMsg({text,type}); setTimeout(() => setMsg({text:"",type:""}), 3500); };

  const openAdd = () => { setEditing(null); setForm({destination_id:"",hotel_name:"",hotel_type:"",price_per_night:"",rating:""}); setModal(true); };
  const openEdit = (h) => { setEditing(h); setForm({destination_id:h.destination_id||"",hotel_name:h.hotel_name||"",hotel_type:h.hotel_type||"",price_per_night:h.price_per_night||"",rating:h.rating||""}); setModal(true); };

  const handleSave = async () => {
    if (!form.destination_id || !form.hotel_name || !form.price_per_night) return showMsg("Destination, name and price required", "error");
    try {
      if (editing) await API.put(`/hotels/${editing.id}`, form);
      else await API.post("/hotels", form);
      showMsg(editing ? "Hotel updated!" : "Hotel added!", "success");
      setModal(false); load();
    } catch(e) { showMsg(e.response?.data?.message || "Save failed", "error"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this hotel?")) return;
    try { await API.delete(`/hotels/${id}`); showMsg("Deleted!", "success"); load(); }
    catch(e) { showMsg(e.response?.data?.message || "Delete failed", "error"); }
  };

  if (loading) return <div style={{ textAlign:"center",padding:"40px",color:"var(--muted)" }}>⏳ Loading...</div>;

  return (
    <div>
      {msg.text && <div className={`alert ${msg.type==="success" ? "success" : ""}`} style={{marginBottom:"14px"}}>{msg.text}</div>}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px" }}>
        <p style={{ color:"var(--muted)",fontSize:"0.88rem" }}>{items.length} hotels in database</p>
        <button className="btn btn-primary" style={{padding:"9px 18px",fontSize:"0.82rem"}} onClick={openAdd}>+ Add Hotel</button>
      </div>
      <div style={{ display:"grid",gap:"10px" }}>
        {items.length === 0 && <div style={{textAlign:"center",padding:"40px",color:"var(--muted)"}}>No hotels yet.</div>}
        {items.map((h, i) => (
          <div key={i} className="glass" style={{ borderRadius:"16px",padding:"16px 20px",border:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center",gap:"12px" }}>
            <div>
              <p style={{ fontWeight:600,marginBottom:"2px" }}>{h.hotel_name}</p>
              <p style={{ color:"var(--muted)",fontSize:"0.82rem" }}>🏨 {h.hotel_type || "Hotel"} · ₹{h.price_per_night}/night {h.rating ? `· ⭐${h.rating}` : ""}</p>
            </div>
            <div style={{ display:"flex",gap:"8px",flexShrink:0 }}>
              <button className="btn btn-warning" style={{padding:"7px 14px",fontSize:"0.78rem"}} onClick={() => openEdit(h)}>✏️</button>
              <button className="btn btn-danger" style={{padding:"7px 14px",fontSize:"0.78rem"}} onClick={() => handleDelete(h.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
      <Modal show={modal} onClose={() => setModal(false)} title={editing ? "Edit Hotel" : "Add Hotel"}>
        <label style={lStyle}>Destination *</label>
        <select style={iStyle} value={form.destination_id} onChange={e => setForm(p => ({...p,destination_id:e.target.value}))}>
          <option value="">Select destination</option>
          {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <label style={lStyle}>Hotel Name *</label>
        <input style={iStyle} value={form.hotel_name} onChange={e => setForm(p => ({...p,hotel_name:e.target.value}))} placeholder="e.g. Taj Palace Hotel" />
        <label style={lStyle}>Type</label>
        <input style={iStyle} value={form.hotel_type} onChange={e => setForm(p => ({...p,hotel_type:e.target.value}))} placeholder="Hotel / Resort / Guest House" />
        <label style={lStyle}>Price per Night *</label>
        <input style={iStyle} type="number" value={form.price_per_night} onChange={e => setForm(p => ({...p,price_per_night:e.target.value}))} placeholder="e.g. 2500" />
        <label style={lStyle}>Rating (1-5)</label>
        <input style={iStyle} type="number" min="1" max="5" value={form.rating} onChange={e => setForm(p => ({...p,rating:e.target.value}))} placeholder="e.g. 4" />
        <div style={{ display:"flex",gap:"10px",marginTop:"4px" }}>
          <button className="btn btn-primary" style={{flex:1,padding:"12px"}} onClick={handleSave}>{editing ? "Update" : "Add"}</button>
          <button className="btn btn-secondary" style={{padding:"12px 20px"}} onClick={() => setModal(false)}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
};

// ── Transport Tab ─────────────────────────────────────────────────────────────
const TransportTab = () => {
  const [items, setItems] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ source_destination_id:"",destination_id:"",mode:"",price:"",duration:"" });
  const [msg, setMsg] = useState({ text:"",type:"" });

  const load = () => {
    setLoading(true);
    Promise.all([API.get("/transport"), API.get("/destinations")])
      .then(([t, d]) => {
        setItems(Array.isArray(t.data) ? t.data : []);
        setDestinations(Array.isArray(d.data) ? d.data : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, []);
  const showMsg = (text, type) => { setMsg({text,type}); setTimeout(() => setMsg({text:"",type:""}), 3500); };

  const openAdd = () => { setEditing(null); setForm({source_destination_id:"",destination_id:"",mode:"",price:"",duration:""}); setModal(true); };
  const openEdit = (t) => { setEditing(t); setForm({source_destination_id:t.source_destination_id||"",destination_id:t.destination_id||"",mode:t.mode||"",price:t.price||"",duration:t.duration||""}); setModal(true); };

  const handleSave = async () => {
    if (!form.source_destination_id || !form.destination_id || !form.mode || !form.price) return showMsg("All fields except duration are required", "error");
    try {
      if (editing) await API.put(`/transport/${editing.id}`, form);
      else await API.post("/transport", form);
      showMsg(editing ? "Transport updated!" : "Transport added!", "success");
      setModal(false); load();
    } catch(e) { showMsg(e.response?.data?.message || "Save failed", "error"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transport option?")) return;
    try { await API.delete(`/transport/${id}`); showMsg("Deleted!", "success"); load(); }
    catch(e) { showMsg(e.response?.data?.message || "Delete failed", "error"); }
  };

  if (loading) return <div style={{ textAlign:"center",padding:"40px",color:"var(--muted)" }}>⏳ Loading...</div>;

  return (
    <div>
      {msg.text && <div className={`alert ${msg.type==="success" ? "success" : ""}`} style={{marginBottom:"14px"}}>{msg.text}</div>}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px" }}>
        <p style={{ color:"var(--muted)",fontSize:"0.88rem" }}>{items.length} transport options</p>
        <button className="btn btn-primary" style={{padding:"9px 18px",fontSize:"0.82rem"}} onClick={openAdd}>+ Add Transport</button>
      </div>
      <div style={{ display:"grid",gap:"10px" }}>
        {items.length === 0 && <div style={{textAlign:"center",padding:"40px",color:"var(--muted)"}}>No transport options yet.</div>}
        {items.map((t, i) => (
          <div key={i} className="glass" style={{ borderRadius:"16px",padding:"16px 20px",border:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center",gap:"12px" }}>
            <div>
              <p style={{ fontWeight:600,marginBottom:"2px" }}>🚌 {t.mode}</p>
              <p style={{ color:"var(--muted)",fontSize:"0.82rem" }}>₹{t.price} {t.duration ? `· ${t.duration}` : ""}</p>
            </div>
            <div style={{ display:"flex",gap:"8px",flexShrink:0 }}>
              <button className="btn btn-warning" style={{padding:"7px 14px",fontSize:"0.78rem"}} onClick={() => openEdit(t)}>✏️</button>
              <button className="btn btn-danger" style={{padding:"7px 14px",fontSize:"0.78rem"}} onClick={() => handleDelete(t.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
      <Modal show={modal} onClose={() => setModal(false)} title={editing ? "Edit Transport" : "Add Transport"}>
        <label style={lStyle}>From (Source) *</label>
        <select style={iStyle} value={form.source_destination_id} onChange={e => setForm(p => ({...p,source_destination_id:e.target.value}))}>
          <option value="">Select source</option>
          {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <label style={lStyle}>To (Destination) *</label>
        <select style={iStyle} value={form.destination_id} onChange={e => setForm(p => ({...p,destination_id:e.target.value}))}>
          <option value="">Select destination</option>
          {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <label style={lStyle}>Mode *</label>
        <input style={iStyle} value={form.mode} onChange={e => setForm(p => ({...p,mode:e.target.value}))} placeholder="e.g. Flight / Train / Bus" />
        <label style={lStyle}>Price *</label>
        <input style={iStyle} type="number" value={form.price} onChange={e => setForm(p => ({...p,price:e.target.value}))} placeholder="e.g. 3500" />
        <label style={lStyle}>Duration (optional)</label>
        <input style={iStyle} value={form.duration} onChange={e => setForm(p => ({...p,duration:e.target.value}))} placeholder="e.g. 2h 30m" />
        <div style={{ display:"flex",gap:"10px",marginTop:"4px" }}>
          <button className="btn btn-primary" style={{flex:1,padding:"12px"}} onClick={handleSave}>{editing ? "Update" : "Add"}</button>
          <button className="btn btn-secondary" style={{padding:"12px 20px"}} onClick={() => setModal(false)}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
};

// ── Main AdminDashboard ───────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");

  let user = {};
  try { user = JSON.parse(localStorage.getItem("user")) || {}; } catch {}

  useEffect(() => {
    if (user.role !== "admin") navigate("/dashboard", { replace: true });
  }, []);

  const tabs = [
    { key: "users",        label: "👥 Users" },
    { key: "tours",        label: "🗺️ User Tours" },
    { key: "destinations", label: "📍 Destinations" },
    { key: "hotels",       label: "🏨 Hotels" },
    { key: "transport",    label: "🚌 Transport" },
  ];

  const renderTab = () => {
    switch(activeTab) {
      case "users":        return <UsersTab />;
      case "tours":        return <ToursTab />;
      case "destinations": return <DestinationsTab />;
      case "hotels":       return <HotelsTab />;
      case "transport":    return <TransportTab />;
      default:             return null;
    }
  };

  if (user.role !== "admin") return null;

  return (
    <div className="page">
      <div className="row-between section-header">
        <div>
          <span className="eyebrow">Admin Panel</span>
          <h1>🛡️ Admin Dashboard</h1>
          <p>Welcome, {user.name}. Manage destinations, hotels, transport and view all user data.</p>
        </div>
      </div>

      <div className="glass" style={{ borderRadius:"18px",padding:"8px",border:"1px solid var(--border)",display:"flex",gap:"4px",flexWrap:"wrap" }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{
              flex:1, minWidth:"120px", padding:"11px 16px", borderRadius:"12px", border:"none", cursor:"pointer",
              fontSize:"0.85rem", fontWeight:600, transition:"all 0.2s",
              background: activeTab === t.key ? "linear-gradient(135deg,var(--accent),var(--accent2))" : "transparent",
              color: activeTab === t.key ? "#06080f" : "var(--muted)",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="form-card glass">
        {renderTab()}
      </div>
    </div>
  );
};

export default AdminDashboard;