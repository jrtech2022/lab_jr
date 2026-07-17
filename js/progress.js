/* ============================================
   PROGRESS.JS — Gamification & Persistence
   ============================================ */

const Progress = (() => {
    const STORAGE_KEY = 'labpentest_progress';

    // Trail definitions with total steps
    const trails = {
        wpa2:       { name: 'WPA2-PSK',    totalSteps: 5, color: 'var(--accent-primary)' },
        wps:        { name: 'WPS/Reaver',   totalSteps: 4, color: 'var(--accent-warning)' },
        eviltwin:   { name: 'Evil Twin',     totalSteps: 5, color: 'var(--accent-danger)' },
        pmkid:      { name: 'PMKID',         totalSteps: 4, color: 'var(--accent-purple)' },
        wireshark:  { name: 'Wireshark',     totalSteps: 4, color: '#00d4ff' },
        nmap:       { name: 'Nmap Recon',    totalSteps: 4, color: 'var(--accent-secondary)' },
        web:        { name: 'Web Auditing',  totalSteps: 4, color: 'var(--accent-pink)' },
        hydra:      { name: 'Hydra Brute',   totalSteps: 4, color: 'var(--accent-warning)' },
        metasploit: { name: 'Metasploit',    totalSteps: 4, color: 'var(--accent-danger)' },
    };

    function getProgress() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch {
            return {};
        }
    }

    function saveProgress(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('Could not save progress:', e);
        }
    }

    // Mark a step as complete
    function completeStep(trailId, stepIndex) {
        const progress = getProgress();
        if (!progress[trailId]) {
            progress[trailId] = { completed: [] };
        }
        if (!progress[trailId].completed.includes(stepIndex)) {
            progress[trailId].completed.push(stepIndex);
            progress[trailId].completed.sort((a, b) => a - b);
        }
        saveProgress(progress);
        updateUI(trailId);
        App.updateNavProgress();
    }

    // Unmark a step
    function uncompleteStep(trailId, stepIndex) {
        const progress = getProgress();
        if (!progress[trailId]) return;
        progress[trailId].completed = progress[trailId].completed.filter(i => i !== stepIndex);
        saveProgress(progress);
        updateUI(trailId);
        App.updateNavProgress();
    }

    // Toggle step completion
    function toggleStep(trailId, stepIndex) {
        const progress = getProgress();
        if (progress[trailId] && progress[trailId].completed.includes(stepIndex)) {
            uncompleteStep(trailId, stepIndex);
        } else {
            completeStep(trailId, stepIndex);
        }
    }

    // Check if a step is complete
    function isStepComplete(trailId, stepIndex) {
        const progress = getProgress();
        return progress[trailId]?.completed?.includes(stepIndex) || false;
    }

    // Get trail completion percentage
    function getTrailProgress(trailId) {
        const progress = getProgress();
        const trail = trails[trailId];
        if (!trail || !progress[trailId]) return 0;
        return Math.round((progress[trailId].completed.length / trail.totalSteps) * 100);
    }

    // Get total completed steps across all trails
    function getTotalCompleted() {
        const progress = getProgress();
        let total = 0;
        Object.values(progress).forEach(t => {
            total += (t.completed?.length || 0);
        });
        return total;
    }

    // Get total possible steps
    function getTotalSteps() {
        return Object.values(trails).reduce((sum, t) => sum + t.totalSteps, 0);
    }

    // Check if trail is complete
    function isTrailComplete(trailId) {
        return getTrailProgress(trailId) >= 100;
    }

    // Load state for current page (bind checkboxes)
    function loadPageState(trailId) {
        if (!trails[trailId]) return;

        // Bind step checkboxes
        document.querySelectorAll('.step-check input[data-step]').forEach(checkbox => {
            const stepIndex = parseInt(checkbox.getAttribute('data-step'));
            checkbox.checked = isStepComplete(trailId, stepIndex);

            // Update visual state of step block
            const stepBlock = checkbox.closest('.step-block');
            if (stepBlock) {
                stepBlock.classList.toggle('completed', checkbox.checked);
            }

            checkbox.addEventListener('change', () => {
                toggleStep(trailId, stepIndex);
                if (stepBlock) {
                    stepBlock.classList.toggle('completed', checkbox.checked);
                }
            });
        });

        // Update progress bar in trail page
        updateUI(trailId);
    }

    // Update all progress UI elements
    function updateUI(trailId) {
        // Trail-specific progress bar
        const progressBar = document.querySelector(`[data-trail-progress="${trailId}"]`);
        if (progressBar) {
            const pct = getTrailProgress(trailId);
            progressBar.style.width = `${pct}%`;
            const label = progressBar.closest('.progress-bar')?.parentElement?.querySelector('.progress-label');
            if (label) label.textContent = `${pct}%`;
        }

        // Landing page trail cards
        document.querySelectorAll(`[data-trail-card="${trailId}"]`).forEach(card => {
            const bar = card.querySelector('.progress-bar-fill');
            const label = card.querySelector('.progress-label');
            const pct = getTrailProgress(trailId);
            if (bar) bar.style.width = `${pct}%`;
            if (label) label.textContent = `${pct}%`;
        });

        // Trail completion badge
        if (isTrailComplete(trailId)) {
            const badge = document.querySelector(`[data-trail-badge="${trailId}"]`);
            if (badge) {
                badge.style.display = 'flex';
                badge.classList.add('animate-fadeInScale');
            }
        }

        // Update global nav count
        const navCount = document.getElementById('nav-progress-count');
        if (navCount) {
            navCount.textContent = getTotalCompleted();
        }
    }

    // Update all trail cards on landing page
    function updateAllCards() {
        Object.keys(trails).forEach(trailId => {
            updateUI(trailId);
        });
    }

    // Reset all progress
    function resetAll() {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
    }

    return {
        completeStep,
        uncompleteStep,
        toggleStep,
        isStepComplete,
        getTrailProgress,
        getTotalCompleted,
        getTotalSteps,
        isTrailComplete,
        loadPageState,
        updateAllCards,
        resetAll,
        trails
    };
})();
