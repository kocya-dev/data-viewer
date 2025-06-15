import { Box, CircularProgress, Typography, Skeleton } from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
  variant?: 'spinner' | 'skeleton';
  height?: number;
}

function LoadingSpinner({ message = 'データを読み込み中...', size = 40, variant = 'spinner', height = 400 }: LoadingSpinnerProps) {
  if (variant === 'skeleton') {
    return (
      <Box sx={{ height, p: 2 }}>
        <Skeleton variant="text" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={height - 100} />
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      py={4}
      sx={{ minHeight: height }}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <CircularProgress size={size} />
      <Typography variant="body1" sx={{ mt: 2 }} color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}

export { LoadingSpinner };
