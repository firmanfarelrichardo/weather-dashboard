/**
 * Main Application Controller for Weather Dashboard
 * Coordinates between API layer and View layer
 * Handles initialization, event listeners, and state management
 */

import { fetchWeatherData, fetchCitySuggestions, isAPIKeyConfigured } from './api.js';
import { 
    renderCurrentWeather, 
    renderForecast, 
    showLoading, 
    hideLoading,
    showError,
    renderRecentLocations,
    renderAutocomplete,
    clearSearchInput,
    getSearchInputValue,
    getElements,
    refreshIcons,
    updateUnitToggle
} from './dom.js';
import { DEFAULT_SETTINGS } from './config.js';
import { debounce, isLocalStorageAvailable } from './utils.js';
import { 
    saveToHistory, 
    getHistory, 
    removeFromHistoryByIndex,
    savePreferredUnit,
    getPreferredUnit 
} from './storage.js';

// Application State
let currentUnit = DEFAULT_SETTINGS.unit;
let currentCity = '';

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
        
        // Save current city
        currentCity = `${weatherData.city}, ${weatherData.country}`;
        
        // Add to search history using storage module
        const updatedHistory = saveToHistory(currentCity);
        renderHistoryList(updatedHistory);
        
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
        
        // Autocomplete with debounce (500ms delay)
        const debouncedAutocomplete = debounce(handleAutocomplete, 500);
        elements.searchInput.addEventListener('input', debouncedAutocomplete);
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
 * Handle autocomplete - fetches city suggestions as user types
 */
async function handleAutocomplete() {
    const query = getSearchInputValue();
    
    // Only trigger autocomplete if query is at least 2 characters
    if (!query || query.length < 2) {
        if (renderAutocomplete) {
            renderAutocomplete([]);
        }
        return;
    }
    
    try {
        const suggestions = await fetchCitySuggestions(query, 5);
        
        // Render autocomplete suggestions if function exists
        if (renderAutocomplete) {
            renderAutocomplete(suggestions, handleSuggestionClick);
        }
    } catch (error) {
        console.error('Error fetching suggestions:', error);
    }
}

/**
 * Handle autocomplete suggestion click
 * 
 * @param {Object} suggestion - Suggestion object with city data
 */
function handleSuggestionClick(suggestion) {
    if (suggestion && suggestion.name) {
        loadWeather(suggestion.name);
    }
}

/**
 * Handle unit toggle (Celsius/Fahrenheit)
 */
async function handleUnitToggle() {
    // Toggle between metric and imperial
    currentUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
    
    // Save preference using storage module
    savePreferredUnit(currentUnit);
    
    // Update UI
    updateUnitToggle(currentUnit);
    
    // Reload current weather with new unit if we have a current city
    if (currentCity) {
        const cityName = currentCity.split(',')[0].trim();
        await loadWeather(cityName);
    }
    
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
 * Render history list in the sidebar
 * 
 * @param {Array} history - Array of city names
 */
function renderHistoryList(history) {
    renderRecentLocations(
        history,
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
    const updatedHistory = removeFromHistoryByIndex(index);
    renderHistoryList(updatedHistory);
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
        // Load preferred unit using storage module
        currentUnit = getPreferredUnit();
        updateUnitToggle(currentUnit);
        
        // Load and render search history
        const history = getHistory();
        renderHistoryList(history);
        
        console.log('✓ User preferences loaded');
    } catch (error) {
        console.error('Error loading preferences:', error);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Export for testing purposes
export { init, loadWeather, handleSearch, handleUnitToggle, handleAutocomplete };
