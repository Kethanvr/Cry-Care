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
  
  // Chat history storage
  let chatHistory = loadChatHistory();
  
  // Conversation tracking
  let conversationId = localStorage.getItem('babyCryConversationId') || generateConversationId();
  localStorage.setItem('babyCryConversationId', conversationId);
  
  // Display saved chat history
  displayChatHistory();
  
  // Focus on chat input when the page loads
  chatInput.focus();
  
  // Setup control buttons
  const newConversationBtn = document.getElementById('new-conversation-btn');
  const clearHistoryBtn = document.getElementById('clear-history-btn');
  
  if (newConversationBtn) {
    newConversationBtn.addEventListener('click', function() {
      // Generate new conversation ID
      conversationId = generateConversationId();
      localStorage.setItem('babyCryConversationId', conversationId);
      
      // Add a system message to indicate a new conversation
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const messageDiv = document.createElement('div');
      messageDiv.className = 'message system';
      
      const messageContent = document.createElement('div');
      messageContent.className = 'message-content';
      
      const messageText = document.createElement('div');
      messageText.className = 'message-text';
      messageText.textContent = 'New conversation started.';
      
      const messageTime = document.createElement('div');
      messageTime.className = 'message-time';
      messageTime.textContent = timeString;
      
      messageContent.appendChild(messageText);
      messageDiv.appendChild(messageContent);
      messageDiv.appendChild(messageTime);
      
      chatMessages.appendChild(messageDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
      // Add a welcome message
      setTimeout(() => {
        addMessage("Hello! I'm your baby care assistant. How can I help you today? Ask me anything about infant care, feeding, sleep, or development.", false);
      }, 500);
    });
  }
  
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', function() {
      if (confirm('Are you sure you want to clear your chat history? This cannot be undone.')) {
        // Clear localStorage
        localStorage.removeItem('babyCryChatHistory');
        
        // Clear the messages display
        chatMessages.innerHTML = '';
        
        // Reset chat history array
        chatHistory = [];
        
        // Add a welcome message
        addMessage("Hello! I'm your baby care assistant. How can I help you today? Ask me anything about infant care, feeding, sleep, or development.", false);
      }
    });
  }
  
  // Setup download button
  const downloadBtn = document.getElementById('download-history-btn');
  
  if (downloadBtn) {
    downloadBtn.addEventListener('click', function() {
      downloadChatHistory();
    });
  }
  
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
          body: JSON.stringify({ 
            message: userMessage,
            conversationId: conversationId
          })
        });
        
        // Remove typing indicator
        removeTypingIndicator(typingId);        
        if (response.ok) {
          const data = await response.json();
          
          // Store updated conversation ID if provided
          if (data.conversationId) {
            conversationId = data.conversationId;
            localStorage.setItem('babyCryConversationId', conversationId);
          }
          
          // Calculate a realistic typing delay based on response length
          const responseLength = data.response.length;
          const baseDelay = 1000; // Minimum delay of 1 second
          const typingDelay = Math.min(responseLength * 30, 5000) + baseDelay; // Cap at 6 seconds total
          
          // Show a new typing indicator with the delay
          const delayTypingId = showTypingIndicator();
          
          // Wait for a portion of the calculated time
          await new Promise(resolve => setTimeout(resolve, typingDelay / 2));
          
          // Remove typing indicator
          removeTypingIndicator(delayTypingId);
          
          // Add the bot message with typing animation
          await addAnimatedMessage(data.response);
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
  
  // Enable sending messages with Enter key (use Shift+Enter for new line)
  if (chatInput) {
    chatInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm.dispatchEvent(new Event('submit'));
      }
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
    
    // Add reaction buttons for bot messages
    if (!isUser) {
      const reactions = document.createElement('div');
      reactions.className = 'message-reactions';
      
      const likeBtn = document.createElement('button');
      likeBtn.className = 'reaction-btn';
      likeBtn.innerHTML = '<i class="fas fa-thumbs-up"></i>';
      likeBtn.onclick = () => handleReaction(message, 'like');
      
      const dislikeBtn = document.createElement('button');
      dislikeBtn.className = 'reaction-btn';
      dislikeBtn.innerHTML = '<i class="fas fa-thumbs-down"></i>';
      dislikeBtn.onclick = () => handleReaction(message, 'dislike');
      
      reactions.appendChild(likeBtn);
      reactions.appendChild(dislikeBtn);
      messageDiv.appendChild(reactions);
    }
    
    messageContent.appendChild(avatarIcon);
    messageContent.appendChild(messageText);
    
    messageDiv.appendChild(messageContent);
    messageDiv.appendChild(messageTime);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Save to chat history
    saveChatMessage(message, isUser, timeString);
    
    return messageDiv;
  }
  
  // Add message with typing animation
  async function addAnimatedMessage(message) {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    const avatarIcon = document.createElement('i');
    avatarIcon.className = 'fas fa-robot message-avatar';
    
    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    // Initially empty, will be filled by animation
    
    const messageTime = document.createElement('div');
    messageTime.className = 'message-time';
    messageTime.textContent = timeString;
    
    // Add reaction buttons
    const reactions = document.createElement('div');
    reactions.className = 'message-reactions';
    
    const likeBtn = document.createElement('button');
    likeBtn.className = 'reaction-btn';
    likeBtn.innerHTML = '<i class="fas fa-thumbs-up"></i>';
    likeBtn.onclick = () => handleReaction(message, 'like');
    
    const dislikeBtn = document.createElement('button');
    dislikeBtn.className = 'reaction-btn';
    dislikeBtn.innerHTML = '<i class="fas fa-thumbs-down"></i>';
    dislikeBtn.onclick = () => handleReaction(message, 'dislike');
    
    reactions.appendChild(likeBtn);
    reactions.appendChild(dislikeBtn);
    
    messageContent.appendChild(avatarIcon);
    messageContent.appendChild(messageText);
    
    messageDiv.appendChild(messageContent);
    messageDiv.appendChild(messageTime);
    messageDiv.appendChild(reactions);
    
    chatMessages.appendChild(messageDiv);
    
    // Animate the typing
    await typeTextAnimation(messageText, message);
    
    // Save to chat history
    saveChatMessage(message, false, timeString);
    
    return messageDiv;
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
  
  // Generate a random conversation ID
  function generateConversationId() {
    return 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
  }
  
  function handleReaction(message, type) {
    console.log(`Message "${message}" received a ${type} reaction`);
    // You could send this feedback to your server for analytics or training
  }
  
  // Chat history persistence functions
  function saveChatMessage(message, isUser, timeString) {
    chatHistory.push({
      message: message,
      isUser: isUser,
      timestamp: timeString,
      date: new Date().toISOString()
    });
    
    // Only keep the latest 50 messages
    if (chatHistory.length > 50) {
      chatHistory = chatHistory.slice(chatHistory.length - 50);
    }
    
    // Save to localStorage
    localStorage.setItem('babyCryChatHistory', JSON.stringify(chatHistory));
  }
  
  function loadChatHistory() {
    const saved = localStorage.getItem('babyCryChatHistory');
    return saved ? JSON.parse(saved) : [];
  }
  
  function displayChatHistory() {
    // Clear default welcome message if we have history
    if (chatHistory.length > 0) {
      chatMessages.innerHTML = '';
    }
    
    // Display up to the last 10 messages to avoid cluttering the UI
    const recentHistory = chatHistory.slice(Math.max(0, chatHistory.length - 10));
    
    recentHistory.forEach(item => {
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${item.isUser ? 'user' : 'bot'}`;
      
      const messageContent = document.createElement('div');
      messageContent.className = 'message-content';
      
      const avatarIcon = document.createElement('i');
      avatarIcon.className = `fas ${item.isUser ? 'fa-user' : 'fa-robot'} message-avatar`;
      
      const messageText = document.createElement('div');
      messageText.className = 'message-text';
      messageText.textContent = item.message;
      
      const messageTime = document.createElement('div');
      messageTime.className = 'message-time';
      messageTime.textContent = item.timestamp;
      
      // Add reaction buttons for bot messages
      if (!item.isUser) {
        const reactions = document.createElement('div');
        reactions.className = 'message-reactions';
        
        const likeBtn = document.createElement('button');
        likeBtn.className = 'reaction-btn';
        likeBtn.innerHTML = '<i class="fas fa-thumbs-up"></i>';
        likeBtn.onclick = () => handleReaction(item.message, 'like');
        
        const dislikeBtn = document.createElement('button');
        dislikeBtn.className = 'reaction-btn';
        dislikeBtn.innerHTML = '<i class="fas fa-thumbs-down"></i>';
        dislikeBtn.onclick = () => handleReaction(item.message, 'dislike');
        
        reactions.appendChild(likeBtn);
        reactions.appendChild(dislikeBtn);
        messageDiv.appendChild(reactions);
      }
      
      messageContent.appendChild(avatarIcon);
      messageContent.appendChild(messageText);
      
      messageDiv.appendChild(messageContent);
      messageDiv.appendChild(messageTime);
      
      chatMessages.appendChild(messageDiv);
    });
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Chat history download function
  function downloadChatHistory() {
    if (chatHistory.length === 0) {
      alert('No chat history to download.');
      return;
    }
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const filename = `babycry-chat-history-${dateStr}.json`;
    
    // Format the chat history for better readability
    const formattedHistory = chatHistory.map(item => {
      return {
        role: item.isUser ? 'User' : 'Assistant',
        message: item.message,
        timestamp: item.timestamp,
        date: item.date
      };
    });
    
    const historyJSON = JSON.stringify(formattedHistory, null, 2);
    const blob = new Blob([historyJSON], { type: 'application/json' });
    
    // Create a download link and trigger the download
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = filename;
    
    // Append to the body, click and remove
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Clean up the URL.createObjectURL
    URL.revokeObjectURL(downloadLink.href);
  }
});
