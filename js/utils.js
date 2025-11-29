/**
 * Utility functions for Weather Dashboard
 * Date formatting, time formatting, and data processing
 */

/**
 * Formats a timestamp into a readable date string
 * 
 * @param {number} timestamp - Unix timestamp in seconds
 * @param {string} locale - Locale string (default: 'en-US')
 * @returns {string} Formatted date string (e.g., "Friday, 29 November 2025")
 */
export function formatDate(timestamp, locale = 'en-US') {
    const date = new Date(timestamp * 1000);
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return date.toLocaleDateString(locale, options);
}

/**
 * Formats a timestamp into a short date string for forecast cards
 * 
 * @param {number} timestamp - Unix timestamp in seconds
 * @param {string} locale - Locale string (default: 'en-US')
 * @returns {string} Short date string (e.g., "Mon, 30 Nov")
 */
export function formatShortDate(timestamp, locale = 'en-US') {
    const date = new Date(timestamp * 1000);
    const options = { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
    };
    return date.toLocaleDateString(locale, options);
}

/**
 * Formats a timestamp into day name only
 * 
 * @param {number} timestamp - Unix timestamp in seconds
 * @param {string} locale - Locale string (default: 'en-US')
 * @returns {string} Day name (e.g., "Monday")
 */
export function formatDayName(timestamp, locale = 'en-US') {
    const date = new Date(timestamp * 1000);
    const options = { weekday: 'long' };
    return date.toLocaleDateString(locale, options);
}

/**
 * Formats a timestamp into a time string
 * 
 * @param {number} timestamp - Unix timestamp in seconds
 * @param {string} locale - Locale string (default: 'en-US')
 * @returns {string} Time string (e.g., "14:00")
 */
export function formatTime(timestamp, locale = 'en-US') {
    const date = new Date(timestamp * 1000);
    const options = { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    };
    return date.toLocaleTimeString(locale, options);
}

/**
 * Filters forecast data to get one entry per day (at 12:00 PM)
 * The API returns data every 3 hours (40 items for 5 days)
 * 
 * @param {Array} forecastList - Array of forecast items from API
 * @returns {Array} Filtered array with one item per day (max 5 days)
 */
export function filterDailyForecast(forecastList) {
    if (!forecastList || !Array.isArray(forecastList)) {
        return [];
    }

    const dailyData = [];
    const processedDates = new Set();

    for (const item of forecastList) {
        const date = new Date(item.dt * 1000);
        const dateString = date.toDateString(); // e.g., "Mon Nov 30 2025"
        const hour = date.getHours();

        // Skip if we already have data for this day
        if (processedDates.has(dateString)) {
            continue;
        }

        // Prefer data around 12:00 PM (noon) for more accurate daily forecast
        // But if it's the first entry of the day, take it regardless
        if (hour === 12 || !processedDates.has(dateString)) {
            dailyData.push(item);
            processedDates.add(dateString);
        }

        // Stop after collecting 5 days
        if (dailyData.length >= 5) {
            break;
        }
    }

    return dailyData;
}

/**
 * Gets the appropriate weather icon name based on OpenWeatherMap icon code
 * Maps OWM icons to Lucide icon names
 * 
 * @param {string} iconCode - OpenWeatherMap icon code (e.g., "01d", "10n")
 * @returns {string} Lucide icon name
 */
export function getWeatherIcon(iconCode) {
    const iconMap = {
        '01d': 'sun',                    // clear sky day
        '01n': 'moon',                   // clear sky night
        '02d': 'cloud-sun',              // few clouds day
        '02n': 'cloud-moon',             // few clouds night
        '03d': 'cloud',                  // scattered clouds
        '03n': 'cloud',                  // scattered clouds
        '04d': 'cloudy',                 // broken clouds
        '04n': 'cloudy',                 // broken clouds
        '09d': 'cloud-drizzle',          // shower rain
        '09n': 'cloud-drizzle',          // shower rain
        '10d': 'cloud-rain',             // rain day
        '10n': 'cloud-rain',             // rain night
        '11d': 'cloud-lightning',        // thunderstorm
        '11n': 'cloud-lightning',        // thunderstorm
        '13d': 'cloud-snow',             // snow
        '13n': 'cloud-snow',             // snow
        '50d': 'cloud-fog',              // mist
        '50n': 'cloud-fog',              // mist
    };

    return iconMap[iconCode] || 'cloud';
}

/**
 * Rounds a number to specified decimal places
 * 
 * @param {number} value - Number to round
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {number} Rounded number
 */
export function roundNumber(value, decimals = 0) {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Converts meters to kilometers
 * 
 * @param {number} meters - Distance in meters
 * @returns {number} Distance in kilometers (rounded to 1 decimal)
 */
export function metersToKilometers(meters) {
    return roundNumber(meters / 1000, 1);
}

/**
 * Converts meters per second to kilometers per hour
 * 
 * @param {number} mps - Speed in meters per second
 * @returns {number} Speed in kilometers per hour (rounded to 1 decimal)
 */
export function mpsToKmh(mps) {
    return roundNumber(mps * 3.6, 1);
}

/**
 * Converts meters per second to miles per hour
 * 
 * @param {number} mps - Speed in meters per second
 * @returns {number} Speed in miles per hour (rounded to 1 decimal)
 */
export function mpsToMph(mps) {
    return roundNumber(mps * 2.237, 1);
}

/**
 * Capitalizes the first letter of each word in a string
 * 
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalizeWords(str) {
    if (!str) return '';
    return str
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

/**
 * Debounces a function call
 * Useful for search input to avoid excessive API calls
 * 
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, delay = 300) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Checks if the browser supports localStorage
 * 
 * @returns {boolean} True if localStorage is available
 */
export function isLocalStorageAvailable() {
    try {
        const test = '__localStorage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}
