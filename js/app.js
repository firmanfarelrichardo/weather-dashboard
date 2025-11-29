document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    console.log('🌤️ Weather Dashboard - Initializing...');
    
    initializeLucideIcons();
    
    console.log('✅ Weather Dashboard - Ready!');
}

function initializeLucideIcons() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
        console.log('✓ Lucide icons initialized');
    } else {
        console.error('❌ Lucide library not loaded');
    }
}

function setupEventListeners() {
    console.log('Event listeners will be set up here');
}

function loadUserPreferences() {
    console.log('User preferences will be loaded here');
}

export { initializeApp, initializeLucideIcons };
