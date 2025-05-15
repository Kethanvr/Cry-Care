document.addEventListener('DOMContentLoaded', function() {
  // Set default dates (current month)
  setDefaultDates();
  
  // Initialize dropdown functionality
  initDropdown();
  
  // Initialize the monthly chart
  loadHistoryStats();
  
  // Load recent events
  loadRecentEvents();
  
  // Add event listeners
  document.getElementById('filter-button').addEventListener('click', filterData);
  document.getElementById('export-data').addEventListener('click', exportData);
  document.getElementById('refresh-events').addEventListener('click', refreshEvents);
  document.getElementById('load-more-events').addEventListener('click', loadMoreEvents);
  document.getElementById('mobile-menu-toggle').addEventListener('click', toggleMobileMenu);
});

// Set default date values (current month)
function setDefaultDates() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  const startDateInput = document.getElementById('start-date');
  const endDateInput = document.getElementById('end-date');
  
  startDateInput.value = formatDateForInput(firstDay);
  endDateInput.value = formatDateForInput(lastDay);
}

// Format date for input field (YYYY-MM-DD)
function formatDateForInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Initialize dropdown functionality
function initDropdown() {
  const dropdownToggle = document.querySelector('.dropdown-toggle');
  const dropdownMenu = document.querySelector('.dropdown-menu');
  const dropdownOptions = document.querySelectorAll('.dropdown-menu a');
  
  dropdownToggle.addEventListener('click', function(e) {
    e.preventDefault();
    dropdownMenu.classList.toggle('active');
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.dropdown')) {
      dropdownMenu.classList.remove('active');
    }
  });
  
  // Handle dropdown option selection
  dropdownOptions.forEach(option => {
    option.addEventListener('click', function(e) {
      e.preventDefault();
      const selectedMonth = this.getAttribute('data-month');
      document.getElementById('selected-month').textContent = selectedMonth;
      dropdownMenu.classList.remove('active');
      
      // Extract date from month string (e.g., "May 2025" -> "2025-05")
      const [monthName, yearStr] = selectedMonth.split(' ');
      const monthNum = new Date(`${monthName} 1, ${yearStr}`).getMonth() + 1;
      const formattedMonth = `${yearStr}-${monthNum.toString().padStart(2, '0')}`;
      
      // Update chart data based on selection
      loadHistoryStats(formattedMonth);
    });
  });
}

// Load history stats from API and update chart
function loadHistoryStats(month) {
  // Use current month if none provided
  if (!month) {
    const now = new Date();
    month = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  }
  
  // Show loading state
  document.getElementById('monthly-chart').innerHTML = 'Loading...';
  
  // Create sample data for demonstration
  const sampleData = {
    success: true,
    stats: {
      total: 58,
      weeks: {
        week1: {
          byType: { hunger: 15, sleepiness: 10, discomfort: 8, other: 5 }
        },
        week2: {
          byType: { hunger: 12, sleepiness: 14, discomfort: 6, other: 4 }
        },
        week3: {
          byType: { hunger: 18, sleepiness: 8, discomfort: 5, other: 6 }
        },
        week4: {
          byType: { hunger: 13, sleepiness: 10, discomfort: 5, other: 4 }
        }
      }
    },
    month: month
  };

  // Update the display with sample data
  updateStatsDisplay(sampleData.stats);
  renderMonthlyChart(sampleData.stats, sampleData.month);
}

// Update stats display with data from API
function updateStatsDisplay(stats) {
  // Update total cries count
  document.querySelector('.stat-item:nth-child(1) .stat-value').textContent = stats.total || 0;
  
  // Get totals by type
  const hungerTotal = Object.values(stats.weeks).reduce((sum, week) => sum + (week.byType.hunger || 0), 0);
  const sleepinessTotal = Object.values(stats.weeks).reduce((sum, week) => sum + (week.byType.sleepiness || 0), 0);
  const discomfortTotal = Object.values(stats.weeks).reduce((sum, week) => sum + (week.byType.discomfort || 0), 0);
  const otherTotal = Object.values(stats.weeks).reduce((sum, week) => sum + (week.byType.other || 0), 0);
  
  // Update category totals
  document.querySelector('.stat-item:nth-child(2) .stat-value').textContent = hungerTotal || 0;
  document.querySelector('.stat-item:nth-child(3) .stat-value').textContent = sleepinessTotal || 0;
  document.querySelector('.stat-item:nth-child(4) .stat-value').textContent = discomfortTotal || 0;
  document.querySelector('.stat-item:nth-child(5) .stat-value').textContent = otherTotal || 0;
}

// Render monthly chart with Chart.js
function renderMonthlyChart(stats, month) {
  // Prepare data for chart
  let data;
  
  if (stats) {
    // Use real data if available
    data = {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [
        {
          label: 'Hunger',
          data: [
            stats.weeks.week1.byType.hunger || 0,
            stats.weeks.week2.byType.hunger || 0,
            stats.weeks.week3.byType.hunger || 0,
            stats.weeks.week4.byType.hunger || 0
          ],
          backgroundColor: '#FCD34D',
        },
        {
          label: 'Sleepiness',
          data: [
            stats.weeks.week1.byType.sleepiness || 0,
            stats.weeks.week2.byType.sleepiness || 0,
            stats.weeks.week3.byType.sleepiness || 0,
            stats.weeks.week4.byType.sleepiness || 0
          ],
          backgroundColor: '#93C5FD',
        },
        {
          label: 'Discomfort',
          data: [
            stats.weeks.week1.byType.discomfort || 0,
            stats.weeks.week2.byType.discomfort || 0,
            stats.weeks.week3.byType.discomfort || 0,
            stats.weeks.week4.byType.discomfort || 0
          ],
          backgroundColor: '#FCA5A5',
        },
        {
          label: 'Other',
          data: [
            stats.weeks.week1.byType.other || 0,
            stats.weeks.week2.byType.other || 0,
            stats.weeks.week3.byType.other || 0,
            stats.weeks.week4.byType.other || 0
          ],
          backgroundColor: '#A7F3D0',
        }
      ]
    };
  } else {
    // Sample data as fallback
    data = {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [
        {
          label: 'Hunger',
          data: [15, 12, 18, 13],
          backgroundColor: '#FCD34D',
        },
        {
          label: 'Sleepiness',
          data: [10, 14, 8, 10],
          backgroundColor: '#93C5FD',
        },
        {
          label: 'Discomfort',
          data: [8, 6, 5, 5],
          backgroundColor: '#FCA5A5',
        },
        {
          label: 'Other',
          data: [5, 4, 6, 4],
          backgroundColor: '#A7F3D0',
        }
      ]
    };
  }
  
  // Get the canvas element
  const ctx = document.getElementById('monthly-chart').getContext('2d');
  
  // Destroy previous chart if it exists
  if (window.cryChart) {
    window.cryChart.destroy();
  }
  
  // Create new chart
  window.cryChart = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: true,
          title: {
            display: true,
            text: 'Days of Month'
          }
        },
        y: {
          stacked: true,
          title: {
            display: true,
            text: 'Number of Cries'
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Cry Types Distribution - ' + month
        }
      }
    }
  });
}

// Filter data based on date range
function filterData() {
  const startDate = document.getElementById('start-date').value;
  const endDate = document.getElementById('end-date').value;
  
  // Show loading state
  document.getElementById('monthly-chart').classList.add('loading');
  
  // Simulate API call with timeout
  setTimeout(() => {
    // In a real app, this would be an API call to get filtered data
    console.log(`Filtering data from ${startDate} to ${endDate}`);
    
    // Update chart with "filtered" data (just for demo)
    renderMonthlyChart();
    
    // Remove loading state
    document.getElementById('monthly-chart').classList.remove('loading');
    
    // Show success message
    alert('Data filtered successfully');
  }, 1000);
}

// Export data functionality
function exportData() {
  const startDate = document.getElementById('start-date').value;
  const endDate = document.getElementById('end-date').value;
  
  // In a real app, this would call an API endpoint to generate and download a CSV/Excel file
  console.log(`Exporting data from ${startDate} to ${endDate}`);
  
  // Create a fake CSV for demonstration
  const header = 'Date,Event Type,Description,Time\n';
  const rows = [
    '2025-05-15,Hunger,Baby seems hungry and needs feeding,14:45:00',
    '2025-05-15,Sleepiness,Baby is showing signs of tiredness,12:30:00',
    '2025-05-15,Discomfort,Baby may need a diaper change,10:15:00',
    '2025-05-14,Hunger,Baby seems hungry and needs feeding,20:20:00',
    '2025-05-14,Sleepiness,Baby is showing signs of tiredness,15:45:00'
  ].join('\n');
  
  const csvContent = header + rows;
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  // Create a temporary link and trigger download
  const a = document.createElement('a');
  a.href = url;
  a.download = `cry_history_${startDate}_to_${endDate}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Refresh events list
function refreshEvents() {
  const eventsList = document.querySelector('.events-list');
  
  // Show loading state
  eventsList.innerHTML = '<div class="loading-indicator">Loading events...</div>';
  
  // Simulate API call with timeout
  setTimeout(() => {
    // In a real app, this would be an API call to get latest events
    
    // Restore original content (for demo)
    eventsList.innerHTML = `
      <div class="event-item">
        <div class="event-icon hunger">
          <i class="fas fa-utensils"></i>
        </div>
        <div class="event-details">
          <div class="event-title">Hunger Detected</div>
          <div class="event-description">Baby seems hungry and needs feeding.</div>
          <div class="event-time">Today, 2:45 PM</div>
        </div>
        <div class="event-actions">
          <button class="btn-icon" title="View Details">
            <i class="fas fa-eye"></i>
          </button>
        </div>
      </div>
      <div class="event-item">
        <div class="event-icon sleepy">
          <i class="fas fa-moon"></i>
        </div>
        <div class="event-details">
          <div class="event-title">Sleepiness Detected</div>
          <div class="event-description">Baby is showing signs of tiredness.</div>
          <div class="event-time">Today, 12:30 PM</div>
        </div>
        <div class="event-actions">
          <button class="btn-icon" title="View Details">
            <i class="fas fa-eye"></i>
          </button>
        </div>
      </div>
      <div class="event-item">
        <div class="event-icon discomfort">
          <i class="fas fa-frown"></i>
        </div>
        <div class="event-details">
          <div class="event-title">Discomfort Detected</div>
          <div class="event-description">Baby may need a diaper change.</div>
          <div class="event-time">Today, 10:15 AM</div>
        </div>
        <div class="event-actions">
          <button class="btn-icon" title="View Details">
            <i class="fas fa-eye"></i>
          </button>
        </div>
      </div>
      <div class="event-item">
        <div class="event-icon hunger">
          <i class="fas fa-utensils"></i>
        </div>
        <div class="event-details">
          <div class="event-title">Hunger Detected</div>
          <div class="event-description">Baby seems hungry and needs feeding.</div>
          <div class="event-time">Yesterday, 8:20 PM</div>
        </div>
        <div class="event-actions">
          <button class="btn-icon" title="View Details">
            <i class="fas fa-eye"></i>
          </button>
        </div>
      </div>
      <div class="event-item">
        <div class="event-icon sleepy">
          <i class="fas fa-moon"></i>
        </div>
        <div class="event-details">
          <div class="event-title">Sleepiness Detected</div>
          <div class="event-description">Baby is showing signs of tiredness.</div>
          <div class="event-time">Yesterday, 3:45 PM</div>
        </div>
        <div class="event-actions">
          <button class="btn-icon" title="View Details">
            <i class="fas fa-eye"></i>
          </button>
        </div>
      </div>
    `;
  }, 1000);
}

// Load more events
function loadMoreEvents() {
  const eventsList = document.querySelector('.events-list');
  const button = document.getElementById('load-more-events');
  
  // Show loading state
  button.textContent = 'Loading...';
  button.disabled = true;
  
  // Simulate API call with timeout
  setTimeout(() => {
    // Add more events (in a real app, this would come from an API)
    const newEvents = `
      <div class="event-item">
        <div class="event-icon discomfort">
          <i class="fas fa-frown"></i>
        </div>
        <div class="event-details">
          <div class="event-title">Discomfort Detected</div>
          <div class="event-description">Baby might be experiencing discomfort.</div>
          <div class="event-time">Yesterday, 12:10 PM</div>
        </div>
        <div class="event-actions">
          <button class="btn-icon" title="View Details">
            <i class="fas fa-eye"></i>
          </button>
        </div>
      </div>
      <div class="event-item">
        <div class="event-icon hunger">
          <i class="fas fa-utensils"></i>
        </div>
        <div class="event-details">
          <div class="event-title">Hunger Detected</div>
          <div class="event-description">Baby seems hungry and needs feeding.</div>
          <div class="event-time">2 days ago, 7:30 PM</div>
        </div>
        <div class="event-actions">
          <button class="btn-icon" title="View Details">
            <i class="fas fa-eye"></i>
          </button>
        </div>
      </div>
      <div class="event-item">
        <div class="event-icon sleepy">
          <i class="fas fa-moon"></i>
        </div>
        <div class="event-details">
          <div class="event-title">Sleepiness Detected</div>
          <div class="event-description">Baby is showing signs of tiredness.</div>
          <div class="event-time">2 days ago, 2:15 PM</div>
        </div>
        <div class="event-actions">
          <button class="btn-icon" title="View Details">
            <i class="fas fa-eye"></i>
          </button>
        </div>
      </div>
    `;
    
    // Append new events
    eventsList.insertAdjacentHTML('beforeend', newEvents);
    
    // Reset button state
    button.textContent = 'Load More';
    button.disabled = false;
  }, 1000);
}

// Toggle mobile menu
function toggleMobileMenu() {
  const sidebar = document.querySelector('.sidebar');
  sidebar.classList.toggle('active');
}
