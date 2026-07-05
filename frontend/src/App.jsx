import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import ProjectsDashboardPage from './pages/ProjectsDashboardPage';
import LoginPage from './pages/LoginPage';
import PlaceholderPage from './pages/PlaceholderPage';
import ProtectedRoute from './routes/ProtectedRoute';

const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />

    <Route
      element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<DashboardPage />} />
      <Route path="projects" element={<ProjectsDashboardPage />} />
      <Route
        path="publications"
        element={
          <PlaceholderPage
            title="Publications"
            description="Publication tracking module will be implemented in the next phase."
          />
        }
      />
      <Route
        path="patents"
        element={
          <PlaceholderPage
            title="Patents"
            description="Patent management views will be implemented in the next phase."
          />
        }
      />
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
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
