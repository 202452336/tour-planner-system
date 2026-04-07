import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API, { getTourById, getHotelsByDestination, getTransportByRoute } from "../services/api";

const Itinerary = () => {
  const { tourId } = useParams();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState([]);
  const [formData, setFormData] = useState({ day_number: "", activity: "", location: "", notes: "" });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [loading, setLoading] = useState(true);
  const [hotels, setHotels] = useState([]);
  const [transport, setTransport] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [hotelsLoading, setHotelsLoading] = useState(false);
  const [transportLoading, setTransportLoading] = useState(false);

  useEffect(() => { fetchItinerary(); }, [tourId]);

  const fetchItinerary = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/itinerary/tour/${tourId}`);
      const data = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.itinerary) ? res.data.itinerary : res.data ? [res.data] : [];
      setItinerary(data);
      const tourData = await getTourById(tourId);
      if (tourData.destination_id) {
        fetchHotels(tourData.destination_id);
        fetchTransport(tourData.destination_id, tourData.destination_id);
      }
    } catch { setItinerary([]); }
    finally { setLoading(false); }
  };

  const fetchHotels = async (id) => {
    setHotelsLoading(true);
    try { const data = await getHotelsByDestination(id, { checkInDate: new Date(Date.now()+86400000).toISOString().split("T")[0], checkOutDate: new Date(Date.now()+172800000).toISOString().split("T")[0], adults: 1 }); setHotels(data); }
    catch { setHotels([]); }
    finally { setHotelsLoading(false); }
  };

  const fetchTransport = async (src, dest) => {
    setTransportLoading(true);
    try { const data = await getTransportByRoute(src, dest, { departureDate: new Date(Date.now()+86400000).toISOString().split("T")[0], returnDate: new Date(Date.now()+172800000).toISOString().split("T")[0], adults: 1 }); setTransport(data); }
    catch { setTransport([]); }
    finally { setTransportLoading(false); }
  };

  const showMsg = (text, type = "error") => { setMessage(text); setMessageType(type); setTimeout(() => setMessage(""), 4000); };
  const resetForm = () => { setFormData({ day_number: "", activity: "", location: "", notes: "" }); setEditingId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { tour_id: tourId, day_number: Number(formData.day_number), activity: formData.activity, location: formData.location, notes: formData.notes };
      if (editingId) { await API.put(`/itinerary/${editingId}`, payload); showMsg("Day updated!", "success"); }
      else            { await API.post("/itinerary", payload);            showMsg("Day added!", "success"); }
      resetForm(); fetchItinerary();
    } catch (error) { showMsg(error.response?.data?.message || "Failed to save"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this itinerary item?")) return;
    try { await API.delete(`/itinerary/${id}`); showMsg("Day removed!", "success"); fetchItinerary(); }
    catch (error) { showMsg(error.response?.data?.message || "Failed to delete"); }
  };

  return (
    <div className="page">
      <div className="row-between section-header">
        <div>
          <span className="eyebrow">Day-wise Plan</span>
          <h1>Tour Itinerary</h1>
          <p>Plan each day of your journey with activities, locations and notes.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ padding: "11px 20px", fontSize: "0.85rem" }}>← Back</button>
      </div>

      <form className="form-card glass" onSubmit={handleSubmit}>
        <h3>{editingId ? "✏️ Edit Day" : "➕ Add New Day"}</h3>
        {message && <div className={`alert ${messageType === "success" ? "success" : ""}`} style={{ marginBottom: "16px" }}>{message}</div>}
        <div className="form-grid">
          <div className="input-group">
            <label>Day Number</label>
            <input type="number" value={formData.day_number} required min="1" placeholder="e.g. 1"
              onChange={e => setFormData(p => ({ ...p, day_number: e.target.value }))} />
          </div>
          <div className="input-group">
            <label>Activity</label>
            <input type="text" value={formData.activity} required placeholder="e.g. Beach visit"
              onChange={e => setFormData(p => ({ ...p, activity: e.target.value }))} />
          </div>
          <div className="input-group">
            <label>Location</label>
            <input type="text" value={formData.location} placeholder="e.g. North Goa"
              onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} />
          </div>
          <div className="input-group">
            <label>Notes</label>
            <input type="text" value={formData.notes} placeholder="Extra details..."
              onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} />
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" type="submit">{editingId ? "💾 Update Day" : "✨ Add Day"}</button>
          {editingId && <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      <div className="form-card glass">
        <h3>🏨 Select Hotel for Stay</h3>
        {hotelsLoading ? <p style={{ color: "var(--muted)" }}>Loading hotels...</p>
          : hotels.length === 0 ? <p style={{ color: "var(--muted)" }}>No hotels available for this destination.</p>
          : (
            <>
              <div className="options-grid">
                {hotels.slice(0,6).map((h,i) => (
                  <div key={i} className={`option-card ${selectedHotel===i?"selected":""}`} onClick={() => setSelectedHotel(i)}>
                    <h4>{h.name||"Hotel"}</h4>
                    <p>📍 {h.locality||h.address||"N/A"}</p>
                    {h.rating && <p>⭐ {h.rating}</p>}
                  </div>
                ))}
              </div>
              {selectedHotel !== null && <div className="selected-info">✅ Selected: <strong>{hotels[selectedHotel]?.name}</strong></div>}
            </>
          )}
      </div>

      <div className="form-card glass">
        <h3>🚌 Select Transport Option</h3>
        {transportLoading ? <p style={{ color: "var(--muted)" }}>Loading transport...</p>
          : transport.length === 0 ? <p style={{ color: "var(--muted)" }}>No transport options available.</p>
          : (
            <>
              <div className="options-grid">
                {transport.slice(0,6).map((t,i) => (
                  <div key={i} className={`option-card ${selectedTransport===i?"selected":""}`} onClick={() => setSelectedTransport(i)}>
                    <h4>{t.name||"Transport Hub"}</h4>
                    <p>{t.type||"Hub"}</p>
                    <p>📍 {t.locality||t.address||"N/A"}</p>
                  </div>
                ))}
              </div>
              {selectedTransport !== null && <div className="selected-info">✅ Selected: <strong>{transport[selectedTransport]?.name}</strong></div>}
            </>
          )}
      </div>

      <div>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", marginBottom: "16px" }}>📋 Itinerary Timeline</h3>
        <div className="timeline-list">
          {loading ? (
            <div className="empty-state glass"><div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>⏳</div><h3>Loading itinerary...</h3></div>
          ) : itinerary.length === 0 ? (
            <div className="empty-state glass"><div style={{ fontSize: "3rem", marginBottom: "16px" }}>📅</div><h3>No days added yet</h3><p>Start by adding your first day plan above.</p></div>
          ) : itinerary.map((item, index) => {
            const id = item.id || item._id;
            return (
              <div className="timeline-card glass" key={id||index}>
                <div className="timeline-day">
                  <span>{item.day_number||index+1}</span>Day
                </div>
                <div className="timeline-content">
                  <h3>{item.activity||"Planned Activity"}</h3>
                  {item.location && <p>📍 <strong>Location:</strong> {item.location}</p>}
                  {item.notes    && <p>📝 <strong>Notes:</strong> {item.notes}</p>}
                  <div className="card-actions" style={{ marginTop: "14px" }}>
                    <button className="btn btn-warning" style={{ padding: "9px 18px", fontSize: "0.85rem" }}
                      onClick={() => { setEditingId(id); setFormData({ day_number: item.day_number||"", activity: item.activity||"", location: item.location||"", notes: item.notes||"" }); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                      ✏️ Edit
                    </button>
                    <button className="btn btn-danger" style={{ padding: "9px 18px", fontSize: "0.85rem" }} onClick={() => handleDelete(id)}>🗑️ Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Itinerary;