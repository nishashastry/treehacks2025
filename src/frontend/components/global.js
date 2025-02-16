import css from 'styled-jsx/css';

export default css.global`
  body {
    margin: 0;
    padding: 0;
    font-size: 18px;
    font-weight: 400;
    line-height: 1.8;
    color: #333;
    font-family: 'Inter', sans-serif;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  h1 {
    font-weight: 700;
    align-items: center;
  }

  p {
    margin-bottom: 10px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 30px;
    background: #0056b3;
    color: white;
    height: 40px;
  }

  .title {
    font-size: 24px;
    font-weight: bold;
    text-align: left;
  }

  .nav {
    display: flex;
    height: 100%;
    justify-content: center;
    align-items: center;
  }

  .nav-button {
    background: white;
    border: none;
    border-radius: 25px;
    font-size: 16px;
    cursor: pointer;
    transition: 0.3s;
  }

  .nav-button:hover {
    background: #e0e0e0;
  }

  .page-title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 20px;
  }

  .chat-page, .dashboard-page, .conversations-page, .settings-page {
    display: flex;
    flex-direction: column;
    min-height: 90vh;
    font-family: 'Inter', sans-serif;
    overflow: hidden;
  }

  .chat-container, .dashboard-container, .conversations-container, .settings-container {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    padding: 20px;
    width: 100%;
    overflow: hidden;
  }

  .messages {
    flex-grow: 1;
    overflow-y: auto;
    padding-bottom: 20px;
  }

  .message {
    max-width: fit-content;
    padding: 12px;
    border-radius: 20px;
    margin: 8px 40px;
    font-size: 16px;
    word-wrap: break-word;
    display: flex;
  }

  .user {
    background-color: #0056b3;
    color: white;
    align-self: flex-end;
    text-align: right;
    margin-left: auto;
    margin-right: 50px;
  }

  .bot {
    background-color: #f1f1f1;
    align-self: flex-start;
    text-align: left;
    margin-right: auto;
    margin-left: 50px;
  }

  .dashboard-content {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
  }

  .dashboard-box {
    background: #f9f9f9;
    padding: 20px;
    border-radius: 15px;
    width: 48%;
    min-height: 150px;
  }

  .section-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
    align-items: center;
  }

  .input-container {
    display: flex;
    align-items: center;
    padding: 15px;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 25px;
    margin: 10px 40px;
  }

  .input {
    flex-grow: 1;
    padding: 12px;
    border-radius: 25px;
    border: 1px solid #ccc;
    font-size: 16px;
  }

  .send-btn, .record-btn, .nav-button {
    background-color: #0056b3;
    color: white;
    border-radius: 25px;
    padding: 12px 24px;
    font-size: 16px;
    border: none;
    margin-left: 10px;
    transition: background-color 0.3s ease;
    cursor: pointer;
  }

  .send-btn:hover, .record-btn.stop, .record-btn:hover {
    opacity: 0.9;
  }

  .conversations-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 20px; /* Adds spacing between the navbar and recording button */
  }

  .record-btn {
    background: #0056b3;
    color: white;
    border: none;
    padding: 12px 24px;
    font-size: 16px;
    border-radius: 25px;
    text-align: center;
    cursor: pointer;
    margin-bottom: 20px; /* Adds spacing between the button and transcript/questions */
  }

  .record-btn.stop {
    background: #d9534f;
  }

  .content-container {
    display: flex;
    gap: 20px;
    justify-content: center;
    width: 80%; /* Centers and limits max width */
  }

  .messages, .suggested-questions {
    flex: 1;
    background: #f9f9f9;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    min-height: 200px;
  }

  .suggested-questions {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .question-box {
    background: white;
    padding: 10px;
    border-radius: 8px;
    margin-bottom: 10px;
    width: 100%;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  .landing-page {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f5f5f5;
  }

  .landing-container {
    text-align: center;
    background: white;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }

  .logo {
    width: 150px;
    margin-bottom: 20px;
  }

  .app-title {
    font-size: 32px;
    font-weight: bold;
    color: #333;
    margin-bottom: 20px;
  }

  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .btn {
    padding: 12px 24px;
    border-radius: 25px;
    font-size: 16px;
    color: white;
    cursor: pointer;
    width: 100%;
    text-align: center;
    background-color: #0056b3;
    border: none;
  }

  .btn:hover {
    opacity: 0.9;
  }

  .loading-screen {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    font-size: 24px;
    font-weight: 500;
    color: #333;
  }

  .form-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 90vh;
    background-color: #f5f5f5;
  }

  .form-card {
    background-color: white;
    padding: 40px;
    width: 100%;
    max-width: 400px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }

  .form-title {
    font-size: 28px;
    font-weight: 700;
    color: #333;
    margin-bottom: 30px;
    text-align: center;
  }

  .input-field {
    width: 100%;
    padding: 12px;
    margin-bottom: 15px;
    border-radius: 8px;
    border: 1px solid #ccc;
    font-size: 16px;
  }

  .btn-submit {
    width: 100%;
    padding: 12px;
    border-radius: 25px;
    font-size: 16px;
    background-color: #0056b3;
    color: white;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .btn-submit:hover {
    background-color: #00408f;
  }

  .link-container {
    display: flex;
    justify-content: center;
    margin-top: 15px;
  }

  .form-link {
    color: #0056b3;
    text-decoration: none;
    font-size: 14px;
  }

  .form-link:hover {
    text-decoration: underline;
  }

  .settings-page {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: auto; /* Shortened height to avoid scrolling */
  }

  .settings-container {
    background: white;
    padding: 40px;
    border-radius: 12px;
    // box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 600px;
  }

  .settings-title {
    font-size: 24px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 20px;
  }

  .profile-info {
    margin-bottom: 20px;
  }

  .profile-item {
    font-size: 18px;
    margin-bottom: 12px;
  }

  .logout-btn {
    width: 100%;
    padding: 12px;
    margin-top: 10px;
    background-color: #d9534f;
    color: white;
    border: none;
    border-radius: 25px; /* consistent roundness */
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .logout-btn:hover {
    background-color: #c9302c;
  }

  .conversations-page {
    display: flex;
    flex-direction: column;
    padding: 20px;
    overflow-y: auto;
  }

  .transcript-container {
    display: flex;
    gap: 20px;
    flex-direction: column;
    margin-top: 20px;
  }

  .live-transcript, .suggested-questions {
    flex: 1;
    padding: 20px;
    background: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    min-height: 220px;
  }

  .start-recording-btn {
    background: #0056b3;
    color: white;
    border: none;
    padding: 12px 24px;
    font-size: 16px;
    border-radius: 25px; /* consistent roundness */
    text-align: center;
    cursor: pointer;
    margin: 0 auto;
    width: fit-content;
    display: block;
    margin-top: 20px;
  }

  .profile-item {
  font-size: 18px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-item strong {
  font-weight: bold;
}

/* Styles for the edit button next to profile fields */
.edit-btn {
  background: #0056b3;
  color: white;
  border: none;
  border-radius: 25px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-left: 20px;
}

.edit-btn:hover {
  background-color: #00408f;
}

.input-edit {
  width: 100%;
  padding: 8px 12px;
  font-size: 16px;
  border-radius: 8px;
  border: 1px solid #ccc;
  margin-top: 5px;
  margin-bottom: 10px;
}

.input-edit:focus {
  border-color: #0056b3;
  outline: none;
}

.save-btn, .cancel-btn {
  background-color: #0056b3;
  color: white;
  padding: 10px 20px;
  border-radius: 25px; /* consistent roundness */
  font-size: 14px;
  border: none;
  margin-right: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.save-btn:hover, .cancel-btn:hover {
  background-color: #00408f;
}

.profile-info {
  margin-bottom: 20px;
}

  .form-container {
  max-width: 700px;
  margin: 40px auto;
  padding: 20px;
}

.title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 20px;
}

.error-box {
  background: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 15px;
  text-align: center;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.diagnosis-box {
  background: #f9f9f9;
  padding: 25px;
  padding-right: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 10px;
}

.input-label {
  font-size: 14px;
  font-weight: 500;
  margin-top: 10px;
  display: block;
}

.input-field {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 12px;
  margin-top: 5px;
}

.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.primary-button {
  background: #0056b3;
  color: white;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 16px;
  cursor: pointer;
  flex: 1;
  margin-left: 10px;
  text-align: center;
  border: none;
}

.secondary-button {
  background: white;
  color: #0056b3;
  border: 2px solid #0056b3;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 16px;
  cursor: pointer;
  flex: 1;
  margin-right: 10px;
  text-align: center;
}

.primary-button:hover {
  background: #004494;
}

.secondary-button:hover {
  background: #e6f0ff;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
}

.form-group {
  margin-bottom: 16px;
}

.input-field, .textarea {
  width: 100%;
  padding: 8px;
  margin-top: 8px;
}

.button-group {
  display: flex;
  justify-content: space-between;
}

.secondary-button, .primary-button {
  padding: 10px 15px;
  border-radius: 25px;
  border: none;
  cursor: pointer;
}

.secondary-button {
  background-color: #ccc;
}

.primary-button {
  background-color: #007bff;
  color: white;
}

.columns-container {
  display: flex;
  justify-content: space-between;
  gap: 15px; /* Spacing between columns */
  margin-top: 20px;
  min-height: 70vh;
}

.column {
  flex: 1;
  min-width: 280px;
  max-width: 33%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}

.column .section-title {
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 10px;
  align-items: center;
}


`;

