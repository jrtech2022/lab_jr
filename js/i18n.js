/* ============================================
   I18N.JS — Bilingual Support (PT-BR / EN)
   ============================================ */

const I18n = (() => {
    const STORAGE_KEY = 'labpentest_lang';
    let currentLang = 'pt';

    function init() {
        // Load saved preference
        const saved = localStorage.getItem(STORAGE_KEY);
        currentLang = saved || 'pt';
        apply();
        setupToggle();
    }

    function apply() {
        document.documentElement.setAttribute('data-lang', currentLang);

        // Show/hide elements based on language
        document.querySelectorAll('[data-lang-pt]').forEach(el => {
            el.style.display = currentLang === 'pt' ? '' : 'none';
        });
        document.querySelectorAll('[data-lang-en]').forEach(el => {
            el.style.display = currentLang === 'en' ? '' : 'none';
        });

        // Update toggle button text
        const btn = document.getElementById('lang-toggle');
        if (btn) {
            btn.innerHTML = currentLang === 'pt'
                ? '<i class="fa-solid fa-globe"></i> EN'
                : '<i class="fa-solid fa-globe"></i> PT';
        }

        // Update html lang attribute
        document.documentElement.lang = currentLang === 'pt' ? 'pt-BR' : 'en';
    }

    function toggle() {
        currentLang = currentLang === 'pt' ? 'en' : 'pt';
        localStorage.setItem(STORAGE_KEY, currentLang);
        apply();
    }

    function setupToggle() {
        const btn = document.getElementById('lang-toggle');
        if (btn) {
            btn.addEventListener('click', toggle);
        }
    }

    function getLang() {
        return currentLang;
    }

    // Call apply on dynamic content (after SPA page load)
    function applyToNewContent() {
        apply();
    }

    return { init, toggle, apply: applyToNewContent, getLang };
})();

document.addEventListener('DOMContentLoaded', () => {
    I18n.init();
});
