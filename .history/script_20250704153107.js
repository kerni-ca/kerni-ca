import { sendToTelegram } from './sendToTelegram.js';

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

// Функции для работы с модальным окном уведомлений
function showNotification(type, title, message) {
  const modal = document.getElementById('notification-modal');
  const icon = document.getElementById('notification-icon');
  const iconContainer = icon.parentElement;
  const titleEl = document.getElementById('notification-title');
  const messageEl = document.getElementById('notification-message');
  
  // Устанавливаем содержимое
  titleEl.textContent = title;
  messageEl.textContent = message;
  
  // Устанавливаем иконку и стиль
  if (type === 'success') {
    icon.textContent = '✓';
    iconContainer.className = 'notification-icon success';
  } else {
    icon.textContent = '✕';
    iconContainer.className = 'notification-icon error';
  }
  
  // Показываем модальное окно
  modal.style.display = 'flex';
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
  
  // Обновляем переводы в модальном окне
  updateTranslations();
}

function hideNotification() {
  const modal = document.getElementById('notification-modal');
  modal.classList.remove('show');
  setTimeout(() => {
    modal.style.display = 'none';
  }, 300);
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
  console.log('2. Form element:', form);
  console.log('3. Form elements:', form.elements);
  
  const formData = new FormData(form);
  
  console.log('4. Form data collected');
  console.log('Raw form data:');
  for (let [key, value] of formData.entries()) {
    console.log(`  ${key}: "${value}"`);
  }
  
  console.log('5. Getting user IP...');
  const userIP = await getUserIP();
  console.log('User IP:', userIP);
  
  const data = {
    name: formData.get('name') || '',
    email: formData.get('email') || '',
    phone: formData.get('phone') || '',
    message: formData.get('message') || '',
    ip: userIP
  };
  
  console.log('6. Data prepared:', data);
  
  try {
    await sendToTelegram(data);
    console.log('7. Message sent successfully!');
    showNotification('success');
    form.reset();
  } catch (error) {
    console.error('8. Error occurred:', error);
    console.error('Error message:', error.message);
    showNotification('error');
  }
}

window.addEventListener('DOMContentLoaded', async function() {
  await loadPortfolioLangDict();
  buildPortfolioTiles();
  
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
  
  // Обработчики для модального окна уведомлений
  document.getElementById('notification-close').onclick = hideNotification;
  document.getElementById('notification-modal').addEventListener('click', function(e) {
    if (e.target === this) hideNotification();
  });
  // Скрыть спиннер после загрузки
  hideLoadingOverlay();
});

window.buildPortfolioTiles = buildPortfolioTiles;
window.loadPortfolioLangDict = loadPortfolioLangDict; 