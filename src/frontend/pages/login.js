import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/layout';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send login request to the backend
      const response = await fetch('/api/patients/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Handle successful response
      if (response.ok) {
        const data = await response.json();
        router.push('/dashboard'); // Redirect to dashboard on successful login
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <Layout>
      <div className="landing-page">
        <div className="landing-container">
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtitle">Log in to access your account</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="input-field"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="input-field"
              required
            />
            <button type="submit" className="btn">
              Log In
            </button>
          </form>

          <p className="login-footer">
            Don't have an account? <a href="/signup" className="link">Sign up</a>
          </p>
        </div>
      </div>
    </Layout>
  );
}
