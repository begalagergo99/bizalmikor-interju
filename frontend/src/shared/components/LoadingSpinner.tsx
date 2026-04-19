import { Box, CircularProgress } from '@mui/material';

interface LoadingSpinnerProps {
  minHeight?: number | string;
}

export function LoadingSpinner({ minHeight = 300 }: LoadingSpinnerProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
      }}
    >
      <CircularProgress />
    </Box>
  );
}
