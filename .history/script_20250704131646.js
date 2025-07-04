// --- Карусель портфолио для нескольких клиентов ---
const portfolioImages = [
  [ // Клиент 1
    'images/client1_1.jpg',
    'images/client1_2.jpg',
    'images/client1_3.jpg',
    'images/client1_4.jpg'
  ],
  [ // Клиент 2
    'images/client2_1.jpg',
    'images/client2_2.jpg',
    'images/client2_3.jpg',
    'images/client2_4.jpg'
  ],
  [ // Клиент 3
    'images/client3_1.jpg',
    'images/client3_2.jpg',
    'images/client3_3.jpg',
    'images/client3_4.jpg'
  ]
];
let currentClient = 0;
let currentCarouselIndex = 0;

function openCarousel(client, index) {
  currentClient = client;
  currentCarouselIndex = index;
  document.getElementById('carousel-img').src = portfolioImages[client][index];
  document.getElementById('carousel-modal').style.display = 'flex';
}
function closeCarousel() {
  document.getElementById('carousel-modal').style.display = 'none';
}
function showCarouselImg(index) {
  const images = portfolioImages[currentClient];
  currentCarouselIndex = (index + images.length) % images.length;
  document.getElementById('carousel-img').src = images[currentCarouselIndex];
}
window.addEventListener('DOMContentLoaded', function() {
  // Клик по плиткам портфолио
  document.querySelectorAll('.portfolio-item').forEach(function(item) {
    item.addEventListener('click', function() {
      const client = Number(item.getAttribute('data-client'));
      const index = Number(item.getAttribute('data-index'));
      openCarousel(client, index);
    });
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