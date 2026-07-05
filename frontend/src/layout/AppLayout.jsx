import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import TopNavbar from './TopNavbar';
import { colors } from '../theme/colors';

const AppLayout = () => (
  <Box sx={{ minHeight: '100vh', bgcolor: colors.softWhite }}>
    <TopNavbar />
    <Box
      component="main"
      sx={{
        bgcolor: colors.researchGray,
        minHeight: 'calc(100vh - 72px)',
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        <Outlet />
      </Container>
    </Box>
  </Box>
);

export default AppLayout;
