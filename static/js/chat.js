// Chat Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Socket.IO connection
  const socket = io();
  
  // Elements
  const chatMessages = document.getElementById('chat-messages');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const statusIndicator = document.getElementById('status-indicator');
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  
  // Focus on chat input when the page loads
  chatInput.focus();
  
  // Socket events
  socket.on('connect', function() {
    console.log('Connected to server');
    updateStatusIndicator(true);
  });
  
  socket.on('disconnect', function() {
    console.log('Disconnected from server');
    updateStatusIndicator(false);
  });
  
  // Handle chat form submission
  if (chatForm) {
    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const userMessage = chatInput.value.trim();
      if (!userMessage) return;

      // Add user message to chat
      addMessage(userMessage, true);
      chatInput.value = '';

      try {
        // Show typing indicator
        const typingId = showTypingIndicator();
        
        // Send request to backend for Gemini response
        const response = await fetch('/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message: userMessage })
        });
        
        // Remove typing indicator
        removeTypingIndicator(typingId);
        
        if (response.ok) {
          const data = await response.json();
          addMessage(data.response);
        } else {
          throw new Error('Network response was not ok');
        }
      } catch (error) {
        console.error('Error generating response:', error);
        addMessage('Sorry, I encountered an error. Please try again.');
      }
    });
  }
  
  // Mobile menu toggle functionality
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', function() {
      const sidebar = document.querySelector('.sidebar');
      sidebar.classList.toggle('show');
    });
  }
  
  // Helper functions
  function addMessage(message, isUser = false) {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    const avatarIcon = document.createElement('i');
    avatarIcon.className = `fas ${isUser ? 'fa-user' : 'fa-robot'} message-avatar`;
    
    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    messageText.textContent = message;
    
    const messageTime = document.createElement('div');
    messageTime.className = 'message-time';
    messageTime.textContent = timeString;
    
    messageContent.appendChild(avatarIcon);
    messageContent.appendChild(messageText);
    
    messageDiv.appendChild(messageContent);
    messageDiv.appendChild(messageTime);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  function showTypingIndicator() {
    const typingId = 'typing-' + Date.now();
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot typing';
    typingDiv.id = typingId;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    const avatarIcon = document.createElement('i');
    avatarIcon.className = 'fas fa-robot message-avatar';
    
    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.innerHTML = '<span></span><span></span><span></span>';
    
    messageText.appendChild(typingIndicator);
    messageContent.appendChild(avatarIcon);
    messageContent.appendChild(messageText);
    
    typingDiv.appendChild(messageContent);
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return typingId;
  }
  
  function removeTypingIndicator(typingId) {
    const typingDiv = document.getElementById(typingId);
    if (typingDiv) {
      chatMessages.removeChild(typingDiv);
    }
  }
  
  function updateStatusIndicator(isOnline) {
    if (!statusIndicator) return;
    
    if (isOnline) {
      statusIndicator.className = 'status-indicator online';
    } else {
      statusIndicator.className = 'status-indicator offline';
    }
  }
});
