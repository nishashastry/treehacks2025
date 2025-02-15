import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useRouter } from 'next/router';
import Layout from '../components/layout';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/dashboard'); // Redirect to dashboard after signup
    } catch (err) {
      setError('Failed to sign up. Please check your credentials.');
    }
  };

  return (
    <Layout>
      <div className="landing-page">
        <div className="landing-container">
          <h2 className="login-title">Create Your Account</h2>
          <p className="login-subtitle">Join us and get started!</p>

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
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="input-field"
              required
            />
            <button type="submit" className="btn">
              Sign Up
            </button>
          </form>

          <p className="login-footer">
            Already have an account? <a href="/login" className="link">Log in</a>
          </p>
        </div>
      </div>
    </Layout>
  );
}
