import { sendToTelegram } from './sendToTelegram.js';

// Main site functionality (ES-модуль)
initContactForm();
initSmoothScrolling();
initFooterYear();
initMobileMenu();
initPhoneMask();

function getCurrentLang() {
  if (window.location.pathname.includes('/en/')) return 'en';
  return 'fr';
}

function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;
  
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(form);
    const currentLang = getCurrentLang();
    
    // Get IP address
    let ip = 'Unknown';
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      ip = ipData.ip;
    } catch (error) {
      console.error('Error getting IP:', error);
    }
    
    const data = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      message: formData.get('message'),
      language: currentLang,
      ip: ip
    };
    
    try {
      await sendToTelegram(data);
      showNotification('success');
      form.reset();
    } catch (error) {
      console.error('Error sending message:', error);
      showNotification('error');
    }
  });
}

function showNotification(type) {
  const modal = document.getElementById('notification-modal');
  const title = document.getElementById('notification-title');
  const message = document.getElementById('notification-message');
  const icon = document.getElementById('notification-icon');
  
  if (!modal || !title || !message || !icon) return;
  
  if (type === 'success') {
    title.textContent = 'Success!';
    message.textContent = 'Your message has been sent successfully.';
    icon.textContent = '✓';
    icon.style.color = '#4CAF50';
  } else {
    title.textContent = 'Error!';
    message.textContent = 'An error occurred while sending the message. Please try again.';
    icon.textContent = '✗';
    icon.style.color = '#f44336';
  }
  
  modal.style.display = 'flex';
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    modal.style.display = 'none';
  }, 5000);
}

function initSmoothScrolling() {
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

function initFooterYear() {
  const footerText = document.getElementById('footer-rights-text');
  if (footerText) {
    const currentYear = new Date().getFullYear();
    footerText.textContent = `© ${currentYear} All rights reserved`;
  }
}

function initMobileMenu() {
  const navLinks = document.querySelector('.nav-links');
  const hamburger = document.querySelector('.hamburger');
  
  if (!navLinks || !hamburger) return;
  
  hamburger.addEventListener('click', function() {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
  });
  
  // Close menu when clicking on a link
  const links = navLinks.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      hamburger.classList.remove('active');
    });
  });
}

// Close notification modal
document.addEventListener('DOMContentLoaded', function() {
  const closeBtn = document.getElementById('notification-close');
  const modal = document.getElementById('notification-modal');
  
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }
});

// --- Dynamic portfolio generation ---
// Example data structure (can be extended)
const portfolioData = [
  { client: 1, images: [ '1/1.jpg', '1/2.jpg', '1/3.jpg', '1/4.jpg' ], titleKey: 'portfolio_garage' },
  { client: 2, images: [ '2/1.jpg', '2/2.jpg', '2/3.jpg', '2/4.jpg' ], titleKey: 'portfolio_shop' },
  { client: 3, images: [ '3/1.jpg', '3/2.jpg', '3/3.jpg', '3/4.jpg' ], titleKey: 'portfolio_livingroom' },
];

// Global translation dictionary
window.i18nDict = {};

async function loadPortfolioLangDict() {
  const lang = getCurrentLang();
  const isSubfolder = window.location.pathname.includes('/fr/') || window.location.pathname.includes('/en/');
  const jsonPath = isSubfolder ? '../' + lang + '.json' : lang + '.json';
  const res = await fetch(jsonPath);
  window.i18nDict = await res.json();
}

function getPortfolioTitle(clientId) {
  const item = portfolioData.find(x => x.client === clientId);
  if (!item) return '';
  return window.i18nDict[item.titleKey] || '';
}

function getCarouselImages(clientIdx) {
  const item = portfolioData[clientIdx];
  if (!item) return [];
  return item.images
    .map((img, idx) => {
      const baseKey = item.titleKey;
      const photoKey = baseKey + '_' + (idx + 1);
      const desc = window.i18nDict[photoKey] || window.i18nDict[baseKey] || '';
      return desc && img ? { img, desc, idx } : null;
    })
    .filter(Boolean);
}

let currentClient = 0;
let currentCarouselIndex = 0;
let currentCarouselImages = [];

function buildPortfolioGrid() {
  const grid = document.querySelector('.portfolio-grid');
  grid.innerHTML = '';
  portfolioData.forEach((client, clientIdx) => {
    const group = document.createElement('div');
    group.className = 'portfolio-group';
    group.setAttribute('data-client', client.client);
    client.images.forEach((img, imgIdx) => {
      const item = document.createElement('div');
      item.className = 'portfolio-item';
      item.setAttribute('data-client', clientIdx);
      item.setAttribute('data-index', imgIdx);
      const image = document.createElement('img');
      image.src = 'images/portfolio/' + img;
      let desc = '';
      if (window.portfolioDescriptions[client.client] && window.portfolioDescriptions[client.client][imgIdx+1]) {
        desc = window.portfolioDescriptions[client.client][imgIdx+1];
      }
      const overlay = document.createElement('div');
      overlay.className = 'portfolio-overlay';
      overlay.innerHTML = `<h3>${desc ? desc : 'Photo ' + (imgIdx+1)}</h3>`;
      item.appendChild(image);
      item.appendChild(overlay);
      group.appendChild(item);
    });
    grid.appendChild(group);
  });
}

function openCarousel(clientIdx, index) {
  currentClient = clientIdx;
  currentCarouselImages = getCarouselImages(clientIdx);
  if (!currentCarouselImages.length) return;
  currentCarouselIndex = index;
  updateCarouselImg();
  document.getElementById('carousel-modal').style.display = 'flex';
}
function closeCarousel() {
  document.getElementById('carousel-modal').style.display = 'none';
}
function showCarouselImg(index) {
  if (!currentCarouselImages.length) return;
  currentCarouselIndex = (index + currentCarouselImages.length) % currentCarouselImages.length;
  updateCarouselImg();
}
function updateCarouselImg() {
  if (!currentCarouselImages.length) {
    document.getElementById('carousel-img').src = '';
    document.getElementById('carousel-img').alt = '';
    document.getElementById('carousel-desc').textContent = '';
    return;
  }
  const { img, desc, idx } = currentCarouselImages[currentCarouselIndex];
  const item = portfolioData[currentClient];
  const baseKey = item.titleKey;
  const altKey = baseKey + '_alt_' + (idx + 1);
  document.getElementById('carousel-img').src = 'images/portfolio/' + img;
  document.getElementById('carousel-img').alt = window.i18nDict[altKey] || desc || window.i18nDict[baseKey] || '';
  document.getElementById('carousel-desc').textContent = desc;
}

function buildPortfolioTiles() {
  const tiles = document.querySelector('.portfolio-tiles');
  tiles.innerHTML = '';
  portfolioData.forEach((client, clientIdx) => {
    const tile = document.createElement('div');
    tile.className = 'portfolio-tile';
    // Cover image
    const img = document.createElement('img');
    img.src = 'images/portfolio/' + client.client + '/0.jpg';
    const altKey = client.titleKey + '_alt';
    img.alt = window.i18nDict[altKey] || window.i18nDict[client.titleKey] || '';
    img.className = 'portfolio-tile-img';
    tile.appendChild(img);
    // Tile caption
    const tileDesc = getPortfolioTitle(client.client);
    const caption = document.createElement('div');
    caption.className = 'portfolio-tile-caption';
    caption.textContent = tileDesc;
    tile.appendChild(caption);
    tile.addEventListener('mouseenter', () => { img.classList.add('hovered'); });
    tile.addEventListener('mouseleave', () => { img.classList.remove('hovered'); });
    tile.onclick = () => openCarousel(clientIdx, 0);
    tiles.appendChild(tile);
  });
}

function initPhoneMask() {
  const phoneInputs = document.querySelectorAll('input[name="phone"]');
  if (!phoneInputs.length) return;
  phoneInputs.forEach(phoneInput => {
    phoneInput.addEventListener('input', function(e) {
      let value = phoneInput.value.replace(/\D/g, '');
      if (value.length > 10) value = value.slice(0, 10);
      let formatted = '';
      if (value.length > 0) formatted = '(' + value.substring(0, 3);
      if (value.length >= 4) formatted += ') ' + value.substring(3, 6);
      if (value.length >= 7) formatted += '-' + value.substring(6, 10);
      phoneInput.value = formatted;
    });
  });
}
