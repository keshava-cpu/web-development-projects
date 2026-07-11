import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={location.state?.from?.pathname || '/projects'} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate(location.state?.from?.pathname || '/projects', { replace: true });
    } catch (err) {
      console.error('Login request failed:', err);
      // Show exactly what the API returned, no fallback error object message.
      const message =
        err.response?.data?.message ||
        err.response?.data?.data?.message ||
        'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        bgcolor: colors.researchGray,
        p: 2,
      }}
    >
      <Paper
        sx={{
          width: '100%',
          maxWidth: 440,
          p: 4,
          border: `1px solid ${colors.lightSteel}`,
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography variant="h5" gutterBottom>
              R&amp;D Management Login
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to manage funded projects and research records.
            </Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          {/* Email / Password form */}
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                id="login-email"
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                fullWidth
              />
              <TextField
                id="login-password"
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                fullWidth
              />

              <Button
                id="login-submit-btn"
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                fullWidth
                sx={{
                  bgcolor: colors.academicBlue,
                  color: colors.white,
                  fontWeight: 600,
                  '&:hover': { bgcolor: colors.midnightBlue },
                }}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default LoginPage;
