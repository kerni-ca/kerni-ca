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
  if (window.loadPortfolioLangDict && window.buildPortfolioTiles) {
    window.loadPortfolioLangDict().then(window.buildPortfolioTiles);
  }
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
}); 