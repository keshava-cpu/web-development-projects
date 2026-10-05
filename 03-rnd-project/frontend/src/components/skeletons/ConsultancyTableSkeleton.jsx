import {
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

/**
 * Mirrors the consultancy records table with 5 skeleton rows.
 */
const ConsultancyTableSkeleton = () => (
  <TableContainer
    component={Paper}
    elevation={0}
    sx={{ border: '1px solid #E5E7EB' }}
  >
    <Table>
      <TableHead>
        <TableRow sx={{ bgcolor: '#F8FAFC' }}>
          {['Industry', 'Amount (₹)', 'Duration', 'Created', 'Actions'].map((h) => (
            <TableCell key={h} sx={{ fontWeight: 700 }}>
              <Skeleton variant="text" width={h === 'Actions' ? 60 : '80%'} height={20} />
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i} sx={{ '&:last-child td': { border: 0 } }}>
            <TableCell><Skeleton variant="text" width="70%" height={20} /></TableCell>
            <TableCell><Skeleton variant="text" width={90} height={20} /></TableCell>
            <TableCell><Skeleton variant="text" width={80} height={20} /></TableCell>
            <TableCell><Skeleton variant="text" width={90} height={20} /></TableCell>
            <TableCell align="right">
              <Skeleton variant="circular" width={28} height={28} sx={{ display: 'inline-block', mr: 0.5 }} />
              <Skeleton variant="circular" width={28} height={28} sx={{ display: 'inline-block' }} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export default ConsultancyTableSkeleton;
