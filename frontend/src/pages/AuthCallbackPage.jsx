import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/AuthCallback.css';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = React.useState(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    
    if (error) {
      setError(`Discord auth error: ${error}`);
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    if (!code) {
      setError('No authorization code received');
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    const authenticate = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        
        const response = await axios.get(
          `${backendUrl}/api/auth/discord/callback?code=${code}`
        );

        if (response.data.success) {
          // Store user data
          localStorage.setItem('user', JSON.stringify(response.data.user));
          localStorage.setItem('token', response.data.accessToken);
          localStorage.setItem('guilds', JSON.stringify(response.data.guilds));

          // Redirect to dashboard
          navigate('/dashboard');
        } else {
          setError(response.data.error || 'Authentication failed');
        }
      } catch (error) {
        console.error('Auth error:', error);
        setError(error.response?.data?.error || 'Authentication failed. Please try again.');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    authenticate();
  }, [navigate, searchParams]);

  return (
    <div className="auth-callback-container">
      <div className="auth-callback-card">
        {error ? (
          <div className="error-state">
            <h2>❌ Authentication Error</h2>
            <p>{error}</p>
            <p className="redirect-info">Redirecting to login...</p>
          </div>
        ) : (
          <div className="loading-state">
            <div className="spinner"></div>
            <h2>🔄 Authenticating...</h2>
            <p>Please wait while we set up your account</p>
          </div>
        )}
      </div>
    </div>
  );
}