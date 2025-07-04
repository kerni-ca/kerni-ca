// --- Динамическая генерация портфолио ---
// Пример структуры данных (можно расширять)
const portfolioData = [
  { client: 1, images: [ '1/1.jpg', '1/2.jpg', '1/3.jpg', '1/4.jpg' ] },
  { client: 2, images: [ '2/1.jpg', '2/2.jpg', '2/3.jpg', '2/4.jpg' ] },
  { client: 3, images: [ '3/1.jpg', '3/2.jpg', '3/3.jpg', '3/4.jpg' ] },
];
// Описания к фото (можно расширять)
window.portfolioDescriptions = {
  1: {
    1: "this is garage before",
    2: "this is final result of garage",
    4: "this is car inside garage with epoxy floor"
  },
  2: {
    2: "mall with epoxy magic"
  }
};

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
    tile.style.cursor = 'pointer';
    tile.style.width = '260px';
    tile.style.height = '180px';
    tile.style.overflow = 'hidden';
    tile.style.borderRadius = '12px';
    tile.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
    tile.style.background = '#f7f7f7';
    tile.style.display = 'flex';
    tile.style.alignItems = 'center';
    tile.style.justifyContent = 'center';
    tile.style.position = 'relative';
    // Картинка-заставка
    const img = document.createElement('img');
    img.src = `images/portfolio/${client.client}/0.jpg`;
    img.alt = `Client ${client.client} preview`;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.transition = 'transform 0.2s';
    tile.appendChild(img);
    // Подпись под плиткой
    let tileDesc = '';
    if (window.portfolioDescriptions[client.client] && window.portfolioDescriptions[client.client][0]) {
      tileDesc = window.portfolioDescriptions[client.client][0];
    } else {
      tileDesc = `Объект ${client.client}`;
    }
    const caption = document.createElement('div');
    caption.className = 'portfolio-tile-caption';
    caption.style.width = '100%';
    caption.style.background = 'rgba(0,0,0,0.55)';
    caption.style.color = '#fff';
    caption.style.fontWeight = '600';
    caption.style.fontSize = '1.1em';
    caption.style.padding = '12px 16px';
    caption.style.textAlign = 'center';
    caption.style.position = 'absolute';
    caption.style.left = 0;
    caption.style.right = 0;
    caption.style.bottom = 0;
    caption.textContent = tileDesc;
    tile.appendChild(caption);
    tile.addEventListener('mouseenter', () => { img.style.transform = 'scale(1.04)'; });
    tile.addEventListener('mouseleave', () => { img.style.transform = 'scale(1)'; });
    tile.onclick = () => openCarousel(clientIdx, 0);
    tiles.appendChild(tile);
  });
}

window.addEventListener('DOMContentLoaded', function() {
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