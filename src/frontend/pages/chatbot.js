import { useState, useEffect } from 'react';
import Layout from '../components/layout';

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    setMessages([{ sender: 'bot', content: 'How can I assist you today?' }]);
  }, []);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const userMessage = { sender: 'user', content: newMessage };
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      console.log(newMessage);

      try {
        const response = await fetch('http://localhost:5000/chat', { // Flask backend URL
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
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
