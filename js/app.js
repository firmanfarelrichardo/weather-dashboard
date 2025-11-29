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
    getPreferredUnit,
    saveThemePreference,
    getThemePreference
} from './storage.js';

let currentUnit = DEFAULT_SETTINGS.unit;
let currentCity = '';
let currentWeatherData = null;

async function init() {
    console.log('🌤️ Weather Dashboard - Initializing...');
    
    initializeTheme();
    
    initializeLucideIcons();
    
    loadUserPreferences();
    
    setupEventListeners();
    
    if (!isAPIKeyConfigured()) {
        showError('API Key not configured. Please add your OpenWeatherMap API key in config.js');
        console.error('❌ API Key not configured');
        return;
    }
    
    console.log('✅ Weather Dashboard - Ready!');
    console.log('💡 Cari kota untuk melihat data cuaca');
}

function initializeTheme() {
    const savedTheme = getThemePreference();
    
    if (!savedTheme || savedTheme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDark ? 'dark' : 'light');
    } else {
        applyTheme(savedTheme);
    }
}

function initializeLucideIcons() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
        console.log('✓ Lucide icons initialized');
    } else {
        console.error('❌ Lucide library not loaded');
    }
}

async function loadWeather(city) {
    if (!city || city.trim() === '') {
        showError('Masukkan nama kota');
        return;
    }
    
    try {
        showLoading();
        
        const weatherData = await fetchWeatherData(city, currentUnit);
        
        currentWeatherData = weatherData;
        
        renderCurrentWeather(weatherData.current, currentUnit);
        
        renderForecast(weatherData.forecast.list, currentUnit);
        
        currentCity = `${weatherData.city}, ${weatherData.country}`;
        
        const updatedHistory = saveToHistory(currentCity);
        renderHistoryList(updatedHistory);
        
        clearSearchInput();
        
        hideLoading();
        
        console.log('✓ Weather data loaded successfully for:', city);
    } catch (error) {
        hideLoading();
        console.error('Error loading weather:', error);
        showError(error.message);
    }
}

function setupEventListeners() {
    const elements = getElements();
    
    if (elements.searchBtn) {
        elements.searchBtn.addEventListener('click', handleSearch);
    }
    
    if (elements.searchInput) {
        elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
        
        const debouncedAutocomplete = debounce(handleAutocomplete, 500);
        elements.searchInput.addEventListener('input', debouncedAutocomplete);
    }
    
    if (elements.refreshBtn) {
        elements.refreshBtn.addEventListener('click', handleRefresh);
    }
    
    if (elements.unitToggleBtn) {
        elements.unitToggleBtn.addEventListener('click', handleUnitToggle);
    }
    
    if (elements.themeToggleBtn) {
        elements.themeToggleBtn.addEventListener('click', handleThemeToggle);
    }
    
    console.log('✓ Event listeners configured');
}

function handleSearch() {
    const city = getSearchInputValue();
    if (city) {
        loadWeather(city);
    }
}

async function handleAutocomplete() {
    const query = getSearchInputValue();
    
    if (!query || query.length < 2) {
        if (renderAutocomplete) {
            renderAutocomplete([]);
        }
        return;
    }
    
    try {
        const suggestions = await fetchCitySuggestions(query, 5);
        
        if (renderAutocomplete) {
            renderAutocomplete(suggestions, handleSuggestionClick);
        }
    } catch (error) {
        console.error('Error fetching suggestions:', error);
    }
}

function handleSuggestionClick(suggestion) {
    if (suggestion && suggestion.name) {
        loadWeather(suggestion.name);
    }
}

async function handleUnitToggle() {
    const newUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
    
    if (!currentCity) {
        currentUnit = newUnit;
        savePreferredUnit(currentUnit);
        updateUnitToggle(currentUnit);
        return;
    }
    
    try {
        showLoading();
        
        currentUnit = newUnit;
        savePreferredUnit(currentUnit);
        updateUnitToggle(currentUnit);
        
        const cityName = currentCity.split(',')[0].trim();
        await loadWeather(cityName);
        
        console.log('✓ Unit toggled to:', currentUnit);
    } catch (error) {
        console.error('Error toggling unit:', error);
        currentUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
        updateUnitToggle(currentUnit);
        hideLoading();
    }
}

async function handleRefresh() {
    if (!currentCity) {
        showError('No city to refresh. Please search for a city first.');
        return;
    }
    
    const elements = getElements();
    
    if (elements.refreshBtn) {
        const icon = elements.refreshBtn.querySelector('[data-lucide="refresh-cw"]');
        if (icon) {
            icon.classList.add('animate-spin');
        }
    }
    
    const cityName = currentCity.split(',')[0].trim();
    await loadWeather(cityName);
    
    if (elements.refreshBtn) {
        const icon = elements.refreshBtn.querySelector('[data-lucide="refresh-cw"]');
        if (icon) {
            icon.classList.remove('animate-spin');
        }
    }
    
    console.log('✅ Weather data refreshed');
}

function handleThemeToggle() {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');
    const newTheme = isDark ? 'light' : 'dark';
    
    applyTheme(newTheme);
    saveThemePreference(newTheme);
    
    console.log('✅ Theme toggled to:', newTheme);
}

function applyTheme(theme) {
    const html = document.documentElement;
    const elements = getElements();
    
    if (theme === 'dark') {
        html.classList.add('dark');
        
        if (elements.themeToggleBtn) {
            const icon = elements.themeToggleBtn.querySelector('[data-lucide]');
            if (icon) {
                icon.setAttribute('data-lucide', 'sun');
                refreshIcons();
            }
        }
    } else {
        html.classList.remove('dark');
        
        if (elements.themeToggleBtn) {
            const icon = elements.themeToggleBtn.querySelector('[data-lucide]');
            if (icon) {
                icon.setAttribute('data-lucide', 'moon');
                refreshIcons();
            }
        }
    }
}

function renderHistoryList(history) {
    renderRecentLocations(
        history,
        handleLocationClick,
        handleLocationRemove
    );
}

function handleLocationClick(location) {
    const city = location.split(',')[0].trim();
    loadWeather(city);
}

function handleLocationRemove(index) {
    const updatedHistory = removeFromHistoryByIndex(index);
    renderHistoryList(updatedHistory);
}

function loadUserPreferences() {
    if (!isLocalStorageAvailable()) {
        console.warn('localStorage not available');
        return;
    }
    
    try {
        currentUnit = getPreferredUnit();
        updateUnitToggle(currentUnit);
        
        const history = getHistory();
        renderHistoryList(history);
        
        console.log('✓ User preferences loaded');
    } catch (error) {
        console.error('Error loading preferences:', error);
    }
}

document.addEventListener('DOMContentLoaded', init);

export { init, loadWeather, handleSearch, handleUnitToggle, handleAutocomplete, handleRefresh, handleThemeToggle };
