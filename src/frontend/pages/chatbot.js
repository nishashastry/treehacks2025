import { useState, useEffect } from 'react';
import Layout from '../components/layout';

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    setMessages([{ sender: 'bot', content: 'How can I assist you today?' }]);
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'user', content: newMessage },
        { sender: 'bot', content: 'Thank you for your message! How else can I assist you?' },
      ]);
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

          <div className="input-container">
            <input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="input"
            />
            <button onClick={handleSendMessage} className="send-btn">
              Send
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Chatbot;
