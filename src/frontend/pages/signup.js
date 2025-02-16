import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/layout';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState('');
  const [chronicDisease, setChronicDisease] = useState('');
  const [yearsSinceDiagnosed, setYearsSinceDiagnosed] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare data to send to the backend
      const userData = {
        name: name,                          // Full name of the patient
        email: email,                        // Patient's email
        password: password,                  // Plain-text password
        dob: dob,                             // Date of birth in "YYYY-MM-DD" format
        chronic_disease: chronicDisease,         // Chronic disease (only "Diabetes" allowed)
        years_since_diagnosed: yearsSinceDiagnosed || 0,  // Default to 0 if not provided
        gender: gender || 'Not Specified',   // Default gender if not provided
        diabetes_type: diabetesType || 'Not Provided', // Default diabetes type if not provided
      };

      // Send POST request to the backend
      const response = await fetch('http://localhost:5000/patients/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to sign up.');
      }

      // On success, redirect to the profile input page
      localStorage.setItem('email', email);
      localStorage.setItem('chronicDisease', chronicDisease);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="input-field"
              required
            />
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

            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              placeholder="Date of Birth"
              className="input-field"
              required
            />

            {/* Dropdown for Chronic Disease (Diabetes Type) */}
            <select
              id="chronicDisease"
              value={chronicDisease}
              onChange={(e) => setChronicDisease(e.target.value)}
              className="input-field"
              required
            >
              <option value="">Select Chronic Disease</option>
              <option value="Diabetes">Diabetes</option>
              <option value="Other">Other</option>
            </select>

            <input
              type="number"
              value={yearsSinceDiagnosed}
              onChange={(e) => setYearsSinceDiagnosed(e.target.value)}
              placeholder="Years Since Diagnosed"
              className="input-field"
              required
            />

            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Signing Up...' : 'Sign Up'}
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
