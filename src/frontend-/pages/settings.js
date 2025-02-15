import { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import Layout from '../components/layout';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [editableFields, setEditableFields] = useState({
    email: false,
    uid: false,
  });
  const [fieldsValue, setFieldsValue] = useState({
    email: '',
    uid: '',
  });

  // Check if a user is logged in and get the user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setFieldsValue({
          email: currentUser.email,
          uid: currentUser.uid,
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

  const handleSave = async () => {
    try {
      const user = auth.currentUser; // Get the current user

      if (editableFields.email) {
        // Update email in Firebase if the email field is being edited
        await updateEmail(user, fieldsValue.email);
      }

      if (editableFields.uid) {
        // Update UID in Firebase if the UID field is being edited
        // UID cannot be changed in Firebase, so this part might not be applicable.
        // You may choose to handle this in another way or leave it out.
        console.log('UID cannot be changed in Firebase');
      }

      // After updating the profile, update the local state
      setEditableFields({
        email: false,
        uid: false,
      });

      // Optionally, update the user object in state after changes
      setFieldsValue({
        email: user.email, // Firebase automatically updates the email in the user object
        uid: user.uid, // UID is immutable, so no change is needed here
      });

      // You can display a success message or notify the user
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile: ', error);
      // Handle any errors that occur during the update process
      alert('Failed to update profile. Please try again.');
    }
  };


  if (!user) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <Layout>
      <div className="settings-page">
        <div className="settings-container">
          <h2 className="settings-title">Profile Settings</h2>
          <div className="profile-info">
            <div className="profile-item">
              <strong>Email:</strong>
              {editableFields.email ? (
                <input
                  type="email"
                  value={fieldsValue.email}
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

            <div className="profile-item">
              <strong>UID:</strong>
              {editableFields.uid ? (
                <input
                  type="text"
                  value={fieldsValue.uid}
                  onChange={(e) => handleChange(e, 'uid')}
                />
              ) : (
                <span>{fieldsValue.uid}</span>
              )}
              <button
                className="edit-btn"
                onClick={() => handleEditClick('uid')}
              >
                {editableFields.uid ? 'Save' : 'Edit'}
              </button>
            </div>

            {/* Add any other profile information here */}

          </div>
          <button className="logout-btn" onClick={() => auth.signOut()}>
            Log Out
          </button>
        </div>
      </div>
    </Layout>
  );
}
