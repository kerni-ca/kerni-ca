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

let currentClient = 0;
let currentCarouselIndex = 0;

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

function openCarousel(client, index) {
  currentClient = client;
  currentCarouselIndex = index;
  updateCarouselImg();
  document.getElementById('carousel-modal').style.display = 'flex';
}
function closeCarousel() {
  document.getElementById('carousel-modal').style.display = 'none';
}
function showCarouselImg(index) {
  const images = portfolioData[currentClient].images;
  currentCarouselIndex = (index + images.length) % images.length;
  updateCarouselImg();
}
function updateCarouselImg() {
  const imgPath = 'images/portfolio/' + portfolioData[currentClient].images[currentCarouselIndex];
  document.getElementById('carousel-img').src = imgPath;
  // Описание
  const clientNum = portfolioData[currentClient].client;
  const desc = (window.portfolioDescriptions[clientNum] && window.portfolioDescriptions[clientNum][currentCarouselIndex+1])
    ? window.portfolioDescriptions[clientNum][currentCarouselIndex+1]
    : '';
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
    img.alt = `Client ${client.client} preview`;
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