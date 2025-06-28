import { Alert } from 'react-bootstrap';

interface ErrorAlertProps {
  error: string | Error;
  onDismiss?: () => void;
  className?: string;
}

export default function ErrorAlert({ error, onDismiss, className = '' }: ErrorAlertProps) {
  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <Alert 
      variant="danger" 
      dismissible={!!onDismiss}
      onClose={onDismiss}
      className={className}
    >
      <Alert.Heading>
        <i className="bi bi-exclamation-triangle me-2"></i>
        Error
      </Alert.Heading>
      <p className="mb-0">{errorMessage}</p>
    </Alert>
  );
}