/* ============================================
   COMPONENTS.JS — Reusable UI Components
   ============================================ */

const Components = (() => {
    
    // ---- Toast Notifications ---- 
    function toast(message, type = 'info') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const icons = {
            success: 'fa-check',
            error: 'fa-times',
            info: 'fa-info',
            warning: 'fa-exclamation'
        };

        const toastEl = document.createElement('div');
        toastEl.className = `toast toast-${type}`;
        toastEl.innerHTML = `
            <div class="toast-icon"><i class="fa-solid ${icons[type] || icons.info}"></i></div>
            <span>${message}</span>
        `;

        container.appendChild(toastEl);

        // Auto-remove
        setTimeout(() => {
            toastEl.classList.add('toast-exit');
            setTimeout(() => toastEl.remove(), 300);
        }, 2500);
    }

    // ---- Modal ----
    function openModal(id) {
        const modal = document.getElementById(id);
        if (!modal) return;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(id) {
        const modal = document.getElementById(id);
        if (!modal) return;
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    function toggleModal(id) {
        const modal = document.getElementById(id);
        if (!modal) return;
        if (modal.classList.contains('active')) {
            closeModal(id);
        } else {
            openModal(id);
        }
    }

    // Close modal on overlay click
    function setupModals() {
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.classList.remove('active');
                    document.body.style.overflow = 'auto';
                }
            });
        });

        // Close buttons
        document.querySelectorAll('.btn-close[data-modal]').forEach(btn => {
            btn.addEventListener('click', () => {
                closeModal(btn.getAttribute('data-modal'));
            });
        });

        // ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-overlay.active').forEach(m => {
                    m.classList.remove('active');
                    document.body.style.overflow = 'auto';
                });
            }
        });
    }

    // ---- Accordions ----
    function setupAccordions() {
        document.querySelectorAll('.accordion-trigger').forEach(trigger => {
            trigger.addEventListener('click', () => {
                const item = trigger.closest('.accordion-item');
                const isOpen = item.classList.contains('open');
                
                // Close others in same group
                const group = item.closest('.accordion-group');
                if (group) {
                    group.querySelectorAll('.accordion-item.open').forEach(openItem => {
                        if (openItem !== item) {
                            openItem.classList.remove('open');
                        }
                    });
                }
                
                item.classList.toggle('open', !isOpen);
            });
        });
    }

    // ---- Tabs ----
    function setupTabs() {
        document.querySelectorAll('.tabs').forEach(tabsContainer => {
            const tabs = tabsContainer.querySelectorAll('.tab');
            const group = tabsContainer.getAttribute('data-tab-group');

            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const target = tab.getAttribute('data-tab-target');

                    // Deactivate all tabs
                    tabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');

                    // Show target content
                    if (group) {
                        document.querySelectorAll(`.tab-content[data-tab-group="${group}"]`).forEach(c => {
                            c.classList.remove('active');
                        });
                        const targetContent = document.querySelector(`.tab-content[data-tab-target="${target}"]`);
                        if (targetContent) targetContent.classList.add('active');
                    }
                });
            });
        });
    }

    // ---- Search/Filter ----
    function setupSearch() {
        document.querySelectorAll('.search-box input[data-search-target]').forEach(input => {
            const targetSelector = input.getAttribute('data-search-target');

            input.addEventListener('input', () => {
                const query = input.value.toLowerCase().trim();
                const items = document.querySelectorAll(targetSelector);

                items.forEach(item => {
                    const text = (item.getAttribute('data-search-text') || item.textContent).toLowerCase();
                    const match = !query || text.includes(query);
                    item.style.display = match ? '' : 'none';
                });

                // Update count
                const countEl = input.closest('.search-box')?.querySelector('.search-count');
                if (countEl) {
                    const visible = document.querySelectorAll(`${targetSelector}:not([style*="display: none"])`).length;
                    countEl.textContent = `${visible} resultados`;
                }
            });
        });
    }

    // ---- Initialize all components ----
    function initAll() {
        setupModals();
        setupAccordions();
        setupTabs();
        setupSearch();
    }

    return {
        toast,
        openModal,
        closeModal,
        toggleModal,
        setupModals,
        setupAccordions,
        setupTabs,
        setupSearch,
        initAll
    };
})();

// Auto-init on load
document.addEventListener('DOMContentLoaded', () => {
    Components.initAll();
});
