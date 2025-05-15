// CryCare Home Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navList = document.querySelector('.nav-list');
  
  if (mobileMenuBtn && navList) {
    mobileMenuBtn.addEventListener('click', function() {
      navList.classList.toggle('active');
      
      // Toggle the icon between hamburger and close
      const icon = this.querySelector('i');
      if (icon.classList.contains('fa-bars')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
      } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    });
  }
  
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Close mobile menu if open
      if (navList.classList.contains('active')) {
        navList.classList.remove('active');
        mobileMenuBtn.querySelector('i').classList.remove('fa-times');
        mobileMenuBtn.querySelector('i').classList.add('fa-bars');
      }
      
      const targetId = this.getAttribute('href');
      
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80, // Adjust for header height
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Highlight active nav item on scroll
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-link');
  
  function highlightNavOnScroll() {
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 100;
      const sectionId = section.getAttribute('id');
      
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navItems.forEach(item => {
          item.classList.remove('active');
          if (item.getAttribute('href') === `#${sectionId}`) {
            item.classList.add('active');
          }
        });
      }
    });
    
    // If we're at the top of the page, highlight home
    if (scrollY < 100) {
      navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === '/') {
          item.classList.add('active');
        }
      });
    }
  }
  
  window.addEventListener('scroll', highlightNavOnScroll);
  
  // Form submission handling
  const contactForm = document.querySelector('.contact-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const messageInput = document.getElementById('message');
      
      // Simple validation
      if (!nameInput.value || !emailInput.value || !messageInput.value) {
        alert('Please fill out all fields');
        return;
      }
      
      // Here you would normally send the data to a server
      // For this demo, we'll just show a success message
      alert('Thank you for your message! We will get back to you soon.');
      
      // Reset form
      contactForm.reset();
    });
  }
  
  // Animation on scroll (simple version)
  function revealElements() {
    const elements = document.querySelectorAll('.feature-card, .tech-card, .use-case-card, .benefit-card, .timeline-item');
    const windowHeight = window.innerHeight;
    
    elements.forEach(element => {
      const elementPosition = element.getBoundingClientRect().top;
      
      if (elementPosition < windowHeight - 100) {
        element.style.opacity = 1;
        element.style.transform = 'translateY(0)';
      }
    });
  }
  
  // Initialize the animation
  elements = document.querySelectorAll('.feature-card, .tech-card, .use-case-card, .benefit-card, .timeline-item');
  elements.forEach(element => {
    element.style.opacity = 0;
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });
  
  window.addEventListener('scroll', revealElements);
  
  // Initial check for elements in view
  revealElements();
});
