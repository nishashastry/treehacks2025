import { useState, useEffect } from 'react';
import Layout from '../components/layout';

const SUGGESTED_QUESTIONS = {
  diabetes: [
    'What lifestyle changes should I make to better manage my blood sugar?',
    'Are there any new treatment options available?',
    'How often should I check my blood sugar levels?',
    'What are the warning signs of complications I should watch for?'
  ],
  medication: [
    'Are there any side effects I should be aware of?',
    'Can I take this medication with my other prescriptions?',
    'What should I do if I miss a dose?',
    'How will I know if the medication is working?'
  ],
  symptoms: [
    'Could these symptoms be related to my current medication?',
    'How urgent are these symptoms?',
    'What testing might be needed?',
    'Should I make any immediate changes to my routine?'
  ]
};

export default function ClinicalNotes() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [actionItems, setActionItems] = useState([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);

  useEffect(() => {
    if (isRecording) {
      const mockConversation = [
        "Doctor: Hello, how are you feeling today?",
        "You: I've been having some concerns about my blood sugar levels.",
        "Doctor: I see. Have you noticed any specific patterns?",
        "You: Yes, it seems higher in the mornings.",
        "Doctor: That could be the dawn phenomenon. Let's discuss some management strategies."
      ];

      let currentLine = 0;
      const interval = setInterval(() => {
        if (currentLine < mockConversation.length) {
          setTranscript((prev) => prev + '\n' + mockConversation[currentLine]);

          if (mockConversation[currentLine].toLowerCase().includes('blood sugar')) {
            setSuggestedQuestions(SUGGESTED_QUESTIONS['diabetes']);
          }

          currentLine++;
        } else {
          setIsRecording(false);
          clearInterval(interval);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isRecording]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('Uploaded file:', file.name);

      // Create a new FormData object to send the file as multipart/form-data
      const formData = new FormData();
      formData.append('file', file);

      try {
        Send the file to the backend using a POST request
        const response = await fetch('http://localhost:5000/transcription', {
          method: 'POST',
          body: formData,
        });
        // const response = await fetch('http://localhost:5000/transcription', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'audio/mp3',
        //   },
        //   body: file,  // Directly sending the file as the request body
        // });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error:', errorData.error);
          alert('Error processing the file.');
          return;
        }

        const responseData = await response.json();
        console.log('Transcription and action items:', responseData);

        // Use the transcription and action items returned from the backend
        setTranscript(responseData.transcription);
        setActionItems(responseData.action_items);
        setSuggestedQuestions(responseData.suggestedQuestions);
      } catch (error) {
        console.error('Error sending the file:', error);
        alert('Failed to upload the file.');
      }
    } else {
      alert('Please upload a valid audio file.');
    }
  };

  return (
    <Layout>
      <div className="conversations-page">
        <div className="button-group">
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`record-btn ${isRecording ? 'stop' : ''}`}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>

          <label className="record-btn">
            Upload Audio File
            <input 
              type="file" 
              accept="audio/*"  // Accept all audio types (you can also specify formats like 'audio/mp3' if preferred)
              onChange={handleFileUpload} 
              style={{ display: 'none' }} 
            />
          </label>
        </div>

        <div className="content-container">
          <div className="messages">
            <h2 className="section-title">Live Transcript and Action Items</h2>
            <div>{transcript || 'Start recording to generate transcript'}</div>
            {actionItems.map((actionItem, index) => (
              <div key={index} className="question-box">
                {actionItem}
              </div>
            ))}
          </div>

          <div className="suggested-questions">
            <h2 className="section-title">Suggested Questions</h2>
            {suggestedQuestions.map((question, index) => (
              <div key={index} className="question-box">
                {question}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
