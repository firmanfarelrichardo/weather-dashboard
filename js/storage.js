/**
 * LocalStorage Management Module
 * Handles all localStorage operations for search history and user preferences
 */

import { STORAGE_KEYS, DEFAULT_SETTINGS } from './config.js';

/**
 * Saves a city to search history
 * Ensures uniqueness and maintains order (most recent first)
 * 
 * @param {string} city - City name with country (e.g., "Jakarta, ID")
 * @returns {Array} Updated history array
 */
export function saveToHistory(city) {
    if (!city || typeof city !== 'string') {
        console.error('Invalid city name');
        return getHistory();
    }

    try {
        let history = getHistory();
        
        // Remove if already exists (to move it to top)
        history = history.filter(item => item.toLowerCase() !== city.toLowerCase());
        
        // Add to beginning of array
        history.unshift(city);
        
        // Limit to max items
        if (history.length > DEFAULT_SETTINGS.maxHistoryItems) {
            history = history.slice(0, DEFAULT_SETTINGS.maxHistoryItems);
        }
        
        // Save to localStorage
        localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(history));
        
        console.log('✓ City saved to history:', city);
        return history;
    } catch (error) {
        console.error('Error saving to history:', error);
        return getHistory();
    }
}

/**
 * Gets the search history from localStorage
 * 
 * @returns {Array} Array of city names
 */
export function getHistory() {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
        
        if (!stored) {
            return [];
        }
        
        const history = JSON.parse(stored);
        
        // Validate that it's an array
        if (!Array.isArray(history)) {
            console.warn('Invalid history format, resetting');
            localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
            return [];
        }
        
        return history;
    } catch (error) {
        console.error('Error reading history:', error);
        return [];
    }
}

/**
 * Removes a city from search history
 * 
 * @param {string} city - City name to remove
 * @returns {Array} Updated history array
 */
export function removeFromHistory(city) {
    if (!city) {
        console.error('No city specified for removal');
        return getHistory();
    }

    try {
        let history = getHistory();
        
        // Filter out the city (case-insensitive)
        history = history.filter(item => item.toLowerCase() !== city.toLowerCase());
        
        // Save updated history
        localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(history));
        
        console.log('✓ City removed from history:', city);
        return history;
    } catch (error) {
        console.error('Error removing from history:', error);
        return getHistory();
    }
}

/**
 * Removes a city from history by index
 * 
 * @param {number} index - Index of city to remove
 * @returns {Array} Updated history array
 */
export function removeFromHistoryByIndex(index) {
    try {
        let history = getHistory();
        
        if (index < 0 || index >= history.length) {
            console.error('Invalid index:', index);
            return history;
        }
        
        // Remove item at index
        history.splice(index, 1);
        
        // Save updated history
        localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(history));
        
        console.log('✓ Item removed from history at index:', index);
        return history;
    } catch (error) {
        console.error('Error removing from history by index:', error);
        return getHistory();
    }
}

/**
 * Clears all search history
 * 
 * @returns {Array} Empty array
 */
export function clearHistory() {
    try {
        localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
        console.log('✓ Search history cleared');
        return [];
    } catch (error) {
        console.error('Error clearing history:', error);
        return [];
    }
}

/**
 * Saves user's preferred temperature unit
 * 
 * @param {string} unit - 'metric' or 'imperial'
 */
export function savePreferredUnit(unit) {
    if (unit !== 'metric' && unit !== 'imperial') {
        console.error('Invalid unit:', unit);
        return;
    }

    try {
        localStorage.setItem(STORAGE_KEYS.PREFERRED_UNIT, unit);
        console.log('✓ Preferred unit saved:', unit);
    } catch (error) {
        console.error('Error saving preferred unit:', error);
    }
}

/**
 * Gets user's preferred temperature unit
 * 
 * @returns {string} 'metric' or 'imperial'
 */
export function getPreferredUnit() {
    try {
        const unit = localStorage.getItem(STORAGE_KEYS.PREFERRED_UNIT);
        
        if (unit === 'metric' || unit === 'imperial') {
            return unit;
        }
        
        return DEFAULT_SETTINGS.unit;
    } catch (error) {
        console.error('Error reading preferred unit:', error);
        return DEFAULT_SETTINGS.unit;
    }
}

/**
 * Saves theme preference
 * 
 * @param {string} theme - 'light' or 'dark'
 */
export function saveThemePreference(theme) {
    if (theme !== 'light' && theme !== 'dark') {
        console.error('Invalid theme:', theme);
        return;
    }

    try {
        localStorage.setItem(STORAGE_KEYS.THEME, theme);
        console.log('✓ Theme preference saved:', theme);
    } catch (error) {
        console.error('Error saving theme preference:', error);
    }
}

/**
 * Gets theme preference
 * 
 * @returns {string} 'light' or 'dark'
 */
export function getThemePreference() {
    try {
        const theme = localStorage.getItem(STORAGE_KEYS.THEME);
        
        if (theme === 'light' || theme === 'dark') {
            return theme;
        }
        
        return 'light'; // Default theme
    } catch (error) {
        console.error('Error reading theme preference:', error);
        return 'light';
    }
}

/**
 * Checks if localStorage is available
 * 
 * @returns {boolean} True if localStorage is supported
 */
export function isStorageAvailable() {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}
