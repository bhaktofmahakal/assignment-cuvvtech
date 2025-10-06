import React from 'react';
import { CircularProgress, Box } from '@mui/material';

interface LoadingSpinnerProps {
  size?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 40 }) => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" p={2}>
      <CircularProgress size={size} />
    </Box>
  );
};

export default LoadingSpinner;