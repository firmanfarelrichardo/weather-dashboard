export function formatDate(timestamp, locale = 'id-ID') {
    const date = new Date(timestamp * 1000);
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return date.toLocaleDateString(locale, options);
}

export function formatShortDate(timestamp, locale = 'id-ID') {
    const date = new Date(timestamp * 1000);
    const options = { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
    };
    return date.toLocaleDateString(locale, options);
}

export function formatDayName(timestamp, locale = 'id-ID') {
    const date = new Date(timestamp * 1000);
    const options = { weekday: 'long' };
    return date.toLocaleDateString(locale, options);
}

export function formatTime(timestamp, locale = 'id-ID') {
    const date = new Date(timestamp * 1000);
    const options = { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    };
    return date.toLocaleTimeString(locale, options);
}

export function filterDailyForecast(forecastList) {
    if (!forecastList || !Array.isArray(forecastList)) {
        return [];
    }

    const dailyData = [];
    const processedDates = new Set();

    for (const item of forecastList) {
        const date = new Date(item.dt * 1000);
        const dateString = date.toISOString().split('T')[0];
        const hour = date.getHours();

        if (processedDates.has(dateString)) {
            continue;
        }

        if (hour >= 11 && hour <= 15) {
            dailyData.push(item);
            processedDates.add(dateString);
        } else if (!processedDates.has(dateString) && hour >= 6) {
            dailyData.push(item);
            processedDates.add(dateString);
        }

        if (dailyData.length >= 5) {
            break;
        }
    }

    if (dailyData.length < 5 && forecastList.length > 0) {
        const remainingDates = new Map();
        
        for (const item of forecastList) {
            const date = new Date(item.dt * 1000);
            const dateString = date.toISOString().split('T')[0];
            
            if (!processedDates.has(dateString)) {
                if (!remainingDates.has(dateString)) {
                    remainingDates.set(dateString, item);
                    dailyData.push(item);
                    processedDates.add(dateString);
                    
                    if (dailyData.length >= 5) {
                        break;
                    }
                }
            }
        }
    }

    return dailyData.slice(0, 5);
}

export function filterForecast(forecastList) {
    return filterDailyForecast(forecastList);
}

export function getWeatherIcon(iconCode) {
    const iconMap = {
        '01d': 'sun',
        '01n': 'moon',
        '02d': 'cloud-sun',
        '02n': 'cloud-moon',
        '03d': 'cloud',
        '03n': 'cloud',
        '04d': 'cloudy',
        '04n': 'cloudy',
        '09d': 'cloud-drizzle',
        '09n': 'cloud-drizzle',
        '10d': 'cloud-rain',
        '10n': 'cloud-rain',
        '11d': 'cloud-lightning',
        '11n': 'cloud-lightning',
        '13d': 'cloud-snow',
        '13n': 'cloud-snow',
        '50d': 'cloud-fog',
        '50n': 'cloud-fog',
    };

    return iconMap[iconCode] || 'cloud';
}

export function roundNumber(value, decimals = 0) {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export function metersToKilometers(meters) {
    return roundNumber(meters / 1000, 1);
}

export function metersToMiles(meters) {
    return roundNumber(meters / 1609.34, 1);
}

export function mpsToKmh(mps) {
    return roundNumber(mps * 3.6, 1);
}

export function mpsToMph(mps) {
    return roundNumber(mps * 2.237, 1);
}

export function capitalizeWords(str) {
    if (!str) return '';
    return str
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

export function debounce(func, delay = 300) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

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
