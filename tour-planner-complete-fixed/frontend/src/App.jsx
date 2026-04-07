import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateTour from "./pages/CreateTour";
import MyTours from "./pages/MyTours";
import Destinations from "./pages/Destinations";
import Budget from "./pages/Budget";
import Itinerary from "./pages/Itinerary";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <Router>
      <div className="app-shell">
        <Navbar />
        <main className="main-wrap">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/create-tour" element={<ProtectedRoute><CreateTour /></ProtectedRoute>} />
            <Route path="/my-tours" element={<ProtectedRoute><MyTours /></ProtectedRoute>} />
            <Route path="/destinations" element={<ProtectedRoute><Destinations /></ProtectedRoute>} />
            <Route path="/budget/:tourId" element={<ProtectedRoute><Budget /></ProtectedRoute>} />
            <Route path="/itinerary/:tourId" element={<ProtectedRoute><Itinerary /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;