// Connect to Socket.IO server
const socket = io();

// DOM Elements
const responseFeed = document.getElementById('response-feed');
const clearLogsBtn = document.getElementById('clear-logs');
const autoScrollBtn = document.getElementById('auto-scroll');
const deviceIpEl = document.getElementById('device-ip');
const lastConnectionEl = document.getElementById('last-connection');
const messagesCountEl = document.getElementById('messages-count');
const signalStrengthEl = document.getElementById('signal-strength');
const statusIndicator = document.getElementById('status-indicator');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');

// State variables
let messageCount = 0;
let autoScroll = true;
let deviceConnected = false;
let lastDeviceIp = null;

// Initialize the page
function init() {
  // Add event listeners
  clearLogsBtn.addEventListener('click', clearLogs);
  autoScrollBtn.addEventListener('click', toggleAutoScroll);
  mobileMenuToggle?.addEventListener('click', toggleMobileMenu);
  
  // Set up Socket.IO event listeners
  setupSocketListeners();
  
  // Update connection status
  updateConnectionStatus(false);
}

// Set up Socket.IO event listeners
function setupSocketListeners() {
  // Listen for hardware data events
  socket.on('hardware_data', (data) => {
    messageCount++;
    addResponseMessage(data);
    updateConnectionInfo(data);
  });
  
  // Listen for connection events
  socket.on('connect', () => {
    console.log('Connected to server');
    addSystemMessage('Connected to server');
  });
  
  socket.on('disconnect', () => {
    console.log('Disconnected from server');
    addSystemMessage('Disconnected from server');
    updateConnectionStatus(false);
  });
  
  // Request any existing data on page load
  socket.emit('get_hardware_status');
}

// Add a response message to the feed
function addResponseMessage(data) {
  const timestamp = new Date().toLocaleTimeString();
  const messageType = determineMessageType(data.status);
  
  const messageEl = document.createElement('div');
  messageEl.className = `response-message ${messageType}`;
  
  // Format the JSON data for display
  const formattedData = JSON.stringify(data, null, 2);
  
  messageEl.innerHTML = `
    <span class="timestamp">${timestamp}</span>
    <span class="message">${data.status}</span>
    <pre class="message-data">${formattedData}</pre>
  `;
  
  responseFeed.appendChild(messageEl);
  
  if (autoScroll) {
    scrollToBottom();
  }
  
  // Update the messages count
  messagesCountEl.textContent = messageCount;
}

// Add a system message to the feed
function addSystemMessage(message) {
  const timestamp = new Date().toLocaleTimeString();
  
  const messageEl = document.createElement('div');
  messageEl.className = 'response-message system';
  
  messageEl.innerHTML = `
    <span class="timestamp">${timestamp}</span>
    <span class="message">${message}</span>
  `;
  
  responseFeed.appendChild(messageEl);
  
  if (autoScroll) {
    scrollToBottom();
  }
}

// Add an error message to the feed
function addErrorMessage(message) {
  const timestamp = new Date().toLocaleTimeString();
  
  const messageEl = document.createElement('div');
  messageEl.className = 'response-message error';
  
  messageEl.innerHTML = `
    <span class="timestamp">${timestamp}</span>
    <span class="message">${message}</span>
  `;
  
  responseFeed.appendChild(messageEl);
  
  if (autoScroll) {
    scrollToBottom();
  }
}

// Determine the message type based on the status
function determineMessageType(status) {
  if (status.includes('hungry')) return 'hungry';
  if (status.includes('scared')) return 'scared';
  if (status.includes('burping')) return 'burping';
  if (status.includes('crying')) return 'crying';
  return '';
}

// Update connection information
function updateConnectionInfo(data) {
  // Extract IP address from data or connection info
  const deviceIp = data.ip || data.deviceIp || lastDeviceIp || 'Unknown device';
  lastDeviceIp = deviceIp;
  
  // Update connection elements
  deviceIpEl.textContent = deviceIp;
  lastConnectionEl.textContent = new Date().toLocaleString();
  
  // Update signal strength indicator (random for demo purposes)
  updateSignalStrength();
  
  // Update connection status
  updateConnectionStatus(true);
}

// Update the signal strength indicator
function updateSignalStrength() {
  // For demo purposes, we'll simulate signal strength
  // In a real app, this would be based on actual signal strength data
  const signalLevels = ['poor', 'fair', 'good', 'excellent'];
  const randomLevel = signalLevels[Math.floor(Math.random() * signalLevels.length)];
  
  // Remove previous classes
  signalStrengthEl.classList.remove('signal-strength-poor', 'signal-strength-fair', 'signal-strength-good', 'signal-strength-excellent');
  
  // Add new class
  signalStrengthEl.classList.add(`signal-strength-${randomLevel}`);
}

// Update connection status indicator
function updateConnectionStatus(isConnected) {
  deviceConnected = isConnected;
  
  if (isConnected) {
    statusIndicator.classList.remove('offline');
    statusIndicator.classList.add('online');
  } else {
    statusIndicator.classList.remove('online');
    statusIndicator.classList.add('offline');
  }
}

// Clear all logs from the feed
function clearLogs() {
  // Add confirmation for production use
  responseFeed.innerHTML = '';
  addSystemMessage('Logs cleared');
}

// Toggle auto-scroll functionality
function toggleAutoScroll() {
  autoScroll = !autoScroll;
  
  if (autoScroll) {
    autoScrollBtn.classList.add('active');
    scrollToBottom();
  } else {
    autoScrollBtn.classList.remove('active');
  }
}

// Scroll to the bottom of the feed
function scrollToBottom() {
  responseFeed.scrollTop = responseFeed.scrollHeight;
}

// Toggle mobile menu
function toggleMobileMenu() {
  const sidebar = document.querySelector('.sidebar');
  sidebar.classList.toggle('show');
}

// Initialize the page when DOM content is loaded
document.addEventListener('DOMContentLoaded', init);
