// Default language configuration
const DEFAULT_LANG = 'fr';

// Portfolio carousel functionality
let currentClient = 0;
let currentCarouselIndex = 0;
let currentCarouselImages = [];

// Portfolio data structure (same as in build.js)
const portfolioData = [
  { client: 1, images: [ '1/1.jpg', '1/2.jpg', '1/3.jpg', '1/4.jpg' ], titleKey: 'portfolio_garage' },
  { client: 2, images: [ '2/1.jpg', '2/2.jpg', '2/3.jpg', '2/4.jpg' ], titleKey: 'portfolio_shop' },
  { client: 3, images: [ '3/1.jpg', '3/2.jpg', '3/3.jpg', '3/4.jpg' ], titleKey: 'portfolio_livingroom' },
];

// Global translation dictionary
window.i18nDict = {};

function getCurrentLang() {
  if (window.location.pathname.includes('/en/')) return 'en';
  return DEFAULT_LANG;
}

async function loadPortfolioLangDict() {
  const lang = getCurrentLang();
  const isSubfolder = window.location.pathname.includes('/en/');
  const jsonPath = isSubfolder ? '../' + lang + '.json' : lang + '.json';
  
  try {
    const res = await fetch(jsonPath);
    if (res.ok) {
      window.i18nDict = await res.json();
    } else {
      console.warn('Failed to load translations, using fallbacks');
      window.i18nDict = {};
    }
  } catch (error) {
    console.warn('Error loading translations:', error);
    window.i18nDict = {};
  }
}

function getCarouselImages(clientIdx) {
  const item = portfolioData[clientIdx];
  if (!item) return [];
  return item.images
    .map((img, idx) => {
      // In static build, we need to get descriptions from the generated HTML
      // or use fallback descriptions
      const desc = getImageDescription(clientIdx, idx);
      return img ? { img, desc, idx } : null;
    })
    .filter(Boolean);
}

function getImagePath(img) {
  const currentLang = getCurrentLang();
  const basePath = currentLang === DEFAULT_LANG ? 'images/portfolio/' : '../images/portfolio/';
  return basePath + img;
}

function getImageDescription(clientIdx, imgIdx) {
  const item = portfolioData[clientIdx];
  if (!item) return `Photo ${imgIdx + 1}`;
  
  const baseKey = item.titleKey;
  const photoKey = baseKey + '_' + (imgIdx + 1);
  
  // Try to get description from translations
  if (window.i18nDict && window.i18nDict[photoKey]) {
    return window.i18nDict[photoKey];
  }
  
  // Fallback to base key translation
  if (window.i18nDict && window.i18nDict[baseKey]) {
    return window.i18nDict[baseKey];
  }
  
  return `Photo ${imgIdx + 1}`;
}

window.openCarousel = function(clientIdx, index) {
  currentClient = clientIdx;
  currentCarouselImages = getCarouselImages(clientIdx);
  if (!currentCarouselImages.length) return;
  currentCarouselIndex = index;
  updateCarouselImg();
  const modal = document.getElementById('carousel-modal');
  if (modal) modal.style.display = 'flex';
}

function closeCarousel() {
  const modal = document.getElementById('carousel-modal');
  if (modal) modal.style.display = 'none';
}

function showCarouselImg(direction) {
  if (!currentCarouselImages.length) return;
  
  if (direction === 1) {
    // Next image
    currentCarouselIndex = (currentCarouselIndex + 1) % currentCarouselImages.length;
  } else if (direction === -1) {
    // Previous image
    currentCarouselIndex = (currentCarouselIndex - 1 + currentCarouselImages.length) % currentCarouselImages.length;
  }
  
  updateCarouselImg();
}

function updateCarouselImg() {
  if (!currentCarouselImages.length) {
    const img = document.getElementById('carousel-img');
    const desc = document.getElementById('carousel-desc');
    if (img) img.src = '';
    if (img) img.alt = '';
    if (desc) desc.textContent = '';
    return;
  }
  const { img, desc, idx } = currentCarouselImages[currentCarouselIndex];
  const item = portfolioData[currentClient];
  const baseKey = item.titleKey;
  const altKey = baseKey + '_alt_' + (idx + 1);
  const imgElement = document.getElementById('carousel-img');
  const descElement = document.getElementById('carousel-desc');
  
  if (imgElement) imgElement.src = getImagePath(img);
  if (imgElement) imgElement.alt = window.i18nDict[altKey] || desc || window.i18nDict[baseKey] || '';
  if (descElement) descElement.textContent = desc;
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  await loadPortfolioLangDict();
  
  // Add carousel event listeners
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const closeBtn = document.getElementById('carousel-close');
  
  if (prevBtn) prevBtn.addEventListener('click', () => showCarouselImg(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => showCarouselImg(1));
  if (closeBtn) closeBtn.addEventListener('click', closeCarousel);
  
  // Close carousel on background click
  const modal = document.getElementById('carousel-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeCarousel();
    });
  }
  
  // Add hover effects to portfolio tiles
  const tiles = document.querySelectorAll('.portfolio-tile');
  tiles.forEach(tile => {
    const img = tile.querySelector('.portfolio-tile-img');
    if (img) {
      tile.addEventListener('mouseenter', () => { img.classList.add('hovered'); });
      tile.addEventListener('mouseleave', () => { img.classList.remove('hovered'); });
    }
  });
});

// Export functions for use in other scripts
window.portfolio = {
  openCarousel,
  closeCarousel,
  showCarouselImg
}; 