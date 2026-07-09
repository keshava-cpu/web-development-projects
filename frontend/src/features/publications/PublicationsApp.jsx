/**
 * PublicationsApp
 *
 * Thin routing shell for the Publications Tracker feature.
 * All state and business logic lives in PublicationsContext.
 *
 * Key facts:
 *  - Authentication is sourced from the shared AuthContext (vinay login).
 *  - No top-level BrowserRouter — provided by root app.
 *  - All route paths are relative (run under /publications-tracker/*).
 *  - API calls use /api/keshava/* endpoints.
 *
 * Previously: 833-line monolith.
 * Now:        ~130 lines of routing + provider wiring.
 */
import { Navigate, Route, Routes } from "react-router-dom";
import Box from "@mui/material/Box";

import { PublicationsProvider, usePublications } from "./context/PublicationsContext";
import AuthCallback from "./components/AuthCallback";
import InvalidDomainPage from "./components/InvalidDomainPage";

import DashboardListView from "./pages/faculty/DashboardListView";
import CreateEntryView from "./pages/faculty/CreateEntryView";
import EditEntryView from "./pages/faculty/EditEntryView";
import DashboardDetailView from "./pages/faculty/DashboardDetailView";
import AdminRoute from "./routes/AdminRoute";
import FacultyRoute from "./routes/FacultyRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminReviewQueue from "./pages/admin/AdminReviewQueue";
import AdminPublications from "./pages/admin/AdminPublications";
import AdminUserDirectory from "./pages/admin/AdminUserDirectory";
import AdminEntryDetail from "./pages/admin/AdminEntryDetail";
import ProfilePage from "./pages/faculty/ProfilePage";
import SetupProfilePage from "./pages/SetupProfilePage";

import "./publications.css";

// ─── Inner router (has access to PublicationsContext) ─────────────────────────
function PublicationsRoutes() {
  const {
    isAuthenticated,
    isAdmin,
    isKnownProfile,
    token,
    role,
    userEmail,
    userName,
    selectedEntryId,
    selectedEntry,
    filteredEntries,
    entryDraft,
    setEntryDraft,
    commitMessage,
    setCommitMessage,
    selectedVersion,
    setSelectedVersion,
    search,
    setSearch,
    users,
    setEntries,
    setSelectedEntryId,
    currentUserProfile,
    facultyProfile,
    notifications,
    notificationsOpen,
    setNotificationsOpen,
    notificationsRef,
    unreadCount,
    sidebarCollapsed,
    setSidebarCollapsed,
    statusLabels,
    statusClasses,
    emptyEntry,
    shortId,
    nowStamp,
    selectEntry,
    addEntryNotification,
    handleSuccessfulLogin,
    markNotificationRead,
    markAllNotificationsRead,
    toggleNotifications,
    handleSaveProfile,
    handleLogout,
  } = usePublications();

  // Redirect unauthenticated users
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const sharedLayoutProps = {
    authenticated: isAuthenticated,
    role,
    handleLogout,
    unreadCount,
    notificationsOpen,
    setNotificationsOpen,
    toggleNotifications,
    markAllNotificationsRead,
    notifications,
    markNotificationRead,
    notificationsRef,
  };

  return (
    <Box component="main" sx={{ minHeight: "100vh", bgcolor: "#FAFCFE" }}>
      <Routes>
        {/* Setup profile for new users */}
        <Route
          path="setup-profile"
          element={
            isKnownProfile ? (
              <Navigate
                to={
                  isAdmin
                    ? "/publications-tracker/admin"
                    : "/publications-tracker/dashboard"
                }
                replace
              />
            ) : (
              <SetupProfilePage
                initialName={userName}
                initialEmail={userEmail}
                initialRole={role}
                onSave={handleSaveProfile}
              />
            )
          }
        />

        {/* Auth callback for Google OAuth redirect */}
        <Route
          path="auth-callback"
          element={
            <AuthCallback onLoginSuccess={handleSuccessfulLogin} token={token} />
          }
        />

        {/* Invalid domain error page */}
        <Route path="invalid-domain" element={<InvalidDomainPage />} />

        {/* Faculty routes */}
        <Route
          element={
            isKnownProfile ? (
              <FacultyRoute
                {...sharedLayoutProps}
                selectedEntryId={selectedEntryId}
                facultyProfile={facultyProfile}
              />
            ) : (
              <Navigate to="/publications-tracker/setup-profile" replace />
            )
          }
        >
          <Route
            path="dashboard"
            element={
              <DashboardListView
                search={search}
                setSearch={setSearch}
                filteredEntries={filteredEntries}
                selectEntry={selectEntry}
                statusClasses={statusClasses}
                statusLabels={statusLabels}
              />
            }
          />
          <Route
            path="dashboard/create"
            element={
              role === "admin" ? (
                <Navigate to="/publications-tracker/dashboard" replace />
              ) : (
                <CreateEntryView
                  entryDraft={entryDraft}
                  shortId={shortId}
                  nowStamp={nowStamp}
                  userEmail={userEmail}
                  emptyEntry={emptyEntry}
                  setEntries={setEntries}
                  setSelectedEntryId={setSelectedEntryId}
                  setEntryDraft={setEntryDraft}
                  addEntryNotification={addEntryNotification}
                  users={users}
                />
              )
            }
          />
          <Route
            path="dashboard/entries/:entryId/edit"
            element={
              role === "admin" ? (
                <Navigate to="/publications-tracker/dashboard" replace />
              ) : (
                <EditEntryView
                  selectedEntry={selectedEntry}
                  selectedEntryId={selectedEntryId}
                  userEmail={userEmail}
                  commitMessage={commitMessage}
                  shortId={shortId}
                  nowStamp={nowStamp}
                  entryDraft={entryDraft}
                  setEntries={setEntries}
                  setCommitMessage={setCommitMessage}
                  addEntryNotification={addEntryNotification}
                  setEntryDraft={setEntryDraft}
                  setSelectedEntryId={setSelectedEntryId}
                  users={users}
                />
              )
            }
          />
          <Route
            path="dashboard/entries/:entryId"
            element={
              <DashboardDetailView
                sidebarCollapsed={sidebarCollapsed}
                setSidebarCollapsed={setSidebarCollapsed}
                setSearch={setSearch}
                search={search}
                filteredEntries={filteredEntries}
                statusLabels={statusLabels}
                selectedEntry={selectedEntry}
                userEmail={userEmail}
                statusClasses={statusClasses}
                shortId={shortId}
                nowStamp={nowStamp}
                setEntries={setEntries}
                addEntryNotification={addEntryNotification}
                setSelectedVersion={setSelectedVersion}
                selectedVersion={selectedVersion}
                selectedEntryId={selectedEntryId}
                selectEntry={selectEntry}
                isAdmin={isAdmin}
                users={users}
              />
            }
          />
          <Route
            path="profile"
            element={
              <ProfilePage
                facultyProfile={facultyProfile}
                users={users}
                entries={filteredEntries}
                currentUserEmail={userEmail}
                isAdmin={role === "admin"}
              />
            }
          />
          <Route
            path="profile/edit"
            element={
              isKnownProfile ? (
                role === "admin" ? (
                  <Navigate to="/publications-tracker/profile" replace />
                ) : (
                  <SetupProfilePage
                    initialName={currentUserProfile?.name || userName}
                    initialEmail={currentUserProfile?.email || userEmail}
                    initialRole={currentUserProfile?.role || role}
                    initialDepartment={currentUserProfile?.department}
                    initialTitle={currentUserProfile?.title}
                    initialOffice={currentUserProfile?.office}
                    initialExpertise={currentUserProfile?.expertise?.join(", ")}
                    initialBio={currentUserProfile?.bio}
                    onSave={handleSaveProfile}
                    isEdit
                  />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Route>

        {/* Admin routes */}
        <Route
          element={
            isKnownProfile ? (
              <AdminRoute {...sharedLayoutProps} />
            ) : (
              <Navigate to="/publications-tracker/setup-profile" replace />
            )
          }
        >
          <Route
            path="admin"
            element={<AdminDashboard entries={filteredEntries} users={users} />}
          />
          <Route
            path="admin/review"
            element={
              <AdminReviewQueue
                entries={filteredEntries}
                setEntries={setEntries}
                userEmail={userEmail}
                addEntryNotification={addEntryNotification}
              />
            }
          />
          <Route
            path="admin/publications"
            element={<AdminPublications entries={filteredEntries} />}
          />
          <Route
            path="admin/entries/:entryId"
            element={
              <AdminEntryDetail
                entries={filteredEntries}
                setEntries={setEntries}
                userEmail={userEmail}
                addEntryNotification={addEntryNotification}
              />
            }
          />
          <Route
            path="admin/users"
            element={<AdminUserDirectory users={users} />}
          />
        </Route>

        {/* Default redirect */}
        <Route
          index
          element={
            <Navigate
              to={
                isAdmin
                  ? "/publications-tracker/admin"
                  : "/publications-tracker/dashboard"
              }
              replace
            />
          }
        />
        <Route
          path="*"
          element={
            <Navigate
              to={
                isAdmin
                  ? "/publications-tracker/admin"
                  : "/publications-tracker/dashboard"
              }
              replace
            />
          }
        />
      </Routes>
    </Box>
  );
}

// ─── Public export — wraps routes in context provider ─────────────────────────
function PublicationsApp() {
  return (
    <PublicationsProvider>
      <PublicationsRoutes />
    </PublicationsProvider>
  );
}

export default PublicationsApp;
