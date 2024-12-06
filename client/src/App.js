import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import EmojiPicker from './EmojiPicker';
import './App.css';

const socket = io('http://localhost:4000'); // Backend URL

const App = () => {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isChatting, setIsChatting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const joinRoom = () => {
    if (username && room) {
      socket.emit('joinRoom', { username, room });
      setIsChatting(true);
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit('chatMessage', { room, username, message });
      setMessage(''); // Clear message input after sending
    }
  };

  useEffect(() => {
    socket.on('message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('message');
    };
  }, []);

  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="container">
      {!isChatting ? (
        <div className="c">
          <h2>Join a Chat Room</h2>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter room number"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <button onClick={joinRoom}>Join Room</button>
        </div>
      ) : (
        <div className="h">
          <h2>Chat Room: {room}</h2>
          <div className="chat-container">
            {messages.map((msg, index) => (
              <div key={index} className="message">
                <p>
                  <strong>{msg.username}:</strong> {msg}
                </p>
              </div>
            ))}
          </div>
          <input
            type="text"
            placeholder="Enter a message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ marginRight: '10px', padding: '10px' }}
          />
          <button onClick={sendMessage}>Send</button>
          <button onClick={() => setShowEmojiPicker((prev) => !prev)}>😊</button>
          {showEmojiPicker && <EmojiPicker onSelect={handleEmojiSelect} />}
        </div>
      )}
    </div>
  );
};

export default App;
