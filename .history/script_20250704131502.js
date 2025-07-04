// --- Карусель портфолио ---
const portfolioImages = [
  'images/portfolio1.jpg',
  'images/portfolio2.jpg',
  'images/portfolio3.jpg'
];
let currentCarouselIndex = 0;

function openCarousel(index) {
  currentCarouselIndex = index;
  document.getElementById('carousel-img').src = portfolioImages[index];
  document.getElementById('carousel-modal').style.display = 'flex';
}
function closeCarousel() {
  document.getElementById('carousel-modal').style.display = 'none';
}
function showCarouselImg(index) {
  currentCarouselIndex = (index + portfolioImages.length) % portfolioImages.length;
  document.getElementById('carousel-img').src = portfolioImages[currentCarouselIndex];
}
window.addEventListener('DOMContentLoaded', function() {
  // Клик по плиткам портфолио
  document.querySelectorAll('.portfolio-item').forEach(function(item) {
    item.addEventListener('click', function() {
      openCarousel(Number(item.getAttribute('data-index')));
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