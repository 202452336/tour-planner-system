import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { getDestinations, getHotelsByDestination, getTransportByDestination } from "../services/api";

const fallbackImage = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80";

const StarRating = ({ rating }) => {
  if (!rating) return <span style={{ color: "var(--muted)", fontSize: "13px" }}>No rating</span>;
  const stars = Math.round(parseFloat(rating));
  return (
    <span style={{ color: "#f59e0b", fontSize: "14px" }}>
      {"★".repeat(Math.min(stars, 5))}{"☆".repeat(Math.max(0, 5 - stars))}{" "}
      <span style={{ color: "var(--muted)", fontSize: "12px" }}>({rating}/5)</span>
    </span>
  );
};

const HotelCard = ({ hotel }) => (
  <div style={{ padding: "16px", borderRadius: "16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", marginBottom: "12px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
      <h4 style={{ margin: 0, fontSize: "15px", fontFamily: "'Playfair Display', serif" }}>{hotel.name || "Hotel"}</h4>
      <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "999px", background: "rgba(232,201,126,0.15)", color: "var(--accent)", whiteSpace: "nowrap", border: "1px solid rgba(232,201,126,0.2)" }}>{hotel.category || "Hotel"}</span>
    </div>
    <div style={{ marginTop: "8px" }}><StarRating rating={hotel.rating} /></div>
    <p style={{ margin: "8px 0 4px", fontSize: "13px", color: "var(--muted)" }}>📍 {hotel.address}</p>
    {hotel.locality && <p style={{ margin: "2px 0", fontSize: "12px", color: "var(--muted)" }}>🏙️ {hotel.locality}</p>}
    {hotel.hours && <p style={{ margin: "4px 0", fontSize: "12px", color: "var(--muted)" }}>🕐 {hotel.hours}</p>}
    {hotel.phone && <p style={{ margin: "4px 0", fontSize: "12px" }}>📞 <a href={`tel:${hotel.phone}`} style={{ color: "var(--accent)" }}>{hotel.phone}</a></p>}
    {hotel.website && <p style={{ margin: "4px 0", fontSize: "12px" }}>🌐 <a href={hotel.website} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>Visit website</a></p>}
    <div style={{ display: "flex", gap: "10px", marginTop: "8px", flexWrap: "wrap" }}>
      <span style={{ fontSize: "11px", color: "var(--muted)" }}>📅 Check-in: {hotel.checkInDate}</span>
      <span style={{ fontSize: "11px", color: "var(--muted)" }}>📅 Check-out: {hotel.checkOutDate}</span>
    </div>
  </div>
);

const transportIcon = (type) => {
  if (!type) return "🚌";
  const t = type.toLowerCase();
  if (t.includes("airport")) return "✈️";
  if (t.includes("train")) return "🚆";
  if (t.includes("bus")) return "🚌";
  return "🚉";
};

const TransportCard = ({ transport }) => (
  <div style={{ padding: "16px", borderRadius: "16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", marginBottom: "12px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
      <h4 style={{ margin: 0, fontSize: "15px", fontFamily: "'Playfair Display', serif" }}>
        {transportIcon(transport.type)} {transport.name || "Transport Hub"}
      </h4>
      <span style={{
        fontSize: "11px", padding: "3px 10px", borderRadius: "999px", whiteSpace: "nowrap", border: "1px solid",
        ...(transport.type && transport.type.includes("Airport")
          ? { background: "rgba(61,214,200,0.1)", color: "var(--teal)", borderColor: "rgba(61,214,200,0.2)" }
          : transport.type && transport.type.includes("Train")
            ? { background: "rgba(155,109,255,0.1)", color: "var(--purple)", borderColor: "rgba(155,109,255,0.2)" }
            : { background: "rgba(232,201,126,0.1)", color: "var(--accent)", borderColor: "rgba(232,201,126,0.2)" })
      }}>{transport.type || "Hub"}</span>
    </div>
    <p style={{ margin: "8px 0 4px", fontSize: "13px", color: "var(--muted)" }}>📍 {transport.address}</p>
    {transport.locality && <p style={{ margin: "2px 0", fontSize: "12px", color: "var(--muted)" }}>🏙️ {transport.locality}</p>}
    {transport.phone && <p style={{ margin: "4px 0", fontSize: "12px" }}>📞 <a href={`tel:${transport.phone}`} style={{ color: "var(--accent)" }}>{transport.phone}</a></p>}
    {transport.website && <p style={{ margin: "4px 0", fontSize: "12px" }}>🌐 <a href={transport.website} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>Visit website</a></p>}
  </div>
);

// ✅ KEY FIX: Modal uses createPortal to render directly on document.body.
// This escapes all parent stacking contexts created by backdrop-filter/transform
// on ancestor elements (.glass, .destination-card, .main-wrap etc.) which were
// trapping the modal behind other elements despite z-index: 1000.
const Modal = ({ show, onClose, title, loading, error, items, renderItem, emptyMessage }) => {
  if (!show) return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.78)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        padding: "20px",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: "580px",
          width: "100%",
          maxHeight: "82vh",
          borderRadius: "24px",
          background: "#0d1220",
          border: "1px solid rgba(232,201,126,0.25)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "slideUp 0.3s ease",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "22px 28px", borderBottom: "1px solid rgba(255,255,255,0.08)",
          flexShrink: 0,
        }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.15rem", fontWeight: 700, margin: 0, color: "#f0f4ff" }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.08)",
              width: "34px", height: "34px", borderRadius: "50%", display: "grid",
              placeItems: "center", fontSize: "18px", cursor: "pointer", color: "#8896b3",
              flexShrink: 0,
            }}
          >×</button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 28px", overflowY: "auto", flex: 1, color: "#f0f4ff" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#8896b3" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>⏳</div>
              <p>Finding the best options for you...</p>
            </div>
          ) : error ? (
            <p style={{ color: "#ff5f7a", textAlign: "center" }}>{error}</p>
          ) : !items || items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#8896b3" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>😕</div>
              <p>{emptyMessage || "No results found"}</p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: "12px", color: "#8896b3", marginBottom: "16px" }}>
                Showing {items.length} result{items.length !== 1 ? "s" : ""} near this destination
              </p>
              {items.map((item, i) => renderItem(item, i))}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body  // ← renders outside all stacking contexts
  );
};

// Safely extract an array from any API response shape
const toArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    for (const key of ["hotels", "transport", "data", "results", "items"]) {
      if (Array.isArray(data[key])) return data[key];
    }
  }
  return [];
};

const Destinations = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [transport, setTransport] = useState([]);
  const [showHotelsModal, setShowHotelsModal] = useState(false);
  const [showTransportModal, setShowTransportModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { fetchDestinations(); }, []);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const data = await getDestinations();
      setDestinations(toArray(data));
    } catch (e) {
      console.error("Failed to load destinations:", e);
      setDestinations([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDestinations = useMemo(() => {
    const text = search.toLowerCase().trim();
    return destinations.filter(d =>
      String(d?.name || "").toLowerCase().includes(text) ||
      String(d?.description || "").toLowerCase().includes(text) ||
      String(d?.location || "").toLowerCase().includes(text)
    );
  }, [destinations, search]);

  const handleViewHotels = async (dest) => {
    setSelectedDestination(dest);
    setHotels([]);
    setError("");
    setModalLoading(true);
    setShowHotelsModal(true);
    try {
      const raw = await getHotelsByDestination(dest.id, {
        checkInDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        checkOutDate: new Date(Date.now() + 172800000).toISOString().split("T")[0],
        adults: 1,
      });
      setHotels(toArray(raw));
    } catch (e) {
      console.error("[Hotels] error:", e);
      setError("Could not load hotels. Please try again.");
      setHotels([]);
    } finally {
      setModalLoading(false);
    }
  };

  const handleViewTransport = async (dest) => {
    setSelectedDestination(dest);
    setTransport([]);
    setError("");
    setModalLoading(true);
    setShowTransportModal(true);
    try {
      const raw = await getTransportByDestination(dest.id);
      setTransport(toArray(raw));
    } catch (e) {
      console.error("[Transport] error:", e);
      setError("Could not load transport. Please try again.");
      setTransport([]);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="page">
      <section className="destination-hero glass">
        <div>
          <span className="eyebrow">Explore Places</span>
          <h1>Where do you want to go?</h1>
          <p>Browse all available destinations and discover nearby hotels and transport.</p>
        </div>
        <div className="destination-search-box">
          <input
            type="text"
            placeholder="🔍  Search destinations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </section>

      {loading ? (
        <div className="empty-state glass">
          <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>⏳</div>
          <h3>Loading destinations...</h3>
        </div>
      ) : filteredDestinations.length === 0 ? (
        <div className="empty-state glass">
          <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🌍</div>
          <h3>No destinations found</h3>
          <p>Try a different search term.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {filteredDestinations.map((dest, i) => (
            <div className="destination-card" key={dest.id || i}>
              <div style={{ position: "relative", overflow: "hidden" }}>
                <img
                  src={dest.image_url || fallbackImage}
                  alt={dest.name || "Destination"}
                  onError={e => { e.target.src = fallbackImage; }}
                  style={{ width: "100%", height: "200px", objectFit: "cover", display: "block", transition: "transform 0.4s ease" }}
                />
                <span style={{
                  position: "absolute", top: "12px", right: "12px",
                  padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 600,
                  background: dest.source === "default" ? "rgba(79,142,247,0.85)" : "rgba(61,214,200,0.85)",
                  color: "#fff", backdropFilter: "blur(8px)"
                }}>
                  {dest.source === "default" ? "Default" : "Admin"}
                </span>
              </div>
              <div className="destination-card-body">
                <h2>{dest.name || "Destination"}</h2>
                <p>{dest.description || "Discover scenic beauty and memorable travel experiences."}</p>
                <div className="destination-meta">
                  {dest.location && <span>📍 {dest.location}</span>}
                  {dest.estimated_days && <span>🗓️ {dest.estimated_days} days</span>}
                </div>
                <div className="card-actions wrap" style={{ marginTop: "16px" }}>
                  <button
                    className="btn btn-primary"
                    style={{ fontSize: "0.82rem", padding: "9px 16px" }}
                    onClick={() => navigate("/create-tour", {
                      state: {
                        selectedDestination: {
                          id: dest.id, name: dest.name,
                          location: dest.location, image_url: dest.image_url, source: dest.source
                        }
                      }
                    })}
                  >
                    Plan Trip
                  </button>
                  <button className="btn btn-secondary" style={{ fontSize: "0.82rem", padding: "9px 16px" }} onClick={() => handleViewHotels(dest)}>
                    🏨 Hotels
                  </button>
                  <button className="btn btn-secondary" style={{ fontSize: "0.82rem", padding: "9px 16px" }} onClick={() => handleViewTransport(dest)}>
                    🚌 Transport
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        show={showHotelsModal}
        onClose={() => setShowHotelsModal(false)}
        title={`🏨 Hotels in ${selectedDestination?.name || ""}`}
        loading={modalLoading}
        error={error}
        items={hotels}
        renderItem={(h, i) => <HotelCard key={h.xid || i} hotel={h} />}
        emptyMessage="No hotels found for this destination."
      />

      <Modal
        show={showTransportModal}
        onClose={() => setShowTransportModal(false)}
        title={`🚌 Transport near ${selectedDestination?.name || ""}`}
        loading={modalLoading}
        error={error}
        items={transport}
        renderItem={(t, i) => <TransportCard key={t.xid || i} transport={t} />}
        emptyMessage="No transport hubs found for this destination."
      />
    </div>
  );
};

export default Destinations;
