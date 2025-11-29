export const API_KEY = 'ffe83d710eb450d9c471aa554dccbf1d';
export const BASE_URL = 'https://api.openweathermap.org/data/2.5';
export const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

export const ENDPOINTS = {
    CURRENT_WEATHER: `${BASE_URL}/weather`,
    FORECAST: `${BASE_URL}/forecast`,
    GEOCODING: `${GEO_URL}/direct`,
};

export const DEFAULT_SETTINGS = {
    unit: 'metric',
    language: 'id',
    maxHistoryItems: 5,
};

export const UNIT_SYMBOLS = {
    metric: {
        temperature: '°C',
        speed: 'km/j',
        pressure: 'hPa',
        visibility: 'km',
    },
    imperial: {
        temperature: '°F',
        speed: 'mph',
        pressure: 'hPa',
        visibility: 'mil',
    },
};

export const STORAGE_KEYS = {
    SEARCH_HISTORY: 'weather_search_history',
    PREFERRED_UNIT: 'weather_preferred_unit',
    THEME: 'weather_theme',
};

export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Tidak dapat terhubung ke layanan cuaca. Periksa koneksi internet Anda.',
    CITY_NOT_FOUND: 'Kota tidak ditemukan. Coba gunakan nama kota yang lebih umum atau lengkap (contoh: Jakarta, Indonesia).',
    API_ERROR: 'Terjadi kesalahan saat mengambil data cuaca. Silakan coba lagi nanti.',
    INVALID_API_KEY: 'Kunci API tidak valid. Periksa konfigurasi Anda.',
    RATE_LIMIT: 'Terlalu banyak permintaan. Tunggu sebentar dan coba lagi.',
};

export const HTTP_STATUS = {
    OK: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    TOO_MANY_REQUESTS: 429,
    SERVER_ERROR: 500,
};
