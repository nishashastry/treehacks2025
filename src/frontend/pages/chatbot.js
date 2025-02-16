import { useState, useEffect, useRef } from 'react';
import Layout from '../components/layout';
import { FaMicrophone, FaStop } from 'react-icons/fa'; // Import microphone icon from react-icons

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    setMessages([{ sender: 'bot', content: 'How can I assist you today?' }]);
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        await handleAudioUpload(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleAudioUpload = async (blob) => {
    try {
      // Create a FormData object to send the audio file
      const formData = new FormData();
      formData.append('audio', blob, 'recording.wav');

      // Show a temporary message that we're processing the audio
      setMessages(prev => [...prev, {
        sender: 'user',
        content: 'Recording sent for processing...' 
      }]);

      // Send the audio file to the server
      const response = await fetch('http://localhost:5000/transcription', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
  
      if (response.ok) {
        // Show the transcribed text as a user message
        setMessages(prev => [
          ...prev.filter(msg => msg.content !== 'Recording sent for processing...'),
          { sender: 'user', content: data.transcription }
        ]);

       transcript = data.transcript
      } else {
        throw new Error('Transcription failed');
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      setMessages(prev => [
        ...prev.filter(msg => msg.content !== 'Recording sent for processing...'),
        { sender: 'bot', content: 'Error: Unable to process audio recording.' }
      ]);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const userMessage = { sender: 'user', content: newMessage };
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      console.log(newMessage);

      try {
        const response = await fetch('http://localhost:5000/chat', { // Flask backend URL
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: newMessage }),
        });

        const data = await response.json();
        if (response.ok) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', content: data.response },
          ]);
        } else {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'bot', content: 'Error: Unable to get a response.' },
          ]);
        }
      } catch (error) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'bot', content: 'Error: Server not reachable.' },
        ]);
      }

      setNewMessage('');
    }
  };

  return (
    <Layout>
      <div className="chat-page">
        <div className="chat-container">
          <div className="messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                <span>{msg.content}</span>
              </div>
            ))}
          </div>

          <div className="input-container" style={{ display: 'flex', alignItems: 'center' }}>
            {/* Microphone button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              style={{
                backgroundColor: '#007BFF',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '25px',
                cursor: 'pointer',
                marginRight: '10px',
              }}
            >
              {isRecording ? (
                <FaStop style={{ fontSize: '15px' }} />
              ) : (
                <FaMicrophone style={{ fontSize: '15px' }} />
              )}
            </button>

            {/* Text input */}
            <input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="input"
            />

            {/* Send button */}
            <button onClick={handleSendMessage} className="send-btn"
            style = {{ backgroundColor: '#007BFF'}}>
              Send
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Chatbot;
