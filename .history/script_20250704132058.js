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
window.addEventListener('DOMContentLoaded', function() {
  buildPortfolioGrid();
  // Клик по плиткам портфолио
  document.querySelectorAll('.portfolio-grid').addEventListener ?
    document.querySelectorAll('.portfolio-grid').forEach(function(grid) {
      grid.addEventListener('click', function(e) {
        const item = e.target.closest('.portfolio-item');
        if (item) {
          const client = Number(item.getAttribute('data-client'));
          const index = Number(item.getAttribute('data-index'));
          openCarousel(client, index);
        }
      });
    }) :
    document.querySelector('.portfolio-grid').addEventListener('click', function(e) {
      const item = e.target.closest('.portfolio-item');
      if (item) {
        const client = Number(item.getAttribute('data-client'));
        const index = Number(item.getAttribute('data-index'));
        openCarousel(client, index);
      }
    });
  // Кнопки навигации и закрытия
  document.getElementById('carousel-close').onclick = closeCarousel;
  document.getElementById('carousel-prev').onclick = function() { showCarouselImg(currentCarouselIndex - 1); };
  document.getElementById('carousel-next').onclick = function() { showCarouselImg(currentCarouselIndex + 1); };
  // Закрытие по клику вне картинки
  document.getElementById('carousel-modal').addEventListener('click', function(e) {
    if (e.target === this) closeCarousel();
  });
}); 