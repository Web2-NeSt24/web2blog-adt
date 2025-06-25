import React, { useEffect } from "react";
import AuthTabs from "../components/Login";
import { useAuth } from "../context/AuthContext";

const AuthPage: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && isAuthenticated) {
      window.location.href = '/';
    }
  }, [isAuthenticated, loading]);

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Don't render auth tabs if user is authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <div className="w-100" style={{ maxWidth: 420 }}>
        <AuthTabs />
      </div>
    </div>
  );
};

export default AuthPage;
