/* ============================================
   APP.JS — SPA Router & Initialization
   ============================================ */

const App = (() => {
    const PAGES_DIR = 'pages/';
    const pageCache = {};
    let currentPage = null;

    // Route definitions
    const routes = {
        '':          { file: null, title: 'Início' },
        'home':      { file: null, title: 'Início' },
        'wpa2':      { file: 'trilha-wpa2.html', title: 'Trilha WPA2-PSK' },
        'wps':       { file: 'trilha-wps.html', title: 'Trilha WPS' },
        'eviltwin':  { file: 'trilha-eviltwin.html', title: 'Trilha Evil Twin' },
        'pmkid':     { file: 'trilha-pmkid.html', title: 'Trilha PMKID' },
        'wireshark': { file: 'trilha-wireshark.html', title: 'Trilha Decodificação Wireshark' },
        'nmap':      { file: 'trilha-nmap.html', title: 'Trilha Nmap Recon' },
        'web':       { file: 'trilha-web.html', title: 'Trilha Web Auditing' },
        'hydra':     { file: 'trilha-hydra.html', title: 'Trilha Hydra Brute Force' },
        'metasploit': { file: 'trilha-metasploit.html', title: 'Trilha Metasploit' },
        'arsenal':   { file: 'arsenal.html', title: 'Arsenal de Ferramentas' },
        'knowledge': { file: 'knowledge.html', title: 'Base de Conhecimento' }
    };

    // Initialize the app
    function init() {
        setupNavToggle();
        setupScrollReveal();
        setupScrollTop();
        updateNavProgress();

        // Listen for hash changes
        window.addEventListener('hashchange', handleRoute);

        // Initial route
        handleRoute();
    }

    // Handle routing
    function handleRoute() {
        const hash = window.location.hash.replace('#/', '').replace('#', '') || 'home';
        const route = routes[hash];
        const pageContent = document.getElementById('page-content');

        if (!route || !route.file) {
            // Show landing page (it's already in the HTML)
            document.getElementById('landing-page').style.display = 'block';
            if (pageContent) pageContent.style.display = 'none';
            currentPage = 'home';
            updateActiveNav('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // Hide landing, show page content
        document.getElementById('landing-page').style.display = 'none';
        if (pageContent) {
            pageContent.style.display = 'block';
            loadPage(route.file, pageContent, hash);
        }
    }

    // Load page via template or fallback to fetch
    async function loadPage(file, container, hash) {
        container.classList.add('page-loading');

        // Check if there is a local template for this page
        const localTemplate = document.getElementById(`template-${hash}`);
        if (localTemplate) {
            container.innerHTML = localTemplate.innerHTML;
            container.classList.remove('page-loading');
            
            // Re-initialize page-specific features
            initializePageFeatures(hash);
            return;
        }

        // Detect file:// protocol — fetch won't work due to CORS
        const isFileProtocol = window.location.protocol === 'file:';

        if (isFileProtocol) {
            // Fallback: redirect directly to the HTML file
            window.location.href = PAGES_DIR + file + '#/' + hash;
            return;
        }

        try {
            let html;
            if (pageCache[file]) {
                html = pageCache[file];
            } else {
                const response = await fetch(PAGES_DIR + file);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                html = await response.text();
                pageCache[file] = html;
            }

            container.innerHTML = html;
            container.classList.remove('page-loading');

            // Re-initialize page-specific features
            initializePageFeatures(hash);
        } catch (err) {
            container.innerHTML = `
                <div class="container-narrow" style="padding-top: var(--space-16); text-align: center;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size: 3rem; color: var(--accent-danger); margin-bottom: var(--space-4);"></i>
                    <h2>Erro ao carregar página</h2>
                    <p class="text-muted" style="margin-top: var(--space-2);">Não foi possível carregar: ${file}</p>
                    <p class="text-muted text-sm" style="margin-top: var(--space-2);">${err.message}</p>
                    <p class="text-muted text-sm" style="margin-top: var(--space-4);">
                        <span data-lang-pt>Para navegação SPA, sirva com: <code>npx serve .</code> ou <code>python -m http.server</code></span>
                        <span data-lang-en>For SPA navigation, serve with: <code>npx serve .</code> or <code>python -m http.server</code></span>
                    </p>
                    <a href="#/home" class="btn btn-outline" style="margin-top: var(--space-6);">
                        <i class="fa-solid fa-arrow-left"></i> Voltar ao Início
                    </a>
                </div>
            `;
            container.classList.remove('page-loading');
        }
    }

    function initializePageFeatures(hash) {
        updateActiveNav(hash);
        setupScrollReveal();
        Commands.init();
        Components.setupAccordions();
        Components.setupModals();
        Components.setupSearch();
        I18n.apply();
        Progress.loadPageState(hash);

        // Update page title
        const route = routes[hash];
        if (route) {
            document.title = `${route.title} | Lab Pentest Wi-Fi`;
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Update active nav link
    function updateActiveNav(hash) {
        document.querySelectorAll('.nav-links a').forEach(a => {
            a.classList.remove('active');
            const href = a.getAttribute('href') || '';
            const linkHash = href.replace('#/', '').replace('#', '');
            if (linkHash === hash || (hash === 'home' && linkHash === '')) {
                a.classList.add('active');
            }
        });
    }

    // Mobile nav toggle
    function setupNavToggle() {
        const toggle = document.getElementById('nav-toggle');
        const links = document.getElementById('nav-links');
        if (!toggle || !links) return;

        toggle.addEventListener('click', () => {
            links.classList.toggle('open');
            const icon = toggle.querySelector('i');
            icon.className = links.classList.contains('open') 
                ? 'fa-solid fa-times' 
                : 'fa-solid fa-bars';
        });

        // Close menu when clicking a link
        links.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                links.classList.remove('open');
                const icon = toggle.querySelector('i');
                icon.className = 'fa-solid fa-bars';
            });
        });
    }

    // Scroll-triggered reveals (Intersection Observer)
    function setupScrollReveal() {
        const elements = document.querySelectorAll('.reveal:not(.is-visible), .reveal-left:not(.is-visible)');
        if (!elements.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        });

        elements.forEach(el => observer.observe(el));
    }

    // Scroll to top button
    function setupScrollTop() {
        const btn = document.getElementById('scroll-top');
        if (!btn) return;

        window.addEventListener('scroll', () => {
            btn.classList.toggle('visible', window.scrollY > 400);
        });

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Update nav progress indicator
    function updateNavProgress() {
        const el = document.getElementById('nav-progress-count');
        if (!el) return;
        const total = Progress.getTotalCompleted();
        el.textContent = total;
    }

    // Navigate programmatically
    function navigateTo(hash) {
        window.location.hash = `#/${hash}`;
    }

    return { init, navigateTo, updateNavProgress, setupScrollReveal };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
