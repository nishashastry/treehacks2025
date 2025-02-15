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

  return (
    <Layout>
      <div className="conversations-page">
        <button
          onClick={() => setIsRecording(!isRecording)}
          className={`record-btn ${isRecording ? 'stop' : ''}`}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>

        <div className="content-container">
          <div className="messages">
            <h2 className="section-title">Live Transcript</h2>
            <div>{transcript || 'Start recording to generate transcript'}</div>
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
