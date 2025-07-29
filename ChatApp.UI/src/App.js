import React, { useState, useEffect } from 'react';
import './App.css'

const mockContacts = [
  { id: '1', name: 'Robert Fox', lastMessage: "I'm not buying it", time: '12:00AM', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=40&h=40&q=80' },
  { id: '2', name: 'Bassie Cooper', lastMessage: 'Seriously? That sounds too good to be true. Teleporting? What if', time: '11:30AM', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=40&h=40&q=80' },
  { id: '3', name: 'Darrell', lastMessage: 'something goes wrong', time: '12:00AM', avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=40&h=40&q=80' }, // Replaced
  { id: '4', name: 'Designers', lastMessage: 'I get your concern', time: '12:00AM', avatar: 'https://placehold.co/40x40/c0c0c0/000000?text=DS' }, // Replaced
  { id: '5', name: 'Lesile Alexander', lastMessage: "But they've tested", time: '12:00AM', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=40&h=40&q=80' }, // Replaced
  { id: '6', name: 'Guy Hawkins', lastMessage: 'inanimate objects', time: '12:00AM', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=40&h=40&q=80' },
  { id: '7', name: 'Jacob Jones', lastMessage: 'Famous last words', time: '12:00AM', avatar: 'https://placehold.co/40x40/c0c0c0/000000?text=JJ' }, // Replaced
  { id: '8', name: 'Esther Howard', lastMessage: 'Imagine getting mixed', time: '12:00AM', avatar: 'https://placehold.co/40x40/0056b3/88ff88?text=EH' }, // Replaced
];

const mockMessages = [
  { id: 'm1', sender: 'other', text: 'Hey, did you hear about the new invention? They\'ve created a device that lets you teleport anywhere instantly!', time: '11:29AM', avatar: 'https://placehold.co/40x40/add8e6/000000?text=OP' },
  { id: 'm2', sender: 'you', text: 'Seriously? That sounds too good to be true. How does it even work?', time: '11:29AM' },
  { id: 'm3', sender: 'other', text: 'It\'s wild! They use quantum-mechanical entanglement to disassemble your atoms and send the information to another location to reassemble you. Science fiction becoming reality!', time: '11:29AM', avatar: 'https://placehold.co/40x40/add8e6/000000?text=OP' },
];

function App() {
  const [selectedChat, setSelectedChat] = useState(null); // Stores the ID of the selected chat
  const [isMobileView, setIsMobileView] = useState(false); // Tracks if the screen is in mobile view

  useEffect(() => {
    // Function to check screen width and set mobile view state
    const checkMobile = () => {
      setIsMobileView(window.innerWidth <= 768); // Mobile breakpoint at 768px
    };

    checkMobile(); // Check on component mount
    window.addEventListener('resize', checkMobile); // Add resize listener

    return () => window.removeEventListener('resize', checkMobile); // Clean up
  }, []);

  const handleChatSelect = (chatId) => {
    setSelectedChat(chatId);
  };

  const handleBackToChatList = () => {
    setSelectedChat(null);
  };

  // Chat List Component
  const ChatList = () => (
    <div className={`chat-list ${selectedChat && isMobileView ? 'hide-on-mobile' : ''}`}>
      <div className="chat-list-header">
        <h2 className="chat-title">My Chat</h2>
        <div className="search-bar">
          <input type="text" placeholder="Search" />
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
      </div>
      <div className="all-messages-header">
        ALL MESSAGES <span className="message-count">(18)</span>
      </div>
      <div className="contacts-list">
        {mockContacts.map(contact => (
          <div key={contact.id} className="contact-item" onClick={() => handleChatSelect(contact.id)}>
            <img src={contact.avatar} alt={contact.name} className="contact-avatar" />
            <div className="contact-info">
              <div className="contact-name">{contact.name}</div>
              <div className="last-message">{contact.lastMessage}</div>
            </div>
            <div className="message-time">{contact.time}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // Inbox Component
  const Inbox = () => (
    <div className={`inbox ${selectedChat || !isMobileView ? 'show-on-mobile' : ''}`}>
      <div className="inbox-header">
        {isMobileView && (
          <button className="back-button" onClick={handleBackToChatList}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect y="4" width="24" height="2" fill="black"/>
  <rect y="11" width="24" height="2" fill="black"/>
  <rect y="18" width="24" height="2" fill="black"/>
</svg>
          </button>
        )}
        <h2 className="inbox-title">Inbox</h2>
      </div>
      <div className="messages-area">
        {mockMessages.map(message => (
          <div key={message.id} className={`message-bubble-wrapper ${message.sender}`}>
            {message.sender === 'other' && <img src={message.avatar} alt="Avatar" className="message-avatar" />}
            <div className="message-bubble">
              <p>{message.text}</p>
            </div>
            <span className="message-time-small">{message.time}</span>
          </div>
        ))}
      </div>
      <div className="message-input-area">
        <input type="text" placeholder="Type something..." />
        <div className="input-icons">
          <svg className="clip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.02l-7.06-7.06a2 2 0 0 0-2.83 0L3.5 13.08a4 4 0 0 0 0 5.66l.7.7a4 4 0 0 0 5.66 0L20.7 7.74a2 2 0 0 0 0-2.83l-1.41-1.41a2 2 0 0 0-2.83 0zM13.08 11.08L11.7 12.46"></path>
          </svg>
          <button className="send-button">Send</button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="app-container">
        <ChatList />
        <Inbox />
      </div>
    </>
  );
}

export default App;
