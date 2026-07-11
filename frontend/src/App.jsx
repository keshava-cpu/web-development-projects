import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import ProjectsDashboardPage from "./pages/ProjectsDashboardPage";
import PatentsPage from "./pages/PatentsPage";
import LoginPage from "./pages/LoginPage";
import ConsultancyPage from "./pages/ConsultancyPage";
import ReportsPage from "./pages/ReportsPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicationsApp from "./features/publications/PublicationsApp";
import { PublicationsProvider } from "./features/publications/context/PublicationsContext";

const App = () => (
  <Routes>
    {/* ── Public Routes ──────────────────────────────────────────────────── */}
    <Route path="/login" element={<LoginPage />} />

    {/* ── Protected Routes ────────────────────────────────────────────────── */}
    <Route
      element={
        <PublicationsProvider>
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        </PublicationsProvider>
      }
    >
      {/* ── Feature A: R&D Management ───────────────────────────────────── */}
      <Route index element={<DashboardPage />} />
      <Route path="projects" element={<ProjectsDashboardPage />} />
      <Route path="patents" element={<PatentsPage />} />
      <Route path="consultancy" element={<ConsultancyPage />} />
      <Route path="reports" element={<ReportsPage />} />

      {/* ── Feature B: Publications Tracker ─────────────────────────────── */}
      {/*
       * All routes are nested under /publications-tracker/*.
       * PublicationsApp renders its own internal <Routes> for sub-paths.
       * The /* wildcard is required so React Router passes the rest of
       * the path to PublicationsApp's internal router.
       */}
      <Route path="publications-tracker/*" element={<PublicationsApp />} />
    </Route>

    {/* ── Catch-all ──────────────────────────────────────────────────────── */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
