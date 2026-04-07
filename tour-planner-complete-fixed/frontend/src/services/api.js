import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api",
});

// Auto attach token to every request if present
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Helper used by CreateTour and other pages
export const extractArray = (payload, keys = []) => {
    if (Array.isArray(payload)) return payload;

    if (payload && typeof payload === "object") {
        for (const key of keys) {
            if (Array.isArray(payload[key])) return payload[key];
        }
    }

    return [];
};

// ---------------- AUTH ----------------
export const loginUser = async(userData) => {
    const res = await API.post("/auth/login", userData);
    return res.data;
};

export const registerUser = async(userData) => {
    const res = await API.post("/auth/register", userData);
    return res.data;
};

// ---------------- DESTINATIONS ----------------
export const getDestinations = async() => {
    const res = await API.get("/destinations");
    return res.data;
};

export const getDestinationById = async(id) => {
    const res = await API.get(`/destinations/${id}`);
    return res.data;
};

export const addDestination = async(destinationData) => {
    const res = await API.post("/destinations", destinationData);
    return res.data;
};

export const updateDestination = async(id, destinationData) => {
    const res = await API.put(`/destinations/${id}`, destinationData);
    return res.data;
};

export const deleteDestination = async(id) => {
    const res = await API.delete(`/destinations/${id}`);
    return res.data;
};

// ---------------- HOTELS ----------------
export const getHotels = async() => {
    const res = await API.get("/hotels");
    return res.data;
};

export const getHotelsByDestination = async(destinationId, params = {}) => {
    const res = await API.get(`/hotels/destination/${destinationId}`, { params });
    return res.data;
};

// ---------------- TRANSPORT ----------------
export const getTransportOptions = async() => {
    const res = await API.get("/transport");
    return res.data;
};

export const getTransportByRoute = async(sourceId, destinationId, params = {}) => {
    const res = await API.get(`/transport/route/${sourceId}/${destinationId}`, { params });
    return res.data;
};

export const getTransportByDestination = async(destinationId, params = {}) => {
    const res = await API.get(`/transport/destination/${destinationId}`, { params });
    return res.data;
};
export const createTour = async(tourData) => {
    const res = await API.post("/tours", tourData);
    return res.data;
};

export const getMyTours = async() => {
    const res = await API.get("/tours/my-tours");
    return res.data;
};

export const getTourById = async(id) => {
    const res = await API.get(`/tours/${id}`);
    return res.data;
};

export const updateTour = async(id, tourData) => {
    const res = await API.put(`/tours/${id}`, tourData);
    return res.data;
};

export const deleteTour = async(id) => {
    const res = await API.delete(`/tours/${id}`);
    return res.data;
};

// ---------------- BUDGET ----------------
export const getBudgetByTourId = async(tourId) => {
    const res = await API.get(`/budget/${tourId}`);
    return res.data;
};

export const saveBudget = async(tourId, budgetData) => {
    const res = await API.post(`/budget/${tourId}`, budgetData);
    return res.data;
};

// ---------------- ITINERARY ----------------
export const getItineraryByTourId = async(tourId) => {
    const res = await API.get(`/itinerary/${tourId}`);
    return res.data;
};

export const saveItinerary = async(tourId, itineraryData) => {
    const res = await API.post(`/itinerary/${tourId}`, itineraryData);
    return res.data;
};

export default API;