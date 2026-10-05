import { Paper, Typography } from '@mui/material';
import { colors } from '../theme/colors';

const PlaceholderPage = ({ title, description }) => (
  <Paper sx={{ p: 4, bgcolor: colors.white, border: `1px solid ${colors.lightSteel}` }}>
    <Typography variant="h5" gutterBottom>
      {title}
    </Typography>
    <Typography variant="body1">{description}</Typography>
  </Paper>
);

export default PlaceholderPage;
