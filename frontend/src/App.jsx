import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import ProjectsDashboardPage from "./pages/ProjectsDashboardPage";
import PatentsPage from "./pages/PatentsPage";
import LoginPage from "./pages/LoginPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicationsApp from "./features/publications/PublicationsApp";
import { PublicationsProvider } from "./features/publications/context/PublicationsContext";

const App = () => (
  <Routes>
    {/* ── Public Routes ──────────────────────────────────────────────────── */}
    <Route path="/login" element={<LoginPage />} />

    {/* ── Protected Routes (require vinay-temp email/password login) ─────── */}
    <Route
      element={
        <PublicationsProvider>
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        </PublicationsProvider>
      }
    >
      {/* ── Feature A: R&D Management (vinay-temp / backend) ─────────────── */}
      <Route index element={<DashboardPage />} />
      <Route path="projects" element={<ProjectsDashboardPage />} />
      <Route
        path="publications"
        element={
          <PlaceholderPage
            title="Publications"
            description="Use the Publications Tracker in the navigation bar for the full publications workflow."
          />
        }
      />
      <Route path="patents" element={<PatentsPage />} />
      <Route
        path="consultancy"
        element={
          <PlaceholderPage
            title="Consultancy"
            description="Consultancy records module will be implemented in the next phase."
          />
        }
      />
      <Route
        path="reports"
        element={
          <PlaceholderPage
            title="Reports"
            description="Aggregate reporting dashboards will be implemented in the next phase."
          />
        }
      />

      {/* ── Feature B: Publications Tracker (Keshava-stdnt / server) ─────── */}
      {/*
       * All web/ routes are nested under /publications-tracker/*.
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
