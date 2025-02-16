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
  const [profileData, setProfileData] = useState({
    email: '',
    name: '',
    gender: 'Not Specified',
    chronic_disease: 'Diabetes',
    years_since_diagnosis: 0,
    diagnosis: [],
  });

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Fetch user profile data by email from your server
        try {
          const response = await fetch(`http://localhost:5000/patients/profile?email=${currentUser.email}`);
          const data = await response.json();

          if (response.ok) {
            setProfileData({
              email: currentUser.email,
              name: data.name,
              gender: data.gender,
              chronic_disease: data.chronic_disease,
              years_since_diagnosis: data.years_since_diagnosis,
              diagnosis: data.diagnosis || [],
            });

            setFieldsValue({
              email: currentUser.email,
              name: data.name,
              gender: data.gender,
              years_since_diagnosis: data.years_since_diagnosis,
            });
          } else {
            console.error('Error fetching profile:', data.error);
            setError(data.error);
          }
        } catch (error) {
          console.error('Error fetching profile data from server:', error);
          setError('Failed to load profile data.');
        }
      } else {
        setUser(null);
        setProfileData({
          email: '',
          name: '',
          gender: 'Not Specified',
          chronic_disease: 'Diabetes',
          years_since_diagnosis: 0,
          diagnosis: [],
        });
        setFieldsValue({
          email: '',
          name: '',
          gender: 'Not Specified',
          years_since_diagnosis: 0,
        });
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

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out: ', error);
      alert('An error occurred while signing out. Please try again.');
    }
  };

  const handleSave = async () => {
    try {
      const user = auth.currentUser;

      if (editableFields.email) {
        await updateEmail(user, fieldsValue.email);
      }

      setEditableFields({
        email: false,
      });

      setFieldsValue({
        email: user.email,
      });

      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile: ', error);
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
            <span>{fieldsValue.email}</span>
          </div>

          <div className="profile-info">
            <strong>Name: </strong>
            <div className="editable-field">
              {editableFields.name ? (
                <input
                  type="text"
                  value={fieldsValue.name}
                  className="input-field"
                  onChange={(e) => handleChange(e, 'name')}
                />
              ) : (
                <span>{fieldsValue.name}</span>
              )}
              <button className="edit-btn" onClick={() => handleEditClick('name')}>
                {editableFields.name ? 'Save' : 'Edit'}
              </button>
            </div>
          </div>

          <div className="profile-info">
            <strong>Gender: </strong>
            <div className="editable-field">
              {editableFields.gender ? (
                <input
                  type="text"
                  value={fieldsValue.gender}
                  className="input-field"
                  onChange={(e) => handleChange(e, 'gender')}
                />
              ) : (
                <span>{fieldsValue.gender}</span>
              )}
              <button className="edit-btn" onClick={() => handleEditClick('gender')}>
                {editableFields.gender ? 'Save' : 'Edit'}
              </button>
            </div>
          </div>

          <div className="profile-info">
            <strong>Years Since Diagnosis: </strong>
            <div className="editable-field">
              {editableFields.years_since_diagnosis ? (
                <input
                  type="number"
                  value={fieldsValue.years_since_diagnosis}
                  className="input-field"
                  onChange={(e) => handleChange(e, 'years_since_diagnosis')}
                />
              ) : (
                <span>{fieldsValue.years_since_diagnosis}</span>
              )}
              <button className="edit-btn" onClick={() => handleEditClick('years_since_diagnosis')}>
                {editableFields.years_since_diagnosis ? 'Save' : 'Edit'}
              </button>
            </div>
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

          <button className="logout-btn" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </div>
    </Layout>
  );
}
