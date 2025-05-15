// Type text animation helper function for a more natural chat experience
function typeTextAnimation(element, text, speed = 25) {
  return new Promise((resolve) => {
    let i = 0;
    element.textContent = '';
    
    function type() {
      if (i < text.length) {
        // Add the next character
        element.textContent += text.charAt(i);
        i++;
        
        // Scroll messages container to bottom with each character
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        
        // Random slight variation in typing speed (+-10ms) for more natural effect
        const randomDelay = speed + (Math.random() * 20 - 10);
        setTimeout(type, randomDelay);
      } else {
        resolve();
      }
    }
    
    // Slight initial delay before typing starts
    setTimeout(type, 300);
  });
}
