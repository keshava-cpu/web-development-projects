import Grid from '@mui/material/Grid';
import { Typography, Box, Stack } from '@mui/material';
import ProjectCard from './ProjectCard';
import { colors } from '../../theme/colors';

const ProjectSection = ({ title, projects, emptyMessage }) => (
  <Box sx={{ mb: 4 }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
      <Typography variant="h6" sx={{ color: colors.midnightBlue }}>
        {title}
      </Typography>
      <Typography variant="body2">{projects.length} project(s)</Typography>
    </Stack>

    {projects.length === 0 ? (
      <Box
        sx={{
          p: 4,
          borderRadius: 2,
          border: `1px dashed ${colors.lightSteel}`,
          bgcolor: colors.white,
          textAlign: 'center',
        }}
      >
        <Typography variant="body2">{emptyMessage}</Typography>
      </Box>
    ) : (
      <Grid container spacing={2.5}>
        {projects.map((project) => (
          <Grid key={project.project_id} size={{ xs: 12, sm: 6, lg: 4 }}>
            <ProjectCard project={project} />
          </Grid>
        ))}
      </Grid>
    )}
  </Box>
);

const ProjectsGrid = ({ groupedProjects }) => (
  <Box>
    <ProjectSection
      title="Active Projects"
      projects={groupedProjects.active}
      emptyMessage="No active funded projects yet."
    />
    <ProjectSection
      title="Pending Projects"
      projects={groupedProjects.pending}
      emptyMessage="No pending project submissions."
    />
    <ProjectSection
      title="Completed Projects"
      projects={groupedProjects.completed}
      emptyMessage="No completed or approved projects recorded."
    />
    {groupedProjects.rejected.length > 0 && (
      <ProjectSection
        title="Rejected Projects"
        projects={groupedProjects.rejected}
        emptyMessage="No rejected projects."
      />
    )}
  </Box>
);

export default ProjectsGrid;

