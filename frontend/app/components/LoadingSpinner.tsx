import { Spinner } from 'react-bootstrap';

interface LoadingSpinnerProps {
  size?: 'sm' | undefined;
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size, 
  text = 'Loading...', 
  className = '' 
}: LoadingSpinnerProps) {
  return (
    <div className={`d-flex flex-column align-items-center justify-content-center py-5 ${className}`}>
      <Spinner animation="border" variant="primary" size={size} />
      {text && <p className="mt-3 text-muted mb-0">{text}</p>}
    </div>
  );
}