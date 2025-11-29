/**
 * Main Application Controller for Weather Dashboard
 * Coordinates between API layer and View layer
 * Handles initialization, event listeners, and state management
 */

import { fetchWeatherData, isAPIKeyConfigured } from './api.js';
import { 
    renderCurrentWeather, 
    renderForecast, 
    showLoading, 
    hideLoading,
    showError,
    renderRecentLocations,
    clearSearchInput,
    getSearchInputValue,
    getElements,
    refreshIcons,
    updateUnitToggle
} from './dom.js';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from './config.js';
import { debounce, isLocalStorageAvailable } from './utils.js';

// Application State
let currentUnit = DEFAULT_SETTINGS.unit;
let searchHistory = [];

/**
 * Initialize the application
 */
async function init() {
    console.log('🌤️ Weather Dashboard - Initializing...');
    
    // Initialize Lucide icons
    initializeLucideIcons();
    
    // Load user preferences
    loadUserPreferences();
    
    // Setup event listeners
    setupEventListeners();
    
    // Check API key configuration
    if (!isAPIKeyConfigured()) {
        showError('API Key not configured. Please add your OpenWeatherMap API key in config.js');
        console.error('❌ API Key not configured');
        return;
    }
    
    // Load default city weather on startup
    await loadDefaultWeather();
    
    console.log('✅ Weather Dashboard - Ready!');
}

/**
 * Initialize Lucide icons
 */
function initializeLucideIcons() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
        console.log('✓ Lucide icons initialized');
    } else {
        console.error('❌ Lucide library not loaded');
    }
}

/**
 * Load weather for default city
 */
async function loadDefaultWeather() {
    try {
        await loadWeather(DEFAULT_SETTINGS.city);
    } catch (error) {
        console.error('Failed to load default weather:', error);
        showError(error.message);
    }
}

/**
 * Load weather data for a specific city
 * 
 * @param {string} city - City name to fetch weather for
 */
async function loadWeather(city) {
    if (!city || city.trim() === '') {
        showError('Please enter a city name');
        return;
    }
    
    try {
        showLoading();
        
        const weatherData = await fetchWeatherData(city, currentUnit);
        
        // Render current weather
        renderCurrentWeather(weatherData.current, currentUnit);
        
        // Render forecast
        renderForecast(weatherData.forecast.list, currentUnit);
        
        // Add to search history
        addToSearchHistory(`${weatherData.city}, ${weatherData.country}`);
        
        // Clear search input
        clearSearchInput();
        
        hideLoading();
        
        console.log('✓ Weather data loaded successfully for:', city);
    } catch (error) {
        hideLoading();
        console.error('Error loading weather:', error);
        showError(error.message);
    }
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    const elements = getElements();
    
    // Search button click
    if (elements.searchBtn) {
        elements.searchBtn.addEventListener('click', handleSearch);
    }
    
    // Search input - Enter key
    if (elements.searchInput) {
        elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
    
    // Unit toggle button
    if (elements.unitToggleBtn) {
        elements.unitToggleBtn.addEventListener('click', handleUnitToggle);
    }
    
    // Theme toggle button (placeholder for future implementation)
    if (elements.themeToggleBtn) {
        elements.themeToggleBtn.addEventListener('click', handleThemeToggle);
    }
    
    console.log('✓ Event listeners configured');
}

/**
 * Handle search button click
 */
function handleSearch() {
    const city = getSearchInputValue();
    if (city) {
        loadWeather(city);
    }
}

/**
 * Handle unit toggle (Celsius/Fahrenheit)
 */
async function handleUnitToggle() {
    // Toggle between metric and imperial
    currentUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
    
    // Save preference
    saveUnitPreference(currentUnit);
    
    // Update UI
    updateUnitToggle(currentUnit);
    
    // Reload current weather with new unit
    const city = getSearchInputValue() || DEFAULT_SETTINGS.city;
    await loadWeather(city);
    
    console.log('✓ Unit toggled to:', currentUnit);
}

/**
 * Handle theme toggle (placeholder)
 */
function handleThemeToggle() {
    console.log('Theme toggle - To be implemented');
    // TODO: Implement dark/light theme toggle
}

/**
 * Add city to search history
 * 
 * @param {string} location - Location string (e.g., "Jakarta, ID")
 */
function addToSearchHistory(location) {
    // Remove if already exists (to move it to top)
    searchHistory = searchHistory.filter(item => item !== location);
    
    // Add to beginning of array
    searchHistory.unshift(location);
    
    // Limit to max items
    if (searchHistory.length > DEFAULT_SETTINGS.maxHistoryItems) {
        searchHistory = searchHistory.slice(0, DEFAULT_SETTINGS.maxHistoryItems);
    }
    
    // Save to localStorage
    saveSearchHistory();
    
    // Update UI
    renderRecentLocations(
        searchHistory,
        handleLocationClick,
        handleLocationRemove
    );
}

/**
 * Handle recent location click
 * 
 * @param {string} location - Location string
 */
function handleLocationClick(location) {
    // Extract city name (before comma)
    const city = location.split(',')[0].trim();
    loadWeather(city);
}

/**
 * Handle remove location from history
 * 
 * @param {number} index - Index of location to remove
 */
function handleLocationRemove(index) {
    searchHistory.splice(index, 1);
    saveSearchHistory();
    renderRecentLocations(
        searchHistory,
        handleLocationClick,
        handleLocationRemove
    );
}

/**
 * Load user preferences from localStorage
 */
function loadUserPreferences() {
    if (!isLocalStorageAvailable()) {
        console.warn('localStorage not available');
        return;
    }
    
    try {
        // Load preferred unit
        const savedUnit = localStorage.getItem(STORAGE_KEYS.PREFERRED_UNIT);
        if (savedUnit && (savedUnit === 'metric' || savedUnit === 'imperial')) {
            currentUnit = savedUnit;
            updateUnitToggle(currentUnit);
        }
        
        // Load search history
        const savedHistory = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
        if (savedHistory) {
            searchHistory = JSON.parse(savedHistory);
            renderRecentLocations(
                searchHistory,
                handleLocationClick,
                handleLocationRemove
            );
        }
        
        console.log('✓ User preferences loaded');
    } catch (error) {
        console.error('Error loading preferences:', error);
    }
}

/**
 * Save unit preference to localStorage
 * 
 * @param {string} unit - Unit to save ('metric' or 'imperial')
 */
function saveUnitPreference(unit) {
    if (!isLocalStorageAvailable()) return;
    
    try {
        localStorage.setItem(STORAGE_KEYS.PREFERRED_UNIT, unit);
    } catch (error) {
        console.error('Error saving unit preference:', error);
    }
}

/**
 * Save search history to localStorage
 */
function saveSearchHistory() {
    if (!isLocalStorageAvailable()) return;
    
    try {
        localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(searchHistory));
    } catch (error) {
        console.error('Error saving search history:', error);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Export for testing purposes
export { init, loadWeather, handleSearch, handleUnitToggle };
