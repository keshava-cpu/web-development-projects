import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  // CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import ProjectsGrid from "../components/projects/ProjectsGrid";
import AddProjectDialog from "../components/projects/AddProjectDialog";
import { useProjects } from "../hooks/useProjects";
import { groupProjectsByStatus } from "../utils/projectHelpers";
import { colors } from "../theme/colors";
import ProjectCardSkeleton from "../components/skeletons/ProjectCardSkeleton";

const ProjectsDashboardPage = () => {
  const {
    projects,
    loading,
    submitting,
    error,
    loadProjects,
    addProject,
    editProject,
  } = useProjects();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  const handleOpenEdit = (project) => {
    setSelectedProject(project);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedProject(null);
  };
  const groupedProjects = groupProjectsByStatus(projects);

  const handleProjectSubmit = async (formValues) => {
    if (selectedProject) {
      // Edit mode: Pass the ID and the updated form values
      const projectId = selectedProject.project_id || selectedProject.id;
      await editProject(projectId, formValues);
      setSuccessMessage("Funded project updated successfully.");
    } else {
      // Add mode: Just create a new project
      await addProject(formValues);
      setSuccessMessage("Funded project created successfully.");
    }
  };

  return (
    <Stack spacing={3}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          bgcolor: colors.white,
          border: `1px solid ${colors.lightSteel}`,
          background: `linear-gradient(135deg, ${colors.midnightBlue} 0%, ${colors.academicBlue} 100%)`,
          color: colors.white,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          spacing={2}
          sx={{ alignItems: { xs: "flex-start", md: "center" } }}
        >
          <Box>
            <Typography variant="h4" sx={{ color: colors.white, mb: 0.5 }}>
              Projects Dashboard
            </Typography>
            <Typography variant="body1" sx={{ color: colors.lightSteel }}>
              Track active, pending, and completed funded research projects.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<RefreshOutlinedIcon />}
              onClick={loadProjects}
              sx={{
                color: colors.white,
                borderColor: colors.lightSteel,
                "&:hover": {
                  borderColor: colors.white,
                  bgcolor: "rgba(255,255,255,0.08)",
                },
              }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
              sx={{
                bgcolor: colors.innovationCyan,
                color: colors.midnightBlue,
                "&:hover": { bgcolor: "#33b8d4" },
              }}
            >
              Add New Funded Project
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {successMessage && (
        <Alert severity="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {error && !dialogOpen && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <ProjectCardSkeleton />
      ) : (
        <ProjectsGrid
          groupedProjects={groupedProjects}
          onEdit={handleOpenEdit}
        />
      )}

      <AddProjectDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={handleProjectSubmit}
        submitting={submitting}
        error={error}
        project={selectedProject}
      />
    </Stack>
  );
};

export default ProjectsDashboardPage;
