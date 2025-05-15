document.addEventListener('DOMContentLoaded', function() {
  // Initialize profile editing
  initProfileEditing();
  
  // Initialize notification preferences
  initNotificationPreferences();
  
  // Initialize device settings
  initDeviceSettings();
  
  // Mobile menu toggle
  document.getElementById('mobile-menu-toggle').addEventListener('click', toggleMobileMenu);
});

// Initialize profile editing functionality
function initProfileEditing() {
  const editButton = document.getElementById('edit-profile');
  const profileInputs = document.querySelectorAll('.profile-group input');
  
  editButton.addEventListener('click', function() {
    // Check if we're in edit mode
    const isEditMode = editButton.classList.contains('editing');
    
    if (isEditMode) {
      // Save changes
      saveProfileChanges();
      
      // Update button
      editButton.innerHTML = '<i class="fas fa-edit"></i> Edit';
      editButton.classList.remove('editing');
      
      // Disable inputs
      profileInputs.forEach(input => {
        input.disabled = true;
      });
    } else {
      // Enable editing
      editButton.innerHTML = '<i class="fas fa-save"></i> Save';
      editButton.classList.add('editing');
      
      // Enable inputs
      profileInputs.forEach(input => {
        input.disabled = false;
      });
      
      // Focus on first input
      profileInputs[0].focus();
    }
  });
}

// Save profile changes
function saveProfileChanges() {
  // Get all profile inputs
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const babyName = document.getElementById('baby-name').value;
  const babyAge = document.getElementById('baby-age').value;
  
  // In a real app, you'd send this to your API
  console.log('Saving profile changes:', {
    name, email, phone, babyName, babyAge
  });
  
  // Show success message
  showToast('Profile updated successfully');
}

// Initialize notification preferences
function initNotificationPreferences() {
  // Quiet hours toggle
  const quietHoursToggle = document.getElementById('quiet-hours');
  const quietHoursRange = document.getElementById('quiet-hours-range');
  
  quietHoursToggle.addEventListener('change', function() {
    quietHoursRange.style.display = this.checked ? 'flex' : 'none';
  });
  
  // Save notifications button
  const saveButton = document.getElementById('save-notifications');
  
  saveButton.addEventListener('click', function() {
    // Get all notification settings
    const pushNotifications = document.getElementById('push-notifications').checked;
    const emailAlerts = document.getElementById('email-alerts').checked;
    const soundAlerts = document.getElementById('sound-alerts').checked;
    
    const hungerAlerts = document.getElementById('hunger-alerts').checked;
    const sleepAlerts = document.getElementById('sleep-alerts').checked;
    const discomfortAlerts = document.getElementById('discomfort-alerts').checked;
    const unknownAlerts = document.getElementById('unknown-alerts').checked;
    
    const quietHours = document.getElementById('quiet-hours').checked;
    const quietStart = document.getElementById('quiet-start').value;
    const quietEnd = document.getElementById('quiet-end').value;
    
    // In a real app, you'd send this to your API
    console.log('Saving notification settings:', {
      pushNotifications, emailAlerts, soundAlerts,
      hungerAlerts, sleepAlerts, discomfortAlerts, unknownAlerts,
      quietHours, quietStart, quietEnd
    });
    
    // Show success message
    showToast('Notification settings saved successfully');
  });
}

// Initialize device settings
function initDeviceSettings() {
  // Refresh device button
  const refreshButton = document.getElementById('refresh-device');
  
  refreshButton.addEventListener('click', function() {
    // In a real app, this would fetch the latest device info from your API
    console.log('Refreshing device information');
    
    // Show loading state
    refreshButton.classList.add('loading');
    refreshButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    // Simulate API call
    setTimeout(() => {
      refreshButton.classList.remove('loading');
      refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i>';
      
      // Show success message
      showToast('Device information updated');
    }, 1500);
  });
  
  // Factory reset button
  const resetButton = document.querySelector('.btn-danger-small');
  
  resetButton.addEventListener('click', function() {
    if (confirm('Are you sure you want to factory reset your device? This will erase all data and cannot be undone.')) {
      // In a real app, this would call your API to reset the device
      console.log('Factory resetting device');
      
      // Show loading state
      resetButton.textContent = 'Resetting...';
      resetButton.disabled = true;
      
      // Simulate API call
      setTimeout(() => {
        resetButton.textContent = 'Factory Reset';
        resetButton.disabled = false;
        
        // Show success message
        showToast('Device has been reset to factory settings');
      }, 2000);
    }
  });
}

// Show toast message
function showToast(message) {
  // Check if a toast container exists
  let toastContainer = document.querySelector('.toast-container');
  
  if (!toastContainer) {
    // Create toast container
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .toast-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
      }
      .toast {
        background-color: #3B82F6;
        color: white;
        padding: 1rem;
        border-radius: 4px;
        margin-top: 10px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        max-width: 500px;
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.3s, transform 0.3s;
      }
      .toast.show {
        opacity: 1;
        transform: translateY(0);
      }
      .toast-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 1rem;
        margin-left: 10px;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Create toast
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    ${message}
    <button class="toast-close">&times;</button>
  `;
  
  // Add to container
  toastContainer.appendChild(toast);
  
  // Show toast
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  // Add close button functionality
  const closeButton = toast.querySelector('.toast-close');
  closeButton.addEventListener('click', () => {
    toast.classList.remove('show');
    setTimeout(() => {
      toastContainer.removeChild(toast);
    }, 300);
  });
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toastContainer.removeChild(toast);
        }
      }, 300);
    }
  }, 3000);
}

// Toggle mobile menu
function toggleMobileMenu() {
  const sidebar = document.querySelector('.sidebar');
  sidebar.classList.toggle('active');
}
