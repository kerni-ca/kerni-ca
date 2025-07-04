import { sendToTelegram } from './sendToTelegram.js';

// === TELEGRAM CONFIG DIAGNOSTICS ===
console.log('=== SCRIPT.JS LOADED ===');
console.log('window.TELEGRAM_CONFIG at script load:', window.TELEGRAM_CONFIG);
console.log('Config type:', typeof window.TELEGRAM_CONFIG);
if (window.TELEGRAM_CONFIG) {
  console.log('Bot token exists:', !!window.TELEGRAM_CONFIG.botToken);
  console.log('Chat ID exists:', !!window.TELEGRAM_CONFIG.chatId);
  console.log('Bot token value:', window.TELEGRAM_CONFIG.botToken);
  console.log('Chat ID value:', window.TELEGRAM_CONFIG.chatId);
} else {
  console.warn('TELEGRAM_CONFIG is undefined at script load!');
}

// --- Динамическая генерация портфолио ---
// Пример структуры данных (можно расширять)
const portfolioData = [
  { client: 1, images: [ '1/1.jpg', '1/2.jpg', '1/3.jpg', '1/4.jpg' ], titleKey: 'portfolio_garage' },
  { client: 2, images: [ '2/1.jpg', '2/2.jpg', '2/3.jpg', '2/4.jpg' ], titleKey: 'portfolio_shop' },
  { client: 3, images: [ '3/1.jpg', '3/2.jpg', '3/3.jpg', '3/4.jpg' ], titleKey: 'portfolio_livingroom' },
];

// Глобальный словарь переводов
window.i18nDict = {};

async function loadPortfolioLangDict() {
  const lang = localStorage.getItem('lang') || 'fr';
  const res = await fetch(lang + '.json');
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
      overlay.innerHTML = `<h3>${desc ? desc : 'Фото ' + (imgIdx+1)}</h3>`;
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
    // Картинка-заставка
    const img = document.createElement('img');
    img.src = `images/portfolio/${client.client}/0.jpg`;
    const altKey = client.titleKey + '_alt';
    img.alt = window.i18nDict[altKey] || window.i18nDict[client.titleKey] || '';
    img.className = 'portfolio-tile-img';
    tile.appendChild(img);
    // Подпись под плиткой
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

function hideLoadingOverlay() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(() => { overlay.style.display = 'none'; }, 400);
  }
}

// Получение IP пользователя
async function getUserIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error getting IP:', error);
    return 'Unknown';
  }
}

// Обработка отправки формы
async function handleFormSubmit(event) {
  event.preventDefault();
  
  console.log('=== FORM SUBMIT DIAGNOSTICS ===');
  console.log('1. Form submitted');
  
  const form = event.target;
  const formData = new FormData(form);
  
  console.log('2. Form data collected');
  console.log('Form data:', {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    message: formData.get('message')
  });
  
  console.log('3. Getting user IP...');
  const userIP = await getUserIP();
  console.log('User IP:', userIP);
  
  const data = {
    name: formData.get('name') || '',
    email: formData.get('email') || '',
    phone: formData.get('phone') || '',
    message: formData.get('message') || '',
    ip: userIP
  };
  
  console.log('4. Data prepared:', data);
  
  console.log('5. Checking Telegram config...');
  console.log('window.TELEGRAM_CONFIG:', window.TELEGRAM_CONFIG);
  console.log('Config type:', typeof window.TELEGRAM_CONFIG);
  
  if (window.TELEGRAM_CONFIG) {
    console.log('Config botToken:', window.TELEGRAM_CONFIG.botToken);
    console.log('Config chatId:', window.TELEGRAM_CONFIG.chatId);
  }
  
  try {
    console.log('6. Calling sendToTelegram...');
    await sendToTelegram(data);
    console.log('7. Message sent successfully!');
    alert('Thank you! Your message has been sent successfully.');
    form.reset();
  } catch (error) {
    console.error('8. Error occurred:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    alert('Sorry, there was an error sending your message. Please try again.');
  }
}

window.addEventListener('DOMContentLoaded', async function() {
  await loadPortfolioLangDict();
  buildPortfolioTiles();
  
  // Проверяем загрузку Telegram конфигурации
  console.log('Checking Telegram config...');
  if (window.TELEGRAM_CONFIG) {
    console.log('Telegram config loaded:', window.TELEGRAM_CONFIG);
  } else {
    console.warn('Telegram config not found. Form submission will not work.');
  }
  
  // Обработчик формы
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', handleFormSubmit);
  }
  
  // Кнопки навигации и закрытия
  document.getElementById('carousel-close').onclick = closeCarousel;
  document.getElementById('carousel-prev').onclick = function() { showCarouselImg(currentCarouselIndex - 1); };
  document.getElementById('carousel-next').onclick = function() { showCarouselImg(currentCarouselIndex + 1); };
  document.getElementById('carousel-modal').addEventListener('click', function(e) {
    if (e.target === this) closeCarousel();
  });
  // Скрыть спиннер после загрузки
  hideLoadingOverlay();
});

window.buildPortfolioTiles = buildPortfolioTiles;
window.loadPortfolioLangDict = loadPortfolioLangDict; 