// BabyCry Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Socket.IO connection
  const socket = io();
  
  // Elements for baby status card
  const situationElement = document.getElementById('situation');
  const adviceElement = document.getElementById('advice');
  const lastUpdateElement = document.getElementById('last-update');
  const statusIndicator = document.getElementById('status-indicator');
  
  // Elements for chat card
  const chatMessages = document.getElementById('chat-messages');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  
  // Test elements
  const testButton = document.getElementById('test-button');
    // Mobile menu toggle
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  
  // Dummy responses for testing
  const dummyResponses = [
    {
      situation: "Baby is crying with high intensity",
      status: "Crying",
      recommendation: "The baby might be hungry. Try feeding your little one, sweetie. Sometimes they just need a full tummy to feel better."
    },
    {
      situation: "Baby is making soft cooing sounds",
      status: "Happy",
      recommendation: "Your precious one seems content, dear. These cooing sounds are baby's way of telling you they're happy. Enjoy these sweet moments."
    },
    {
      situation: "Baby is crying intermittently",
      status: "Fussy",
      recommendation: "Your little angel seems a bit fussy. Check if the diaper needs changing or if baby is tired. Sometimes they just need a gentle rock and a soft lullaby."
    }
  ];
    // Initialize with data from server
  // First try to get the latest status from the server
  fetch('/get-latest-status')
    .then(response => response.json())
    .then(data => {
      console.log('Latest status:', data);
      // Only display if we have meaningful data
      if (data && data.situation && data.situation !== "") {
        displayStatus(data);
      } else {
        // Fall back to dummy data if no real data available
        displayStatus(getRandomDummyResponse());
      }
    })
    .catch(error => {
      console.error('Error fetching latest status:', error);
      // Fall back to dummy data on error
      displayStatus(getRandomDummyResponse());
    });
  
  // Socket events
  socket.on('connect', function() {
    console.log('Connected to server');
    updateStatusIndicator(true);
  });
  
  socket.on('disconnect', function() {
    console.log('Disconnected from server');
    updateStatusIndicator(false);
  });
  
  socket.on('status_update', function(data) {
    console.log('Received status update:', data);
    displayStatus(data);
  });
  
  // Test button event
  if (testButton) {
    testButton.addEventListener('click', function() {
      this.disabled = true;
      this.textContent = 'Sending...';
      
      // Call the test endpoint
      fetch('/test-update')
        .then(response => response.json())
        .then(data => {
          console.log('Test update response:', data);
          if (data.data) {
            displayStatus(data.data);
          }
        })
        .catch(error => {
          console.error('Error sending test update:', error);
          alert('Error sending test update. Check console for details.');
        })
        .finally(() => {
          this.disabled = false;
          this.textContent = 'Simulate Baby Status Update';
        });
    });
  }
    // Chat functionality
  function addMessage(message, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

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
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot typing';
        typingDiv.textContent = 'Typing...';
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Send request to backend for Gemini response
        const response = await fetch('/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message: userMessage })
        });
        
        // Remove typing indicator
        chatMessages.removeChild(typingDiv);
        
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
  
  // Helper functions
  function displayStatus(data) {
    if (!situationElement || !adviceElement) return;
    
    // Show the situation
    situationElement.textContent = data.situation || 'No situation provided.';
    
    // Show the recommendation
    if (data.recommendation) {
      adviceElement.innerHTML = data.recommendation;
    } else {
      adviceElement.innerHTML = 'No advice available.';
    }
      // Update timestamp
    if (lastUpdateElement) {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const formattedDate = now.toLocaleDateString([], { month: 'short', day: 'numeric' });
      lastUpdateElement.textContent = `Last updated: ${formattedDate} at ${formattedTime}`;
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
  
  function getRandomDummyResponse() {
    return dummyResponses[Math.floor(Math.random() * dummyResponses.length)];
  }
  
  function generateBotResponse(userMessage) {
    // Simple response generation - in a real app, this would use an API
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! How can I help you with your baby today?";
    } else if (lowerMessage.includes('crying')) {
      return "If your baby is crying, try checking their diaper, offering food, or gently rocking them. Sometimes babies cry when they're overtired or need a change of environment.";
    } else if (lowerMessage.includes('sleep') || lowerMessage.includes('sleeping')) {
      return "For better baby sleep, establish a consistent bedtime routine, ensure the room is dark and at a comfortable temperature, and consider white noise to help soothe them.";
    } else if (lowerMessage.includes('feed') || lowerMessage.includes('feeding') || lowerMessage.includes('hungry')) {
      return "Hungry babies often give cues like rooting, putting hands to mouth, or making sucking motions. Newborns typically feed every 2-3 hours.";
    } else {
      return "I understand your concern. For more specific advice about your baby, please provide more details about what you're experiencing.";
    }
  }
    
  // Mobile menu toggle functionality
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', function() {
      const sidebar = document.querySelector('.sidebar');
      const mainContent = document.querySelector('.main-content');
      
      sidebar.classList.toggle('mobile-visible');
      
      // When sidebar is visible, adjust main content
      if (sidebar.classList.contains('mobile-visible')) {
        sidebar.style.width = '240px';
        sidebar.style.padding = '1.5rem 0';
      } else {
        sidebar.style.width = '0';
        sidebar.style.padding = '0';
      }    });
  }
});
