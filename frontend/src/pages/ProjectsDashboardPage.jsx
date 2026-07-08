import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import ProjectsGrid from '../components/projects/ProjectsGrid';
import AddProjectDialog from '../components/projects/AddProjectDialog';
import { useProjects } from '../hooks/useProjects';
import { groupProjectsByStatus } from '../utils/projectHelpers';
import { colors } from '../theme/colors';

const ProjectsDashboardPage = () => {
  const { projects, loading, submitting, error, loadProjects, addProject } = useProjects();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const groupedProjects = groupProjectsByStatus(projects);

  const handleCreateProject = async (formValues) => {
    await addProject(formValues);
    setSuccessMessage('Funded project created successfully.');
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
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={2}
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
                '&:hover': { borderColor: colors.white, bgcolor: 'rgba(255,255,255,0.08)' },
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
                '&:hover': { bgcolor: '#33b8d4' },
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

      {error && !dialogOpen && (
        <Alert severity="error">{error}</Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: colors.academicBlue }} />
        </Box>
      ) : (
        <ProjectsGrid groupedProjects={groupedProjects} />
      )}

      <AddProjectDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleCreateProject}
        submitting={submitting}
        error={error}
      />
    </Stack>
  );
};

export default ProjectsDashboardPage;
