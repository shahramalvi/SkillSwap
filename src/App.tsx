import { AnimatePresence } from "framer-motion";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthInit } from "./components/AuthInit";
import { Navbar } from "./components/layout/Navbar";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { Dashboard } from "./pages/Dashboard";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { MyProfile } from "./pages/MyProfile";
import { PostSkill } from "./pages/PostSkill";
import { Profile } from "./pages/Profile";
import { Register } from "./pages/Register";
import { Requests } from "./pages/Requests";
import { Search } from "./pages/Search";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/search" element={<Search />} />
          <Route path="/post-skill" element={<PostSkill />} />
          <Route path="/profile/me" element={<MyProfile />} />
          <Route path="/profile/:id" element={<Profile />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthInit>
        <Navbar />
        <AnimatedRoutes />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#ffffff",
              color: "#0D1B3E",
              border: "1px solid #d0d8e8",
              fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
              borderRadius: "12px",
              boxShadow: "0 4px 24px rgba(13, 27, 62, 0.1)",
            },
            success: { iconTheme: { primary: "#0D1B3E", secondary: "#ffffff" } },
            error: { iconTheme: { primary: "#c45c5c", secondary: "#ffffff" } },
          }}
        />
      </AuthInit>
    </BrowserRouter>
  );
}
