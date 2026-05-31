import { AnimatePresence } from "framer-motion";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthInit } from "./components/AuthInit";
import { AssistantBot } from "./components/features/assistant/AssistantBot";
import { AppShell } from "./components/layout/AppShell";
import { Navbar } from "./components/layout/Navbar";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { Dashboard } from "./pages/Dashboard";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { MyProfile } from "./pages/MyProfile";
import { Plan } from "./pages/Plan";
import { PostSkill } from "./pages/PostSkill";
import { Profile } from "./pages/Profile";
import { Register } from "./pages/Register";
import { HelpCenter } from "./pages/HelpCenter";
import { Jobs } from "./pages/Jobs";
import { Messages } from "./pages/Messages";
import { Chat } from "./pages/Chat";
import { Proposals } from "./pages/Proposals";
import { Requests } from "./pages/Requests";

function AppChrome() {
  const location = useLocation();
  const isPublic = ["/", "/login", "/register"].includes(location.pathname);
  return isPublic ? <Navbar /> : null;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/plan" element={<Plan />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/proposals" element={<Proposals />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/chat/:requestId" element={<Chat />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/post-skill" element={<PostSkill />} />
            <Route path="/profile/me" element={<MyProfile />} />
            <Route path="/profile/:id" element={<Profile />} />
          </Route>
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthInit>
        <AppChrome />
        <AnimatedRoutes />
        <AssistantBot />
        <Toaster
          position="top-center"
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
