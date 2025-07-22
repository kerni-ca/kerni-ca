const fs = require('fs');
const path = require('path');

// Default language configuration
const DEFAULT_LANG = 'fr';

// Language configuration
const languages = {
  fr: {
    lang: 'fr',
    canonical: '/',
    alternateEn: '/en/',
    alternateFr: '/'
  },
  en: {
    lang: 'en',
    canonical: '/en/',
    alternateEn: '/en/',
    alternateFr: '/'
  }
};

// Load translations
function loadTranslations(lang) {
  const jsonPath = path.join(__dirname, lang + '.json');
  return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
}

function readTemplate() {
  return fs.readFileSync('index.html', 'utf8');
}

// Portfolio data structure
const portfolioData = [
  { client: 1, images: ['1/1.jpg', '1/2.jpg', '1/3.jpg', '1/4.jpg'], titleKey: 'portfolio_garage' },
  { client: 2, images: ['2/1.jpg', '2/2.jpg', '2/3.jpg', '2/4.jpg'], titleKey: 'portfolio_shop' },
  { client: 3, images: ['3/1.jpg', '3/2.jpg', '3/3.jpg', '3/4.jpg'], titleKey: 'portfolio_livingroom' },
];

function generatePortfolioTiles(html, translations, lang) {
  const portfolioTilesRegex = /<div class="portfolio-tiles"><\/div>/;
  let portfolioHTML = '';

  portfolioData.forEach((client, clientIdx) => {
    const tileDesc = translations[client.titleKey] || client.titleKey;
    const altKey = client.titleKey + '_alt';
    const altText = translations[altKey] || translations[client.titleKey] || '';

    // Fix image path for non-default language (English is in subfolder)
    const imagePath = lang === DEFAULT_LANG ? 'images/portfolio/' : '../images/portfolio/';

    portfolioHTML += `
        <div class="portfolio-tile" onclick="openCarousel(${clientIdx}, 0)">
            <img src="${imagePath}${client.client}/0.jpg" alt="${altText}" class="portfolio-tile-img">
            <div class="portfolio-tile-caption">${tileDesc}</div>
        </div>`;
  });

  return html.replace(portfolioTilesRegex, `<div class="portfolio-tiles">${portfolioHTML}</div>`);
}

function generateServicesGrid(html, translations) {
  const servicesGridRegex = /<div class="services-grid"><\/div>/;
  // Собираем все ключи services_* и services_*_desc
  const serviceKeys = Object.keys(translations)
    .filter(k => k.startsWith('services_') && !k.endsWith('_title') && !k.endsWith('_desc'));
  serviceKeys.sort();
  const servicesHTML = serviceKeys.map(key => {
    const descKey = key + '_desc';
    return `
      <div class="service-card" data-service-key="${key}">
        <h3>${translations[key]}</h3>
        <p>${translations[descKey] || ''}</p>
      </div>
    `;
  }).join('\n');
  return html.replace(servicesGridRegex, `<div class="services-grid">${servicesHTML}</div>`);
}

function generateServiceModals(translations) {
  const serviceKeys = Object.keys(translations)
    .filter(k => k.startsWith('services_') && !k.endsWith('_title') && !k.endsWith('_desc'));
  serviceKeys.sort();
  return serviceKeys.map(key => {
    const descKey = key + '_desc';
    return `
      <div id="service-modal-${key}" class="modal-overlay" style="display:none;"
           onclick="this.style.display='none';">
        <div class="modal-content service-modal-content" onclick="event.stopPropagation();">
          <button class="modal-close-button" aria-label="Close"
                  onclick="this.closest('.modal-overlay').style.display='none';">
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none"
                xmlns="http://www.w3.org/2000/svg">
              <g>
                <line x1="12" y1="12" x2="32" y2="32"
                      stroke="#fff" stroke-width="3.2"
                      stroke-linecap="round"/>
                <line x1="32" y1="12" x2="12" y2="32"
                      stroke="#fff" stroke-width="3.2"
                      stroke-linecap="round"/>
              </g>
              <defs>
                <filter id="shadow-x-service" x="0" y="0" width="44" height="44" filterUnits="userSpaceOnUse">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.45"/>
                </filter>
              </defs>
            </svg>
          </button>
          <div class="service-modal-body">
            <h3 class="modal-header">${translations[key] || ''}</h3>
            <p>${translations[descKey] || ''}</p>
          </div>
        </div>
      </div>
`;
  }).join('\n');
}

function injectServiceModals(html, translations) {
  const modalsHTML = generateServiceModals(translations);
  return html.replace('</body>', modalsHTML + '\n</body>');
}

function generateHTML(lang, config) {
  let html = readTemplate();
  const translations = loadTranslations(lang);

  // Replace lang attribute
  html = html.replace(/<html lang="[^"]*">/, `<html lang="${config.lang}">`);

  // Replace title
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${translations.meta_title}</title>`);

  // Replace meta description
  html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${translations.meta_description}">`);

  // Replace meta keywords
  html = html.replace(/<meta name="keywords" content="[^"]*">/, `<meta name="keywords" content="${translations.meta_keywords}">`);

  // Replace Open Graph tags
  html = html.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${translations.og_title}">`);
  html = html.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${translations.og_description}">`);

  // Replace Twitter tags
  html = html.replace(/<meta property="twitter:title" content="[^"]*">/, `<meta property="twitter:title" content="${translations.twitter_title}">`);
  html = html.replace(/<meta property="twitter:description" content="[^"]*">/, `<meta property="twitter:description" content="${translations.twitter_description}">`);

  // Remove lang.js
  html = html.replace(/<script src="[^"]*lang\.js[^"]*"><\/script>/, '');

  // Fix file paths for subdirectories (only for English version)
  if (lang === 'en') {
    html = html.replace(/href="styles\.css"/g, 'href="../styles.css"');
    html = html.replace(/src="config\.js"/g, 'src="../config.js"');
    html = html.replace(/src="script\.js"/g, 'src="../script.js"');
    html = html.replace(/src="portfolio\.js"/g, 'src="../portfolio.js"');
    html = html.replace(/src="sendToTelegram\.js"/g, 'src="../sendToTelegram.js"');
    html = html.replace(/src="getGeoInfo\.js"/g, 'src="../getGeoInfo.js"');
    html = html.replace(/src="images\//g, 'src="../images/');
  }

  // Apply all translations
  for (const [key, value] of Object.entries(translations)) {
    // Replace content of elements with data-i18n attributes
    const i18nRegex = new RegExp(`data-i18n="${key}"[^>]*>([^<]*)`, 'g');
    html = html.replace(i18nRegex, (match, originalText) => {
      return match.replace(originalText, value);
    });

    // Replace placeholder in input/textarea
    html = html.replace(new RegExp(`placeholder="${key}"`, 'g'), `placeholder="${value}"`);

    // Replace alt attributes
    html = html.replace(new RegExp(`data-i18n-alt="${key}"`, 'g'), `alt="${value}"`);

    // Replace text content that matches the key
    html = html.replace(new RegExp(`>${key}<`, 'g'), `>${value}<`);
  }

  // Generate portfolio tiles statically
  html = generatePortfolioTiles(html, translations, lang);
  html = generateServicesGrid(html, translations);
  html = injectServiceModals(html, translations);

  // Remove all data-i18n attributes
  html = html.replace(/data-i18n="[^"]*"/g, '');
  html = html.replace(/data-i18n-alt="[^"]*"/g, '');

  // canonical and hreflang
  const headEnd = html.indexOf('</head>');
  const seoTags = `\n    <link rel="canonical" href="${config.canonical}">\n    <link rel="alternate" hreflang="en" href="${config.alternateEn}">\n    <link rel="alternate" hreflang="fr" href="${config.alternateFr}">\n    <link rel="alternate" hreflang="x-default" href="${config.alternateEn}">\n`;
  html = html.slice(0, headEnd) + seoTags + html.slice(headEnd);

  // Add language switch button with correct redirect
  const nextLang = lang === 'en' ? 'fr' : 'en';
  const nextLangPath = lang === 'en' ? '/' : '/en/';
  const langButton = `<button id="lang-switch" class="lang-btn" onclick="window.location.href='${nextLangPath}'" title="${lang === 'en' ? 'Passer en français' : 'Switch to English'}">${nextLang.toUpperCase()}</button>`;
  html = html.replace(/<button id="lang-switch"[^>]*><\/button>/, langButton);

  return html;
}

function copyRecursiveSync(src, dest) {
  if (fs.existsSync(src) && fs.lstatSync(src).isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest);
    fs.readdirSync(src).forEach(child => {
      copyRecursiveSync(path.join(src, child), path.join(dest, child));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

function buildPages() {
  const buildDir = 'build';
  if (fs.existsSync(buildDir)) {
    try {
      fs.rmSync(buildDir, { recursive: true });
    } catch (error) {
      console.log('⚠️ Failed to delete build folder, continuing...');
    }
  }
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
  }

  // Copy resources
  ['styles.css', 'script.js', 'portfolio.js', 'config.js', 'sendToTelegram.js', 'getGeoInfo.js'].forEach(file => {
    if (fs.existsSync(file)) fs.copyFileSync(file, path.join(buildDir, file));
  });

  // Copy translation files
  ['en.json', 'fr.json'].forEach(file => {
    if (fs.existsSync(file)) fs.copyFileSync(file, path.join(buildDir, file));
  });

  // Copy CNAME file for custom domain
  if (fs.existsSync('CNAME')) fs.copyFileSync('CNAME', path.join(buildDir, 'CNAME'));

  if (fs.existsSync('images')) copyRecursiveSync('images', path.join(buildDir, 'images'));

  // Generate French version (main page)
  const frHtml = generateHTML('fr', languages.fr);
  fs.writeFileSync(path.join(buildDir, 'index.html'), frHtml);
  console.log(`✅ Created French page: ${buildDir}/index.html`);

  // Generate English version (subdirectory)
  const enDir = path.join(buildDir, 'en');
  if (!fs.existsSync(enDir)) fs.mkdirSync(enDir);
  const enHtml = generateHTML('en', languages.en);
  fs.writeFileSync(path.join(enDir, 'index.html'), enHtml);
  console.log(`✅ Created English page: ${enDir}/index.html`);

  console.log('🎉 Build completed!');
  console.log('📁 File structure:');
  console.log('   build/index.html - French version (main)');
  console.log('   build/en/index.html - English version');
}

buildPages(); 