import React from 'react';
import { ActivityIndicator } from 'react-native';

const LoadingSpinner: React.FC = () => {
  return (
    <ActivityIndicator size="small" color="#2563eb" />
  );
};

export default LoadingSpinner;
