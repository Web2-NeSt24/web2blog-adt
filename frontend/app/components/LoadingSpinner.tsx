import React from 'react';
import { Spinner } from 'react-bootstrap';

interface LoadingSpinnerProps {
  size?: 'sm' | undefined;
  text?: string;
  center?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size, 
  text = 'Loading...', 
  center = false 
}) => {
  const content = (
    <div className="d-flex align-items-center">
      <Spinner animation="border" size={size} className="me-2" />
      <span>{text}</span>
    </div>
  );

  if (center) {
    return (
      <div className="d-flex justify-content-center align-items-center p-4">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
