import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    xs: 'h-4 w-4',
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div 
        className={`animate-spin rounded-full border-t-2 border-b-2 border-indigo-600 ${sizes[size] || sizes.md}`}
        style={{
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent'
        }}
      ></div>
    </div>
  );
};

export default LoadingSpinner;
