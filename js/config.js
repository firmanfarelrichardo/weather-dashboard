/**
 * Configuration file for Weather Dashboard Application
 * Contains API credentials, endpoints, and default settings
 */

// OpenWeatherMap API Configuration
export const API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your actual API key from openweathermap.org
export const BASE_URL = 'https://api.openweathermap.org/data/2.5';
export const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

// API Endpoints
export const ENDPOINTS = {
    CURRENT_WEATHER: `${BASE_URL}/weather`,
    FORECAST: `${BASE_URL}/forecast`,
    GEOCODING: `${GEO_URL}/direct`,
};

// Default Application Settings
export const DEFAULT_SETTINGS = {
    city: 'Jakarta',
    country: 'ID',
    unit: 'metric', // 'metric' for Celsius, 'imperial' for Fahrenheit
    language: 'en',
    maxHistoryItems: 5,
};

// Unit Symbols
export const UNIT_SYMBOLS = {
    metric: {
        temperature: '°C',
        speed: 'km/h',
        pressure: 'hPa',
        visibility: 'km',
    },
    imperial: {
        temperature: '°F',
        speed: 'mph',
        pressure: 'hPa',
        visibility: 'mi',
    },
};

// Local Storage Keys
export const STORAGE_KEYS = {
    SEARCH_HISTORY: 'weather_search_history',
    PREFERRED_UNIT: 'weather_preferred_unit',
    THEME: 'weather_theme',
};

// Error Messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Unable to connect to the weather service. Please check your internet connection.',
    CITY_NOT_FOUND: 'City not found. Please check the spelling and try again.',
    API_ERROR: 'An error occurred while fetching weather data. Please try again later.',
    INVALID_API_KEY: 'Invalid API key. Please check your configuration.',
    RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
};

// API Response Codes
export const HTTP_STATUS = {
    OK: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    TOO_MANY_REQUESTS: 429,
    SERVER_ERROR: 500,
};
