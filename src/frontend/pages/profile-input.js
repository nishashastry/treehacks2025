import { useState } from 'react';
import { auth, db } from '../firebase/config';
import { doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useRouter } from 'next/router';
import Layout from '../components/layout';

export default function ProfileInput() {
  const [diagnosis, setDiagnosis] = useState({ name: '', date: '', details: '' });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleInputChange = (field, value) => {
    setDiagnosis({ ...diagnosis, [field]: value });
  };

  const handleAddDiagnosis = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');

      const userRef = doc(db, 'users', user.uid);

      await updateDoc(userRef, {
        diagnoses: arrayUnion(diagnosis),
        updatedAt: new Date(),
      });

      // Reset form for a new entry
      setDiagnosis({ name: '', date: '', details: '' });
    } catch (error) {
      setError('Failed to save diagnosis. ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');

      await setDoc(
        doc(db, 'users', user.uid),
        { diagnosis, updatedAt: new Date() },
        { merge: true }
      );

      router.push('/dashboard');
    } catch (error) {
      setError('Failed to save diagnoses. ' + error.message);
    }
  };

  return (
    <Layout>
      <div className="landing-page">
        <div className="landing-container">
          <h2 className="login-title">Enter Your Clinical Information</h2>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={(e) => e.preventDefault()} className="form">
            <div className="diagnosis-box">
              <h2 className="section-title">New Diagnosis</h2>

              <label className="input-label">Diagnosis Name</label>
              <input
                type="text"
                value={diagnosis.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="input-field"
                required
              />

              <label className="input-label">Diagnosis Date</label>
              <input
                type="date"
                value={diagnosis.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="input-field"
                required
              />

              <label className="input-label">Additional Details</label>
              <textarea
                value={diagnosis.details}
                onChange={(e) => handleInputChange('details', e.target.value)}
                rows={3}
                className="input-field"
              />
            </div>

            <div className="button-group">
              <button
                type="button"
                onClick={(e) => handleAddDiagnosis(e)}
                className="secondary-button"
              >
                Add Another Diagnosis
              </button>

              <button
                type="button"
                onClick={(e) => handleSubmit(e)}
                className="primary-button"
              >
                Save and Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
