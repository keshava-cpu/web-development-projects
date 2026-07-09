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
      // Handle both axios error response shapes and plain Error objects
      const message =
        err.response?.data?.message ||
        err.response?.data?.data?.message ||
        err.message ||
        'Login failed. Check your credentials.';
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
        component="form"
        onSubmit={handleSubmit}
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
              R&D Management Login
            </Typography>
            <Typography variant="body2">
              Sign in to manage funded projects and research records.
            </Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            fullWidth
          />

          <Button type="submit" variant="contained" size="large" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default LoginPage;
