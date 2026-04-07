import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

const Budget = () => {
  const { tourId } = useParams();
  const navigate = useNavigate();
  const [budget, setBudget] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ accommodation_cost: "", transport_cost: "", food_cost: "", activity_cost: "", total_cost: "" });

  useEffect(() => { fetchBudget(); }, [tourId]);

  useEffect(() => {
    const total = Number(formData.accommodation_cost||0) + Number(formData.transport_cost||0) + Number(formData.food_cost||0) + Number(formData.activity_cost||0);
    setFormData(p => ({ ...p, total_cost: String(total) }));
  }, [formData.accommodation_cost, formData.transport_cost, formData.food_cost, formData.activity_cost]);

  const fetchBudget = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/budget/tour/${tourId}`);
      const data = Array.isArray(res.data) ? res.data[0] : res.data;
      if (data) {
        setBudget(data);
        setFormData({ accommodation_cost: data.accommodation_cost||"", transport_cost: data.transport_cost||"", food_cost: data.food_cost||"", activity_cost: data.activity_cost||"", total_cost: data.total_cost||"" });
      }
    } catch { setBudget(null); }
    finally { setLoading(false); }
  };

  const showMsg = (text, type = "error") => { setMessage(text); setMessageType(type); setTimeout(() => setMessage(""), 4000); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { tour_id: tourId, accommodation_cost: Number(formData.accommodation_cost||0), transport_cost: Number(formData.transport_cost||0), food_cost: Number(formData.food_cost||0), activity_cost: Number(formData.activity_cost||0), total_cost: Number(formData.total_cost||0) };
      if (budget?.id || budget?._id) { await API.put(`/budget/${budget.id||budget._id}`, payload); showMsg("Budget updated!", "success"); }
      else { await API.post("/budget", payload); showMsg("Budget created!", "success"); }
      fetchBudget();
    } catch (error) { showMsg(error.response?.data?.message || "Budget save failed"); }
  };

  const handleDelete = async () => {
    if (!budget?.id && !budget?._id) return;
    if (!window.confirm("Delete this budget?")) return;
    try {
      await API.delete(`/budget/${budget.id||budget._id}`);
      showMsg("Budget deleted!", "success");
      setBudget(null);
      setFormData({ accommodation_cost: "", transport_cost: "", food_cost: "", activity_cost: "", total_cost: "" });
    } catch (error) { showMsg(error.response?.data?.message || "Failed to delete"); }
  };

  const costFields = [
    { name: "accommodation_cost", label: "🏨 Accommodation", color: "rgba(79,142,247,0.1)" },
    { name: "transport_cost",     label: "🚌 Transport",      color: "rgba(61,214,200,0.1)" },
    { name: "food_cost",          label: "🍽️ Food & Dining",  color: "rgba(240,160,80,0.1)" },
    { name: "activity_cost",      label: "🎯 Activities",      color: "rgba(155,109,255,0.1)" },
  ];

  return (
    <div className="page">
      <div className="row-between section-header">
        <div>
          <span className="eyebrow">Budget Planner</span>
          <h1>Tour Budget</h1>
          <p>Track all your travel expenses in one clean, organized view.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ padding: "11px 20px", fontSize: "0.85rem" }}>← Back</button>
      </div>

      {Number(formData.total_cost) > 0 && (
        <div className="budget-total glass">
          <div>
            <div className="label">Estimated Total</div>
            <div style={{ color: "var(--muted)", fontSize: "0.82rem", marginTop: "4px" }}>All categories combined</div>
          </div>
          <div className="value">₹{Number(formData.total_cost).toLocaleString()}</div>
        </div>
      )}

      {budget && (
        <div className="budget-summary">
          {costFields.map(f => (
            <div className="budget-item" key={f.name} style={{ background: f.color }}>
              <div className="label">{f.label}</div>
              <div className="value">₹{Number(budget[f.name]||0).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="empty-state glass"><div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>⏳</div><h3>Loading budget...</h3></div>
      ) : (
        <form className="form-card glass" onSubmit={handleSubmit}>
          <h3>{budget ? "Update Budget" : "Create Budget"}</h3>
          {message && <div className={`alert ${messageType === "success" ? "success" : ""}`} style={{ marginBottom: "20px" }}>{message}</div>}
          <div className="form-grid">
            {costFields.map(f => (
              <div className="input-group" key={f.name}>
                <label>{f.label}</label>
                <input type="number" name={f.name} value={formData[f.name]} min="0" placeholder="0"
                  onChange={e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }))} />
              </div>
            ))}
            <div className="input-group full-width">
              <label>💰 Total Cost (Auto-calculated)</label>
              <input type="number" value={formData.total_cost} readOnly
                style={{ background: "rgba(232,201,126,0.06)", borderColor: "rgba(232,201,126,0.25)", fontWeight: 700, fontSize: "1.1rem" }} />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit" style={{ padding: "13px 28px" }}>{budget ? "💾 Update Budget" : "✨ Create Budget"}</button>
            {budget && <button type="button" className="btn btn-danger" onClick={handleDelete} style={{ padding: "13px 28px" }}>🗑️ Delete Budget</button>}
          </div>
        </form>
      )}
    </div>
  );
};

export default Budget;