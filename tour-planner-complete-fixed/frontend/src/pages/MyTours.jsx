import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { extractArray } from "../services/api";

const MyTours = () => {
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [loading, setLoading] = useState(true);
  const [editingTourId, setEditingTourId] = useState(null);
  const [editData, setEditData] = useState({ title: "", start_date: "", end_date: "", hotel_name: "", transport_mode: "" });

  useEffect(() => { fetchTours(); }, []);

  useEffect(() => {
    const q = search.toLowerCase().trim();
    if (!q) { setFilteredTours(tours); return; }
    setFilteredTours(tours.filter(t =>
      (t.title || "").toLowerCase().includes(q) ||
      (t.hotel_name || t.hotel || "").toLowerCase().includes(q) ||
      (t.transport_mode || t.transport || "").toLowerCase().includes(q)
    ));
  }, [search, tours]);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const res = await API.get("/tours");
      const data = extractArray(res.data, ["tours", "data"]);
      setTours(data); setFilteredTours(data);
    } catch (error) {
      showMsg(error.response?.data?.message || "Failed to load tours");
    } finally { setLoading(false); }
  };

  const showMsg = (text, type = "error") => {
    setMessage(text); setMessageType(type);
    setTimeout(() => setMessage(""), 4000);
  };

  const safeDate = v => {
    if (!v) return "N/A";
    try { const d = new Date(v); return isNaN(d) ? "N/A" : d.toISOString().split("T")[0]; } catch { return "N/A"; }
  };

  const startEdit = (tour) => {
    setEditingTourId(tour.id || tour._id);
    setEditData({
      title: tour.title || "",
      start_date: safeDate(tour.start_date) === "N/A" ? "" : safeDate(tour.start_date),
      end_date:   safeDate(tour.end_date)   === "N/A" ? "" : safeDate(tour.end_date),
      hotel_name: tour.hotel_name || tour.hotel || "",
      transport_mode: tour.transport_mode || tour.transport || "",
    });
  };

  const handleUpdate = async (id) => {
    try {
      await API.put(`/tours/${id}`, editData);
      showMsg("Tour updated successfully!", "success");
      setEditingTourId(null);
      fetchTours();
    } catch (error) { showMsg(error.response?.data?.message || "Update failed"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this tour?")) return;
    try {
      await API.delete(`/tours/${id}`);
      showMsg("Tour deleted successfully!", "success");
      fetchTours();
    } catch (error) { showMsg(error.response?.data?.message || "Delete failed"); }
  };

  return (
    <div className="page">
      <div className="row-between section-header">
        <div>
          <span className="eyebrow">My Collection</span>
          <h1>Manage Your Tours</h1>
          <p>Search, update, delete, and explore itinerary and budget details.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/create-tour")}
          style={{ padding: "13px 24px", whiteSpace: "nowrap" }}>
          + Create Tour
        </button>
      </div>

      <div className="toolbar glass" style={{ padding: "14px 18px" }}>
        <input type="text" placeholder="🔍  Search by title, hotel or transport..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ background: "transparent", border: "none", fontSize: "0.95rem", padding: "6px 0" }} />
      </div>

      {message && <div className={`alert ${messageType === "success" ? "success" : ""}`}>{message}</div>}

      {loading ? (
        <div className="empty-state glass">
          <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>⏳</div>
          <h3>Loading your tours...</h3>
        </div>
      ) : filteredTours.length === 0 ? (
        <div className="empty-state glass">
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🗺️</div>
          <h3>No tours found</h3>
          <p style={{ marginBottom: "24px" }}>Create your first tour to start planning your adventure.</p>
          <button className="btn btn-primary" onClick={() => navigate("/create-tour")}>Create Your First Tour</button>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredTours.map(tour => {
            const id = tour.id || tour._id;
            const isEditing = editingTourId === id;
            return (
              <div className="tour-card glass" key={id}>
                {isEditing ? (
                  <>
                    <div style={{ marginBottom: "16px" }}>
                      <span className="eyebrow" style={{ fontSize: "0.7rem" }}>Editing Tour</span>
                    </div>
                    {[
                      { label: "Tour Title", name: "title",          type: "text" },
                      { label: "Start Date", name: "start_date",     type: "date" },
                      { label: "End Date",   name: "end_date",       type: "date" },
                      { label: "Hotel",      name: "hotel_name",     type: "text" },
                      { label: "Transport",  name: "transport_mode", type: "text" },
                    ].map(f => (
                      <div className="input-group" key={f.name} style={{ marginBottom: "12px" }}>
                        <label>{f.label}</label>
                        <input type={f.type} name={f.name} value={editData[f.name]}
                          onChange={e => setEditData(p => ({ ...p, [e.target.name]: e.target.value }))} />
                      </div>
                    ))}
                    <div className="card-actions">
                      <button className="btn btn-primary" onClick={() => handleUpdate(id)}>Save Changes</button>
                      <button className="btn btn-secondary" onClick={() => setEditingTourId(null)}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="tour-top">
                      <h2>{tour.title || "Untitled Tour"}</h2>
                      <span className="mini-badge">{tour.total_days || 0}d</span>
                    </div>
                    <div className="tour-info" style={{ marginBottom: "20px" }}>
                      {[
                        { label: "📅 Start",      value: safeDate(tour.start_date) },
                        { label: "📅 End",        value: safeDate(tour.end_date) },
                        { label: "🏨 Hotel",      value: tour.hotel_name || tour.hotel || "Not added" },
                        { label: "🚌 Transport",  value: tour.transport_mode || tour.transport || "Not added" },
                      ].map(item => (
                        <p key={item.label}><strong>{item.label}</strong>{item.value}</p>
                      ))}
                    </div>
                    <div className="card-actions wrap">
                      <button className="btn btn-primary"   style={{ fontSize: "0.82rem", padding: "9px 14px" }} onClick={() => navigate(`/budget/${id}`)}>💰 Budget</button>
                      <button className="btn btn-secondary" style={{ fontSize: "0.82rem", padding: "9px 14px" }} onClick={() => navigate(`/itinerary/${id}`)}>📋 Itinerary</button>
                      <button className="btn btn-warning"   style={{ fontSize: "0.82rem", padding: "9px 14px" }} onClick={() => startEdit(tour)}>✏️ Edit</button>
                      <button className="btn btn-danger"    style={{ fontSize: "0.82rem", padding: "9px 14px" }} onClick={() => handleDelete(id)}>🗑️</button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyTours;