import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
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
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard'); // Redirect to dashboard after login
    } catch (err) {
      setError('Invalid email or password. Please try again.');
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
