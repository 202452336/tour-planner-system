import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API, { extractArray } from "../services/api";

const CreateTour = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [destinations, setDestinations] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [transportOptions, setTransportOptions] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "", destination_id: "", start_date: "", end_date: "", hotel_name: "", transport_mode: "",
  });

  useEffect(() => { fetchDestinations(); fetchTransportOptions(); }, []);

  useEffect(() => {
    const selected = location.state?.selectedDestination;
    if (selected?.id) setFormData(p => ({ ...p, destination_id: String(selected.id) }));
  }, [location.state]);

  useEffect(() => {
    if (formData.destination_id) fetchHotelsByDestination(formData.destination_id);
    else setHotels([]);
  }, [formData.destination_id]);

  const totalDays = useMemo(() => {
    if (!formData.start_date || !formData.end_date) return 0;
    const diff = Math.ceil((new Date(formData.end_date) - new Date(formData.start_date)) / 86400000) + 1;
    return diff > 0 ? diff : 0;
  }, [formData.start_date, formData.end_date]);

  const fetchDestinations = async () => {
    try {
      const res = await API.get("/destinations");
      setDestinations(extractArray(res.data, ["destinations", "data"]));
    } catch { setDestinations([]); }
  };

  const fetchHotelsByDestination = async (id) => {
    try {
      const res = await API.get(`/hotels/destination/${id}`);
      setHotels(extractArray(res.data, ["hotels", "data"]));
    } catch {
      try { const fb = await API.get("/hotels"); setHotels(extractArray(fb.data, ["hotels", "data"])); }
      catch { setHotels([]); }
    }
  };

  const fetchTransportOptions = async () => {
    try {
      const res = await API.get("/transport");
      setTransportOptions(extractArray(res.data, ["transport", "transports", "data"]));
    } catch { setTransportOptions([]); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value, ...(name === "destination_id" ? { hotel_name: "" } : {}) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!formData.title.trim())        { setMessageType("error"); setMessage("Please enter a tour title"); return; }
    if (!formData.destination_id)      { setMessageType("error"); setMessage("Please select a destination"); return; }
    if (!formData.start_date || !formData.end_date) { setMessageType("error"); setMessage("Please select both dates"); return; }
    if (totalDays <= 0)                { setMessageType("error"); setMessage("End date must be after start date"); return; }

    setLoading(true);
    try {
      await API.post("/tours", {
        title: formData.title,
        destination_id: formData.destination_id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        total_days: totalDays,
        hotel_name: formData.hotel_name,
        transport_mode: formData.transport_mode,
      });
      setMessageType("success");
      setMessage("Tour created successfully! Redirecting...");
      setTimeout(() => navigate("/my-tours"), 900);
    } catch (error) {
      setMessageType("error");
      setMessage(error.response?.data?.message || "Failed to create tour");
    } finally {
      setLoading(false);
    }
  };

  const selectedDestinationName = destinations.find(
    d => String(d.id || d._id) === String(formData.destination_id)
  )?.name || "";

  return (
    <div className="page">
      <div className="row-between section-header">
        <div>
          <span className="eyebrow">New Tour</span>
          <h1>Create Your Perfect Tour</h1>
          <p>Choose a destination, dates, hotel, and transport to build your next journey.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate("/destinations")}
          style={{ padding: "11px 20px", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
          🌍 Browse Destinations
        </button>
      </div>

      {totalDays > 0 && (
        <div style={{ borderRadius: "20px", padding: "20px 28px", background: "linear-gradient(135deg, rgba(232,201,126,0.1), rgba(240,160,80,0.07))", border: "1px solid rgba(232,201,126,0.25)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "var(--muted)", fontWeight: 600 }}>Trip Duration</span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", fontWeight: 900, color: "var(--accent)" }}>
            {totalDays} day{totalDays !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      <form className="form-card glass" onSubmit={handleSubmit}>
        <h3>✈️ Tour Details</h3>
        {message && <div className={`alert ${messageType === "success" ? "success" : ""}`}>{message}</div>}

        <div className="form-grid">
          <div className="input-group">
            <label>Tour Title</label>
            <input type="text" name="title" placeholder="e.g. Goa Beach Vacation"
              value={formData.title} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label>Destination</label>
            <select name="destination_id" value={formData.destination_id} onChange={handleChange} required>
              <option value="">Select destination...</option>
              {destinations.map(d => (
                <option key={d.id || d._id} value={String(d.id || d._id)}>
                  {d.name || d.destination_name || `Destination ${d.id || d._id}`}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Start Date</label>
            <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label>End Date</label>
            <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label>Hotel</label>
            {hotels.length > 0 ? (
              <select name="hotel_name" value={formData.hotel_name} onChange={handleChange}>
                <option value="">Select hotel...</option>
                {hotels.map(h => (
                  <option key={h.id || h._id} value={h.name || h.hotel_name}>
                    {h.name || h.hotel_name}
                  </option>
                ))}
              </select>
            ) : (
              <input type="text" name="hotel_name" placeholder="Enter hotel name"
                value={formData.hotel_name} onChange={handleChange} />
            )}
          </div>

          <div className="input-group">
            <label>Transport Mode</label>
            {transportOptions.length > 0 ? (
              <select name="transport_mode" value={formData.transport_mode} onChange={handleChange}>
                <option value="">Select transport...</option>
                {transportOptions.map(t => (
                  <option key={t.id || t._id} value={t.mode || t.transport_mode || t.type || t.name}>
                    {t.mode || t.transport_mode || t.type || t.name}
                  </option>
                ))}
              </select>
            ) : (
              <select name="transport_mode" value={formData.transport_mode} onChange={handleChange}>
                <option value="">Select transport...</option>
                <option value="Flight">✈️ Flight</option>
                <option value="Train">🚆 Train</option>
                <option value="Bus">🚌 Bus</option>
                <option value="Car">🚗 Car</option>
              </select>
            )}
          </div>

          <div className="input-group full-width">
            <label>Total Days (Auto-calculated)</label>
            <input type="text" value={totalDays > 0 ? `${totalDays} day${totalDays !== 1 ? "s" : ""}` : ""}
              readOnly placeholder="Select dates above" />
          </div>
        </div>

        {selectedDestinationName && (
          <div className="selected-destination-note">
            📍 Selected: <strong>{selectedDestinationName}</strong>
          </div>
        )}

        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={loading}
            style={{ padding: "13px 32px", fontSize: "0.95rem" }}>
            {loading ? "Creating..." : "✨ Create Tour"}
          </button>
          <button className="btn btn-secondary" type="button" onClick={() => navigate("/my-tours")}
            style={{ padding: "13px 24px" }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTour;