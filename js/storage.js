import { STORAGE_KEYS, DEFAULT_SETTINGS } from './config.js';

export function saveToHistory(city) {
    if (!city || typeof city !== 'string') {
        console.error('Invalid city name');
        return getHistory();
    }

    try {
        let history = getHistory();
        
        history = history.filter(item => item.toLowerCase() !== city.toLowerCase());
        
        history.unshift(city);
        
        if (history.length > DEFAULT_SETTINGS.maxHistoryItems) {
            history = history.slice(0, DEFAULT_SETTINGS.maxHistoryItems);
        }
        
        localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(history));
        
        console.log('✓ City saved to history:', city);
        return history;
    } catch (error) {
        console.error('Error saving to history:', error);
        return getHistory();
    }
}

export function getHistory() {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
        
        if (!stored) {
            return [];
        }
        
        const history = JSON.parse(stored);
        
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

export function removeFromHistory(city) {
    if (!city) {
        console.error('No city specified for removal');
        return getHistory();
    }

    try {
        let history = getHistory();
        
        history = history.filter(item => item.toLowerCase() !== city.toLowerCase());
        
        localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(history));
        
        console.log('✓ City removed from history:', city);
        return history;
    } catch (error) {
        console.error('Error removing from history:', error);
        return getHistory();
    }
}

export function removeFromHistoryByIndex(index) {
    try {
        let history = getHistory();
        
        if (index < 0 || index >= history.length) {
            console.error('Invalid index:', index);
            return history;
        }
        
        history.splice(index, 1);
        
        localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(history));
        
        console.log('✓ Item removed from history at index:', index);
        return history;
    } catch (error) {
        console.error('Error removing from history by index:', error);
        return getHistory();
    }
}

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

export function getThemePreference() {
    try {
        const theme = localStorage.getItem(STORAGE_KEYS.THEME);
        
        if (theme === 'light' || theme === 'dark') {
            return theme;
        }
        
        return 'light';
    } catch (error) {
        console.error('Error reading theme preference:', error);
        return 'light';
    }
}

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
