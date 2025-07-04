function getCurrentLang() {
  if (window.location.pathname.includes('/en/')) return 'en';
  return 'fr';
}

function setLang(lang) {
  window.location.href = '/build/' + lang + '/';
}

async function loadLang() {
  const lang = getCurrentLang();
  const isSubfolder = window.location.pathname.includes('/fr/') || window.location.pathname.includes('/en/');
  const jsonPath = isSubfolder ? '../' + lang + '.json' : lang + '.json';
  const res = await fetch(jsonPath);
  const dict = await res.json();
      // Update <title> and <meta name='description'>
  if (dict.title) {
    document.title = dict.title;
    const titleTag = document.querySelector('title[data-i18n="title"]');
    if (titleTag) titleTag.textContent = dict.title;
  }
  if (dict.description) {
    const descTag = document.querySelector('meta[name="description"][data-i18n="description"]');
    if (descTag) descTag.setAttribute('content', dict.description);
  }
  for (const [key, value] of Object.entries(dict)) {
    const el = document.querySelectorAll('[data-i18n="' + key + '"]');
    el.forEach(e => {
      if (e.tagName === 'INPUT' || e.tagName === 'TEXTAREA') {
        e.placeholder = value;
      } else {
        e.innerHTML = value;
      }
    });
    // alt attributes
    const altEls = document.querySelectorAll('[data-i18n-alt="' + key + '"]');
    altEls.forEach(e => {
      e.alt = value;
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
}); 