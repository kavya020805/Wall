import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, appleProvider } from '../firebase';
import googleLogo from '../icons8-google-logo-48.png';
import appleLogo from '../icons8-apple-logo-30.png';
import './Login.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderLogin = async (provider) => {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      onLogin();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Global Scribble Board</h1>
        <p>Draw together in real-time with people around the world</p>

        <div className="oauth-buttons">
          <button
            type="button"
            className="oauth-button google"
            onClick={() => handleProviderLogin(googleProvider)}
            disabled={loading}
          >
            <span className="icon" aria-hidden="true">
              <img className="icon-img" src={googleLogo} alt="Google" />
            </span>
            <span className="label">Continue with Google</span>
          </button>
          <button
            type="button"
            className="oauth-button apple"
            onClick={() => handleProviderLogin(appleProvider)}
            disabled={loading}
          >
            <span className="icon" aria-hidden="true">
              <img className="icon-img" src={appleLogo} alt="Apple" />
            </span>
            <span className="label">Continue with Apple</span>
          </button>
        </div>

        <div className="divider">
          <span className="line"></span>
          <span className="text">or continue with email</span>
          <span className="line"></span>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" disabled={loading} className="login-button">
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>
        
        <button 
          className="toggle-button"
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
        </button>
      </div>
    </div>
  );
};

export default Login;
