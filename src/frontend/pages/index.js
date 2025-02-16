import '../components/global';
import Layout from '../components/layout';

import { useEffect, useState } from 'react';
import { auth } from '../firebase/config';
import { useRouter } from 'next/router';

export default function LandingPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (auth.currentUser) {
      router.push('/dashboard');  // Redirect to dashboard if logged in
    } else {
      setLoading(false);  // Stop loading if not logged in
    }
  }, [router]);

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <Layout>
      <div className="landing-page">
        <div className="landing-container">
          <img src="/logo.png" alt="App Logo" className="logo" />
          <h1 className="app-title">Welcome to MedMentor</h1>
          <div className="action-buttons">
            <button
              onClick={() => router.push('/login')}
              className="btn"
            >
              Login
            </button>
            <button
              onClick={() => router.push('/signup')}
              className="btn"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
