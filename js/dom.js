/**
 * DOM Manipulation Module for Weather Dashboard
 * Handles all UI updates and rendering
 * No API calls - Pure view layer
 */

import { 
    formatDate, 
    formatDayName, 
    getWeatherIcon, 
    roundNumber,
    metersToKilometers,
    mpsToKmh,
    mpsToMph,
    filterDailyForecast,
    capitalizeWords
} from './utils.js';

import { UNIT_SYMBOLS } from './config.js';

// DOM Elements Cache
const elements = {
    // Current Weather
    currentLocation: document.getElementById('current-location'),
    currentDate: document.getElementById('current-date'),
    currentTemp: document.getElementById('current-temp'),
    currentDescription: document.getElementById('current-description'),
    currentWeatherIcon: document.getElementById('current-weather-icon'),
    currentHumidity: document.getElementById('current-humidity'),
    currentWind: document.getElementById('current-wind'),
    currentPressure: document.getElementById('current-pressure'),
    currentVisibility: document.getElementById('current-visibility'),
    
    // Forecast
    forecastGrid: document.getElementById('forecast-grid'),
    
    // Search
    searchInput: document.getElementById('search-input'),
    searchBtn: document.getElementById('search-btn'),
    recentLocations: document.getElementById('recent-locations'),
    
    // Controls
    unitToggleBtn: document.getElementById('unit-toggle-btn'),
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
};

// Autocomplete container (will be created dynamically)
let autocompleteContainer = null;

/**
 * Renders current weather data to the main weather card
 * 
 * @param {Object} data - Current weather data from API
 * @param {string} unit - Temperature unit ('metric' or 'imperial')
 */
export function renderCurrentWeather(data, unit = 'metric') {
    if (!data) {
        console.error('No weather data to render');
        return;
    }

    const symbols = UNIT_SYMBOLS[unit];
    
    // Location and date
    const locationText = `${data.name}, ${data.sys.country}`;
    const dateText = formatDate(data.dt);
    
    // Temperature
    const temp = roundNumber(data.main.temp);
    const description = capitalizeWords(data.weather[0].description);
    
    // Weather details
    const humidity = data.main.humidity;
    const windSpeed = unit === 'metric' ? mpsToKmh(data.wind.speed) : mpsToMph(data.wind.speed);
    const pressure = data.main.pressure;
    const visibility = metersToKilometers(data.visibility);
    
    // Weather icon
    const iconName = getWeatherIcon(data.weather[0].icon);
    
    // Update DOM
    if (elements.currentLocation) elements.currentLocation.textContent = locationText;
    if (elements.currentDate) elements.currentDate.textContent = dateText;
    if (elements.currentTemp) elements.currentTemp.textContent = `${temp}°`;
    if (elements.currentDescription) elements.currentDescription.textContent = description;
    if (elements.currentHumidity) elements.currentHumidity.textContent = `${humidity}%`;
    if (elements.currentWind) elements.currentWind.textContent = `${windSpeed} ${symbols.speed}`;
    if (elements.currentPressure) elements.currentPressure.textContent = `${pressure} ${symbols.pressure}`;
    if (elements.currentVisibility) elements.currentVisibility.textContent = `${visibility} ${symbols.visibility}`;
    
    // Update weather icon
    if (elements.currentWeatherIcon) {
        elements.currentWeatherIcon.setAttribute('data-lucide', iconName);
    }
    
    // Re-render Lucide icons
    refreshIcons();
}

/**
 * Renders 5-day forecast to the forecast grid
 * 
 * @param {Array} forecastList - Raw forecast data from API
 * @param {string} unit - Temperature unit ('metric' or 'imperial')
 */
export function renderForecast(forecastList, unit = 'metric') {
    if (!forecastList || !Array.isArray(forecastList)) {
        console.error('Invalid forecast data');
        return;
    }
    
    // Filter to get daily forecast (one per day)
    const dailyData = filterDailyForecast(forecastList);
    
    if (!elements.forecastGrid) {
        console.error('Forecast grid element not found');
        return;
    }
    
    // Clear existing forecast cards
    elements.forecastGrid.innerHTML = '';
    
    // Create forecast cards
    dailyData.forEach(day => {
        const card = createForecastCard(day, unit);
        elements.forecastGrid.appendChild(card);
    });
    
    // Re-render Lucide icons
    refreshIcons();
}

/**
 * Creates a single forecast card element
 * 
 * @param {Object} data - Single day forecast data
 * @param {string} unit - Temperature unit ('metric' or 'imperial')
 * @returns {HTMLElement} Forecast card element
 */
function createForecastCard(data, unit = 'metric') {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow duration-200';
    
    const dayName = formatDayName(data.dt);
    const iconName = getWeatherIcon(data.weather[0].icon);
    const description = capitalizeWords(data.weather[0].description);
    const tempMax = roundNumber(data.main.temp_max);
    const tempMin = roundNumber(data.main.temp_min);
    
    card.innerHTML = `
        <p class="text-slate-600 font-medium mb-3">${dayName}</p>
        <div class="flex justify-center mb-3">
            <i data-lucide="${iconName}" class="w-12 h-12 text-slate-600"></i>
        </div>
        <p class="text-center text-slate-500 text-sm capitalize mb-3">${description}</p>
        <div class="flex justify-between items-center">
            <span class="text-xl font-bold text-slate-800">${tempMax}°</span>
            <span class="text-lg text-slate-400">${tempMin}°</span>
        </div>
    `;
    
    return card;
}

/**
 * Shows loading state
 */
export function showLoading() {
    // Disable search button
    if (elements.searchBtn) {
        elements.searchBtn.disabled = true;
        elements.searchBtn.innerHTML = `
            <svg class="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        `;
    }
    
    // Add loading skeleton to forecast grid
    if (elements.forecastGrid) {
        elements.forecastGrid.innerHTML = `
            <div class="bg-slate-100 rounded-lg h-48 animate-pulse"></div>
            <div class="bg-slate-100 rounded-lg h-48 animate-pulse"></div>
            <div class="bg-slate-100 rounded-lg h-48 animate-pulse"></div>
            <div class="bg-slate-100 rounded-lg h-48 animate-pulse"></div>
            <div class="bg-slate-100 rounded-lg h-48 animate-pulse"></div>
        `;
    }
}

/**
 * Hides loading state
 */
export function hideLoading() {
    // Re-enable search button
    if (elements.searchBtn) {
        elements.searchBtn.disabled = false;
        elements.searchBtn.innerHTML = `<i data-lucide="search" class="w-5 h-5"></i>`;
        refreshIcons();
    }
}

/**
 * Displays error message to user
 * 
 * @param {string} message - Error message to display
 */
export function showError(message) {
    // You can implement a toast notification or modal here
    // For now, we'll use the browser's alert
    alert(`Error: ${message}`);
    
    console.error('Weather Error:', message);
}

/**
 * Renders recent locations to the sidebar
 * 
 * @param {Array} locations - Array of recent location strings
 * @param {Function} onLocationClick - Callback when location is clicked
 * @param {Function} onLocationRemove - Callback when remove button is clicked
 */
export function renderRecentLocations(locations, onLocationClick, onLocationRemove) {
    if (!elements.recentLocations) return;
    
    if (!locations || locations.length === 0) {
        elements.recentLocations.innerHTML = `
            <div class="text-center py-8 text-slate-400">
                <i data-lucide="inbox" class="w-12 h-12 mx-auto mb-2 opacity-50"></i>
                <p class="text-sm">No recent searches</p>
            </div>
        `;
        refreshIcons();
        return;
    }
    
    elements.recentLocations.innerHTML = '';
    
    locations.forEach((location, index) => {
        const item = document.createElement('div');
        item.className = 'p-3 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors duration-200 flex items-center justify-between group';
        
        item.innerHTML = `
            <div class="flex items-center space-x-3" data-location="${location}">
                <i data-lucide="map-pin" class="w-4 h-4 text-slate-400"></i>
                <span class="text-slate-700">${location}</span>
            </div>
            <button class="remove-btn" data-index="${index}" aria-label="Remove ${location}">
                <i data-lucide="x" class="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"></i>
            </button>
        `;
        
        // Add event listeners
        const locationDiv = item.querySelector('[data-location]');
        const removeBtn = item.querySelector('.remove-btn');
        
        if (locationDiv && onLocationClick) {
            locationDiv.addEventListener('click', () => onLocationClick(location));
        }
        
        if (removeBtn && onLocationRemove) {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                onLocationRemove(index);
            });
        }
        
        elements.recentLocations.appendChild(item);
    });
    
    refreshIcons();
}

/**
 * Renders autocomplete suggestions dropdown
 * 
 * @param {Array} suggestions - Array of city suggestion objects
 * @param {Function} onSuggestionClick - Callback when suggestion is clicked
 */
export function renderAutocomplete(suggestions, onSuggestionClick) {
    // Remove existing autocomplete container
    if (autocompleteContainer) {
        autocompleteContainer.remove();
        autocompleteContainer = null;
    }
    
    // Don't render if no suggestions
    if (!suggestions || suggestions.length === 0) {
        return;
    }
    
    if (!elements.searchInput) return;
    
    // Create autocomplete container
    autocompleteContainer = document.createElement('div');
    autocompleteContainer.className = 'absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto';
    
    // Add suggestions
    suggestions.forEach(suggestion => {
        const item = document.createElement('div');
        item.className = 'px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors duration-150 flex items-center space-x-2 border-b border-slate-100 last:border-b-0';
        
        item.innerHTML = `
            <i data-lucide="map-pin" class="w-4 h-4 text-slate-400 flex-shrink-0"></i>
            <div class="flex-1">
                <div class="text-slate-800 font-medium">${suggestion.name}</div>
                <div class="text-xs text-slate-500">${suggestion.state ? suggestion.state + ', ' : ''}${suggestion.country}</div>
            </div>
        `;
        
        // Add click handler
        item.addEventListener('click', () => {
            if (onSuggestionClick) {
                onSuggestionClick(suggestion);
            }
            // Remove autocomplete after selection
            if (autocompleteContainer) {
                autocompleteContainer.remove();
                autocompleteContainer = null;
            }
        });
        
        autocompleteContainer.appendChild(item);
    });
    
    // Position relative to search input
    const searchWrapper = elements.searchInput.parentElement;
    if (searchWrapper) {
        searchWrapper.style.position = 'relative';
        searchWrapper.appendChild(autocompleteContainer);
    }
    
    // Refresh icons
    refreshIcons();
    
    // Close autocomplete when clicking outside
    document.addEventListener('click', handleClickOutside);
}

/**
 * Handle clicks outside autocomplete to close it
 * 
 * @param {Event} event - Click event
 */
function handleClickOutside(event) {
    if (autocompleteContainer && 
        !autocompleteContainer.contains(event.target) && 
        event.target !== elements.searchInput) {
        autocompleteContainer.remove();
        autocompleteContainer = null;
        document.removeEventListener('click', handleClickOutside);
    }
}

/**
 * Updates unit toggle button text
 * 
 * @param {string} currentUnit - Current unit ('metric' or 'imperial')
 */
export function updateUnitToggle(currentUnit) {
    if (!elements.unitToggleBtn) return;
    
    const unitText = currentUnit === 'metric' ? '°C / °F' : '°F / °C';
    const spanElement = elements.unitToggleBtn.querySelector('span');
    
    if (spanElement) {
        spanElement.textContent = unitText;
    }
}

/**
 * Clears the search input field
 */
export function clearSearchInput() {
    if (elements.searchInput) {
        elements.searchInput.value = '';
    }
}

/**
 * Gets the current value of search input
 * 
 * @returns {string} Search input value
 */
export function getSearchInputValue() {
    return elements.searchInput ? elements.searchInput.value.trim() : '';
}

/**
 * Re-renders all Lucide icons on the page
 * Should be called after dynamically adding icons to DOM
 */
export function refreshIcons() {
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
    }
}

/**
 * Returns the DOM elements cache for event listener setup
 * 
 * @returns {Object} DOM elements
 */
export function getElements() {
    return elements;
}
