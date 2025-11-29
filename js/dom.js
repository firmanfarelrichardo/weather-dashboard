import { 
    formatDate, 
    formatDayName, 
    getWeatherIcon, 
    roundNumber,
    metersToKilometers,
    metersToMiles,
    mpsToKmh,
    mpsToMph,
    filterDailyForecast,
    capitalizeWords
} from './utils.js';

import { UNIT_SYMBOLS } from './config.js';

const elements = {
    currentLocation: document.getElementById('current-location'),
    currentDate: document.getElementById('current-date'),
    currentTemp: document.getElementById('current-temp'),
    currentTempUnit: document.getElementById('current-temp-unit'),
    currentDescription: document.getElementById('current-description'),
    currentWeatherIcon: document.getElementById('current-weather-icon'),
    currentHumidity: document.getElementById('current-humidity'),
    currentWind: document.getElementById('current-wind'),
    currentPressure: document.getElementById('current-pressure'),
    currentVisibility: document.getElementById('current-visibility'),
    
    forecastGrid: document.getElementById('forecast-grid'),
    
    searchInput: document.getElementById('search-input'),
    searchBtn: document.getElementById('search-btn'),
    recentLocations: document.getElementById('recent-locations'),
    
    refreshBtn: document.getElementById('refresh-btn'),
    unitToggleBtn: document.getElementById('unit-toggle-btn'),
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
};

let autocompleteContainer = null;

export function renderCurrentWeather(data, unit = 'metric') {
    if (!data) {
        console.error('No weather data to render');
        return;
    }

    const symbols = UNIT_SYMBOLS[unit];
    
    const locationText = `${data.name}, ${data.sys.country}`;
    const dateText = formatDate(data.dt);
    
    const temp = roundNumber(data.main.temp);
    const description = capitalizeWords(data.weather[0].description);
    
    const humidity = data.main.humidity;
    const windSpeed = unit === 'metric' ? mpsToKmh(data.wind.speed) : mpsToMph(data.wind.speed);
    const pressure = data.main.pressure;
    const visibility = unit === 'metric' ? metersToKilometers(data.visibility) : metersToMiles(data.visibility);
    
    const iconName = getWeatherIcon(data.weather[0].icon);
    
    if (elements.currentLocation) elements.currentLocation.textContent = locationText;
    if (elements.currentDate) elements.currentDate.textContent = dateText;
    if (elements.currentTemp) elements.currentTemp.textContent = `${temp}°`;
    if (elements.currentTempUnit) elements.currentTempUnit.textContent = unit === 'metric' ? 'C' : 'F';
    if (elements.currentDescription) elements.currentDescription.textContent = description;
    if (elements.currentHumidity) elements.currentHumidity.textContent = `${humidity}%`;
    if (elements.currentWind) elements.currentWind.textContent = `${windSpeed} ${symbols.speed}`;
    if (elements.currentPressure) elements.currentPressure.textContent = `${pressure} ${symbols.pressure}`;
    if (elements.currentVisibility) elements.currentVisibility.textContent = `${visibility} ${symbols.visibility}`;
    
    if (elements.currentWeatherIcon) {
        elements.currentWeatherIcon.setAttribute('data-lucide', iconName);
    }
    
    refreshIcons();
}

export function renderForecast(forecastList, unit = 'metric') {
    if (!forecastList || !Array.isArray(forecastList)) {
        console.error('Invalid forecast data');
        return;
    }
    
    const dailyData = filterDailyForecast(forecastList);
    
    if (!elements.forecastGrid) {
        console.error('Forecast grid element not found');
        return;
    }
    
    elements.forecastGrid.innerHTML = '';
    
    dailyData.forEach(day => {
        const card = createForecastCard(day, unit);
        elements.forecastGrid.appendChild(card);
    });
    
    refreshIcons();
}

function createForecastCard(data, unit = 'metric') {
    const card = document.createElement('div');
    card.className = 'bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-all duration-200';
    
    const dayName = formatDayName(data.dt);
    const iconName = getWeatherIcon(data.weather[0].icon);
    const description = capitalizeWords(data.weather[0].description);
    const tempMax = roundNumber(data.main.temp_max);
    const tempMin = roundNumber(data.main.temp_min);
    const tempSymbol = unit === 'metric' ? '°C' : '°F';
    
    card.innerHTML = `
        <p class="text-slate-600 dark:text-slate-300 font-medium mb-3">${dayName}</p>
        <div class="flex justify-center mb-3">
            <i data-lucide="${iconName}" class="w-12 h-12 text-slate-600 dark:text-slate-400"></i>
        </div>
        <p class="text-center text-slate-500 dark:text-slate-400 text-sm capitalize mb-3">${description}</p>
        <div class="flex justify-between items-center">
            <span class="text-xl font-bold text-slate-800 dark:text-slate-100">${tempMax}${tempSymbol}</span>
            <span class="text-lg text-slate-400 dark:text-slate-500">${tempMin}${tempSymbol}</span>
        </div>
    `;
    
    return card;
}

export function showLoading() {
    if (elements.searchBtn) {
        elements.searchBtn.disabled = true;
        elements.searchBtn.innerHTML = `
            <svg class="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        `;
    }
    
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

export function hideLoading() {
    if (elements.searchBtn) {
        elements.searchBtn.disabled = false;
        elements.searchBtn.innerHTML = `<i data-lucide="search" class="w-5 h-5"></i>`;
        refreshIcons();
    }
}

export function showError(message) {
    alert(`Error: ${message}`);
    
    console.error('Weather Error:', message);
}

export function renderRecentLocations(locations, onLocationClick, onLocationRemove) {
    if (!elements.recentLocations) return;
    
    if (!locations || locations.length === 0) {
        elements.recentLocations.innerHTML = `
            <div class="text-center py-8 text-slate-400 dark:text-slate-500">
                <i data-lucide="inbox" class="w-12 h-12 mx-auto mb-2 opacity-50"></i>
                <p class="text-sm">Belum ada pencarian</p>
            </div>
        `;
        refreshIcons();
        return;
    }
    
    elements.recentLocations.innerHTML = '';
    
    locations.forEach((location, index) => {
        const item = document.createElement('div');
        item.className = 'p-3 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg cursor-pointer transition-colors duration-200 flex items-center justify-between group';
        
        item.innerHTML = `
            <div class="flex items-center space-x-3" data-location="${location}">
                <i data-lucide="map-pin" class="w-4 h-4 text-slate-400 dark:text-slate-500"></i>
                <span class="text-slate-700 dark:text-slate-200">${location}</span>
            </div>
            <button class="remove-btn" data-index="${index}" aria-label="Remove ${location}">
                <i data-lucide="x" class="w-4 h-4 text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity"></i>
            </button>
        `;
        
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

export function renderAutocomplete(suggestions, onSuggestionClick) {
    if (autocompleteContainer) {
        autocompleteContainer.remove();
        autocompleteContainer = null;
    }
    
    if (!suggestions || suggestions.length === 0) {
        return;
    }
    
    if (!elements.searchInput) return;
    
    autocompleteContainer = document.createElement('div');
    autocompleteContainer.className = 'absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto';
    
    suggestions.forEach(suggestion => {
        const item = document.createElement('div');
        item.className = 'px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors duration-150 flex items-center space-x-2 border-b border-slate-100 dark:border-slate-700 last:border-b-0';
        
        item.innerHTML = `
            <i data-lucide="map-pin" class="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0"></i>
            <div class="flex-1">
                <div class="text-slate-800 dark:text-slate-100 font-medium">${suggestion.name}</div>
                <div class="text-xs text-slate-500 dark:text-slate-400">${suggestion.state ? suggestion.state + ', ' : ''}${suggestion.country}</div>
            </div>
        `;
        
        item.addEventListener('click', () => {
            if (onSuggestionClick) {
                onSuggestionClick(suggestion);
            }
            if (autocompleteContainer) {
                autocompleteContainer.remove();
                autocompleteContainer = null;
            }
        });
        
        autocompleteContainer.appendChild(item);
    });
    
    const searchWrapper = elements.searchInput.parentElement;
    if (searchWrapper) {
        searchWrapper.style.position = 'relative';
        searchWrapper.appendChild(autocompleteContainer);
    }
    
    refreshIcons();
    
    document.addEventListener('click', handleClickOutside);
}

function handleClickOutside(event) {
    if (autocompleteContainer && 
        !autocompleteContainer.contains(event.target) && 
        event.target !== elements.searchInput) {
        autocompleteContainer.remove();
        autocompleteContainer = null;
        document.removeEventListener('click', handleClickOutside);
    }
}

export function updateUnitToggle(currentUnit) {
    if (!elements.unitToggleBtn) return;
    
    const spanElement = elements.unitToggleBtn.querySelector('span');
    
    if (spanElement) {
        if (currentUnit === 'metric') {
            spanElement.innerHTML = '<strong>°C</strong> / °F';
        } else {
            spanElement.innerHTML = '°C / <strong>°F</strong>';
        }
    }
}

export function clearSearchInput() {
    if (elements.searchInput) {
        elements.searchInput.value = '';
    }
}

export function getSearchInputValue() {
    return elements.searchInput ? elements.searchInput.value.trim() : '';
}

export function refreshIcons() {
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
    }
}

export function getElements() {
    return elements;
}
