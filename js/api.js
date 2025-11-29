import { 
    API_KEY, 
    ENDPOINTS, 
    DEFAULT_SETTINGS, 
    ERROR_MESSAGES, 
    HTTP_STATUS 
} from './config.js';

export async function fetchWeatherData(city, unit = DEFAULT_SETTINGS.unit, lang = DEFAULT_SETTINGS.language) {
    try {
        const geoData = await fetchCityCoordinates(city);
        
        if (!geoData || geoData.length === 0) {
            console.error(`City "${city}" not found in geocoding API`);
            throw new Error(ERROR_MESSAGES.CITY_NOT_FOUND);
        }
        
        const { lat, lon, name, country } = geoData[0];
        console.log(`✓ Found: ${name}, ${country} (${lat}, ${lon})`);
        
        return await fetchWeatherByCoordinates(lat, lon, unit, lang);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
}

async function fetchCityCoordinates(city) {
    const url = `${ENDPOINTS.GEOCODING}?q=${encodeURIComponent(city)}&limit=5&appid=${API_KEY}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw await handleAPIError(response);
        }
        
        const data = await response.json();
        
        if (!data || data.length === 0) {
            console.warn(`No exact match found for "${city}"`);
            return [];
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching city coordinates:', error);
        throw error;
    }
}

async function fetchCurrentWeather(lat, lon, unit = DEFAULT_SETTINGS.unit, lang = DEFAULT_SETTINGS.language) {
    const url = `${ENDPOINTS.CURRENT_WEATHER}?lat=${lat}&lon=${lon}&units=${unit}&lang=${lang}&appid=${API_KEY}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw await handleAPIError(response);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching current weather:', error);
        throw error;
    }
}

async function fetchForecast(lat, lon, unit = DEFAULT_SETTINGS.unit, lang = DEFAULT_SETTINGS.language) {
    const url = `${ENDPOINTS.FORECAST}?lat=${lat}&lon=${lon}&units=${unit}&lang=${lang}&appid=${API_KEY}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw await handleAPIError(response);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching forecast:', error);
        throw error;
    }
}

export async function fetchCitySuggestions(query, limit = 5) {
    if (!query || query.trim().length < 2) {
        return [];
    }

    const url = `${ENDPOINTS.GEOCODING}?q=${encodeURIComponent(query)}&limit=${limit}&appid=${API_KEY}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw await handleAPIError(response);
        }
        
        const data = await response.json();
        
        return data.map(location => ({
            name: location.name,
            country: location.country,
            state: location.state || '',
            lat: location.lat,
            lon: location.lon,
            displayName: `${location.name}${location.state ? ', ' + location.state : ''}, ${location.country}`
        }));
    } catch (error) {
        console.error('Error fetching city suggestions:', error);
        return [];
    }
}

export async function fetchWeatherByCoordinates(lat, lon, unit = DEFAULT_SETTINGS.unit, lang = DEFAULT_SETTINGS.language) {
    try {
        const [currentWeather, forecast] = await Promise.all([
            fetchCurrentWeather(lat, lon, unit, lang),
            fetchForecast(lat, lon, unit, lang)
        ]);

        return {
            current: currentWeather,
            forecast: forecast,
            city: currentWeather.name,
            country: currentWeather.sys.country,
            timestamp: Date.now(),
        };
    } catch (error) {
        console.error('Error fetching weather by coordinates:', error);
        throw error;
    }
}

export async function searchCity(query, limit = 5) {
    return await fetchCitySuggestions(query, limit);
}

async function handleAPIError(response) {
    let errorMessage;

    switch (response.status) {
        case HTTP_STATUS.BAD_REQUEST:
            errorMessage = ERROR_MESSAGES.CITY_NOT_FOUND;
            break;
        case HTTP_STATUS.UNAUTHORIZED:
            errorMessage = ERROR_MESSAGES.INVALID_API_KEY;
            break;
        case HTTP_STATUS.NOT_FOUND:
            errorMessage = ERROR_MESSAGES.CITY_NOT_FOUND;
            break;
        case HTTP_STATUS.TOO_MANY_REQUESTS:
            errorMessage = ERROR_MESSAGES.RATE_LIMIT;
            break;
        case HTTP_STATUS.SERVER_ERROR:
            errorMessage = ERROR_MESSAGES.API_ERROR;
            break;
        default:
            errorMessage = ERROR_MESSAGES.API_ERROR;
    }

    try {
        const errorData = await response.json();
        if (errorData.message) {
            errorMessage = errorData.message;
        }
    } catch (e) {
    }

    return new Error(errorMessage);
}

export function isAPIKeyConfigured() {
    return API_KEY && API_KEY !== 'YOUR_API_KEY_HERE';
}