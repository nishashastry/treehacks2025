import { useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/router';
import Layout from '../components/layout';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [diagnosis, setDiagnosis] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDiagnosis, setNewDiagnosis] = useState({ name: '', date: '', details: '' });
  const [error, setError] = useState('');
  const [editableFields, setEditableFields] = useState({
    email: false,
  });
  const [fieldsValue, setFieldsValue] = useState({
    email: '',
  });

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        console.log('Auth state changed. User:', currentUser.uid);
        setUser(currentUser);
  
        // Fetch user data
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          console.log('User document:', userDoc.data());
          setDiagnosis(userDoc.data().diagnosis || []);
          setFieldsValue({ email: currentUser.email });
        } else {
          console.log('No user document found in Firestore');
        }
      } else {
        console.log('User is logged out.');
        setUser(null);
        setDiagnosis([]);
        setFieldsValue({ email: '' });
        router.push('/');
      }
    });
  
    return () => unsubscribe();
  }, []);
  


  const handleEditClick = (field) => {
    setEditableFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (e, field) => {
    setFieldsValue((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      const user = auth.currentUser; // Get the current user

      if (editableFields.email) {
        // Update email in Firebase if the email field is being edited
        await updateEmail(user, fieldsValue.email);
      }

      setEditableFields({
        email: false,
      });

      setFieldsValue({
        email: user.email, // Firebase automatically updates the email in the user object
      });

      // You can display a success message or notify the user
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile: ', error);
      // Handle any errors that occur during the update process
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleAddDiagnosisClick = () => {
    setDiagnosis({ name: '', date: '', details: '' });
    setIsModalOpen(true);
  };

  const handleModalClose = async () => {
    setIsModalOpen(false);
    setNewDiagnosis({ name: '', date: '', details: '' });
    setError('');

    // Reload diagnoses from Firestore
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setDiagnosis(userDoc.data().diagnosis || []);
        }
      }
    } catch (error) {
      console.error('Error reloading diagnoses:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setDiagnosis({ ...diagnosis, [field]: value });
  };

  const handleAddDiagnosis = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');
  
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
  
      if (!userDoc.exists()) {
        console.log('User document does not exist. Creating one...');
        await setDoc(userRef, { diagnosis: [], updatedAt: new Date() });
      }
  
      console.log('Adding new diagnosis:', newDiagnosis);
  
      await updateDoc(userRef, {
        diagnosis: arrayUnion(newDiagnosis),
        updatedAt: new Date(),
      });
  
      console.log('Diagnosis added successfully.');
  
      // Fetch updated diagnosis list
      const updatedUserDoc = await getDoc(userRef);
      setDiagnosis(updatedUserDoc.data().diagnosis || []);
    } catch (error) {
      console.error('Error saving diagnosis:', error);
      setError('Failed to save diagnosis. ' + error.message);
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');
  
      const userRef = doc(db, 'users', user.uid);
  
      await setDoc(userRef, { diagnosis }, { merge: true });
  
      console.log('All diagnoses saved:', diagnosis);
  
      // Refresh diagnosis list
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setDiagnosis(userDoc.data().diagnosis || []);
      }
  
      handleModalClose();
    } catch (error) {
      setError('Failed to save diagnoses. ' + error.message);
    }
  };
  

  return (
    <Layout>
      <div className="settings-page">
        <div className="settings-container">
          <h2 className="settings-title">Profile Settings</h2>
          <div className="profile-info">
            <strong>Email: </strong>
            {editableFields.email ? (
                <input
                  type="email"
                  value={fieldsValue.email}
                  className="input-field"
                  onChange={(e) => handleChange(e, 'email')}
                />
              ) : (
                <span>{fieldsValue.email}</span>
              )}
              <button
                className="edit-btn"
                onClick={() => handleEditClick('email')}
              >
                {editableFields.email ? 'Save' : 'Edit'}
              </button>
            </div>

          <div className="diagnosis-info">
            <h3>Diagnoses</h3>
            {diagnosis.length > 0 ? (
              diagnosis.map((diagnosis, index) => (
                <div key={index} className="diagnosis-item">
                  <strong>Diagnosis:</strong> {diagnosis.name}
                  <br />
                  <strong>Date:</strong> {diagnosis.date}
                  <br />
                  <strong>Details:</strong> {diagnosis.details}
                </div>
              ))
            ) : (
              <p>No diagnoses available</p>
            )}
            <button className="btn" onClick={handleAddDiagnosisClick}>
              Add Diagnosis
            </button>
          </div>

          {/* Modal for adding new diagnosis */}
          {isModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                {error && <div className="error-box">{error}</div>}
                <form onSubmit={(e) => e.preventDefault()} className="form">
                  <div className="diagnosis-box">
                    <h2 className="section-title">Add New Diagnosis</h2>

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
          )}

          <button className="logout-btn" onClick={() => auth.signOut()}>
            Log Out
          </button>
        </div>
      </div>
    </Layout>
  );
}
