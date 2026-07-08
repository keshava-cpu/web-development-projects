import { Chip } from '@mui/material';
import { statusColors } from '../../theme/colors';
import { getStatusColorKey } from '../../utils/projectHelpers';

const StatusTag = ({ status }) => {
  const colorKey = getStatusColorKey(status);
  const color = statusColors[colorKey] || statusColors.pending;

  return (
    <Chip
      label={status}
      size="small"
      sx={{
        bgcolor: `${color}18`,
        color,
        border: `1px solid ${color}55`,
        fontWeight: 600,
        textTransform: 'capitalize',
      }}
    />
  );
};

export default StatusTag;
