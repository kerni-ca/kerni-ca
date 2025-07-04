function getCurrentLang() {
  return localStorage.getItem('lang') || 'fr';
}
// Устанавливаем fr по умолчанию при первом заходе
if (!localStorage.getItem('lang')) {
  localStorage.setItem('lang', 'fr');
}
function setLang(lang) {
  localStorage.setItem('lang', lang);
  loadLang();
  renderLangSwitch();
}
async function loadLang() {
  const lang = getCurrentLang();
  const res = await fetch(lang + '.json');
  const dict = await res.json();
  for (const [key, value] of Object.entries(dict)) {
    const el = document.querySelectorAll('[data-i18n="' + key + '"]');
    el.forEach(e => {
      if (e.tagName === 'INPUT' || e.tagName === 'TEXTAREA') {
        e.placeholder = value;
      } else {
        e.innerHTML = value;
      }
    });
  }
}
function renderLangSwitch() {
  const lang = getCurrentLang();
  const nextLang = lang === 'en' ? 'fr' : 'en';
  const btn = document.getElementById('lang-switch');
  if (btn) {
    btn.textContent = nextLang.toUpperCase();
    btn.onclick = function() { setLang(nextLang); };
    btn.title = lang === 'en' ? 'Passer en français' : 'Switch to English';
  }
}
window.addEventListener('DOMContentLoaded', function() {
  loadLang();
  renderLangSwitch();
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