/**
 * API Service Layer for Weather Dashboard
 * Handles all API calls to OpenWeatherMap API
 * Pure logic - no DOM manipulation
 */

import { 
    API_KEY, 
    ENDPOINTS, 
    DEFAULT_SETTINGS, 
    ERROR_MESSAGES, 
    HTTP_STATUS 
} from './config.js';

/**
 * Fetches complete weather data for a given city
 * Combines current weather and 5-day forecast data
 * 
 * @param {string} city - The name of the city to fetch weather for
 * @param {string} unit - Temperature unit ('metric' or 'imperial')
 * @returns {Promise<Object>} Object containing current weather and forecast data
 * @throws {Error} When API request fails or city is not found
 */
export async function fetchWeatherData(city, unit = DEFAULT_SETTINGS.unit) {
    try {
        // Fetch both current weather and forecast in parallel for better performance
        const [currentWeather, forecast] = await Promise.all([
            fetchCurrentWeather(city, unit),
            fetchForecast(city, unit)
        ]);

        return {
            current: currentWeather,
            forecast: forecast,
            city: currentWeather.name,
            country: currentWeather.sys.country,
            timestamp: Date.now(),
        };
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
}

/**
 * Fetches current weather data for a specific city
 * 
 * @param {string} city - The name of the city
 * @param {string} unit - Temperature unit ('metric' or 'imperial')
 * @returns {Promise<Object>} Current weather data
 * @throws {Error} When API request fails
 */
async function fetchCurrentWeather(city, unit = DEFAULT_SETTINGS.unit) {
    const url = `${ENDPOINTS.CURRENT_WEATHER}?q=${encodeURIComponent(city)}&units=${unit}&appid=${API_KEY}`;
    
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

/**
 * Fetches 5-day weather forecast for a specific city
 * Returns forecast data in 3-hour intervals
 * 
 * @param {string} city - The name of the city
 * @param {string} unit - Temperature unit ('metric' or 'imperial')
 * @returns {Promise<Object>} 5-day forecast data
 * @throws {Error} When API request fails
 */
async function fetchForecast(city, unit = DEFAULT_SETTINGS.unit) {
    const url = `${ENDPOINTS.FORECAST}?q=${encodeURIComponent(city)}&units=${unit}&appid=${API_KEY}`;
    
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

/**
 * Fetches city suggestions for autocomplete feature
 * Uses OpenWeatherMap Geocoding API
 * 
 * @param {string} query - The search query (city name)
 * @param {number} limit - Maximum number of suggestions to return (default: 5)
 * @returns {Promise<Array>} Array of city suggestions
 * @throws {Error} When API request fails
 */
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
        
        // Transform data to a more usable format
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
        // Return empty array instead of throwing to prevent breaking autocomplete
        return [];
    }
}

/**
 * Fetches weather data using geographic coordinates
 * Useful for geolocation-based weather
 * 
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} unit - Temperature unit ('metric' or 'imperial')
 * @returns {Promise<Object>} Object containing current weather and forecast data
 * @throws {Error} When API request fails
 */
export async function fetchWeatherByCoordinates(lat, lon, unit = DEFAULT_SETTINGS.unit) {
    try {
        const currentUrl = `${ENDPOINTS.CURRENT_WEATHER}?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`;
        const forecastUrl = `${ENDPOINTS.FORECAST}?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`;

        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(currentUrl),
            fetch(forecastUrl)
        ]);

        if (!currentResponse.ok) {
            throw await handleAPIError(currentResponse);
        }
        if (!forecastResponse.ok) {
            throw await handleAPIError(forecastResponse);
        }

        const [currentWeather, forecast] = await Promise.all([
            currentResponse.json(),
            forecastResponse.json()
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

/**
 * Handles API errors and returns appropriate error messages
 * 
 * @param {Response} response - The fetch response object
 * @returns {Promise<Error>} Error object with appropriate message
 */
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

    // Try to get more specific error from response
    try {
        const errorData = await response.json();
        if (errorData.message) {
            errorMessage = errorData.message;
        }
    } catch (e) {
        // Use default error message if parsing fails
    }

    return new Error(errorMessage);
}

/**
 * Validates if the API key is configured
 * 
 * @returns {boolean} True if API key is set, false otherwise
 */
export function isAPIKeyConfigured() {
    return API_KEY && API_KEY !== 'YOUR_API_KEY_HERE';
}
