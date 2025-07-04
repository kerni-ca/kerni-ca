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

window.addEventListener('DOMContentLoaded', async function() {
  await loadPortfolioLangDict();
  buildPortfolioTiles();
  // Кнопки навигации и закрытия
  document.getElementById('carousel-close').onclick = closeCarousel;
  document.getElementById('carousel-prev').onclick = function() { showCarouselImg(currentCarouselIndex - 1); };
  document.getElementById('carousel-next').onclick = function() { showCarouselImg(currentCarouselIndex + 1); };
  // Закрытие по клику вне картинки
  document.getElementById('carousel-modal').addEventListener('click', function(e) {
    if (e.target === this) closeCarousel();
  });
});

window.buildPortfolioTiles = buildPortfolioTiles;
window.loadPortfolioLangDict = loadPortfolioLangDict; 