import { NavLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

const navItems = [
  { label: 'Dashboard', path: '/' },
  { label: 'Funded Projects', path: '/projects' },
  { label: 'Publications Tracker', path: '/publications-tracker/dashboard' },
  { label: 'Patents', path: '/patents' },
  { label: 'Consultancy', path: '/consultancy' },
  { label: 'Reports', path: '/reports' },
];

const TopNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    logout();
    setAnchorEl(null);
    navigate('/login');
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: colors.midnightBlue,
        borderBottom: `2px solid ${colors.innovationCyan}`,
      }}
    >
      <Toolbar sx={{ gap: 2, minHeight: 72 }}>
        <ScienceOutlinedIcon sx={{ color: colors.innovationCyan, fontSize: 28 }} />
        <Typography variant="h6" sx={{ color: colors.white, fontWeight: 700, mr: 2 }}>
          R&D Management
        </Typography>

        <Box sx={{ display: 'flex', gap: 0.5, flex: 1 }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              component={NavLink}
              to={item.path}
              end={item.path === '/'}
              sx={{
                color: colors.white,
                px: 2,
                py: 1,
                borderRadius: 1,
                position: 'relative',
                '&.active::after': {
                  content: '""',
                  position: 'absolute',
                  left: 12,
                  right: 12,
                  bottom: 4,
                  height: 3,
                  borderRadius: 2,
                  bgcolor: colors.innovationCyan,
                },
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        <IconButton onClick={(event) => setAnchorEl(event.currentTarget)} sx={{ p: 0 }}>
          <Avatar
            sx={{
              bgcolor: colors.innovationCyan,
              color: colors.midnightBlue,
              width: 40,
              height: 40,
              fontWeight: 700,
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Box sx={{ px: 2, py: 1.5, minWidth: 220 }}>
            <Typography variant="subtitle2" sx={{ color: colors.graphite, fontWeight: 700 }}>
              {user?.name || 'Research User'}
            </Typography>
            <Typography variant="body2">{user?.email}</Typography>
            <Typography variant="caption" sx={{ color: colors.coolGray }}>
              Role: {user?.role || 'Faculty'}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <LogoutOutlinedIcon fontSize="small" sx={{ mr: 1.5 }} />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopNavbar;
