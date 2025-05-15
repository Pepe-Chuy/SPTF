// Configuración de la aplicación
const CONFIG = {
    // Credenciales de Spotify
    SPOTIFY_CLIENT_ID: 'c2d842db508341fb9f84751365309073',
    SPOTIFY_CLIENT_SECRET: '4e62e13e7f864cbfad6f50a41420a835',
    
    // API URLs
    // Detectar automáticamente si estamos en producción o desarrollo
    API_URL: window.location.hostname.includes('vercel.app') || window.location.hostname.includes('netlify.app') 
        ? '/api'  // En Vercel, la API estará en la misma URL base
        : 'http://localhost:3000/api',
    SPOTIFY_AUTH_URL: 'https://accounts.spotify.com/api/token',
    SPOTIFY_API_URL: 'https://api.spotify.com/v1',
    
    // Configuración de MongoDB Atlas
    MONGODB_URI: 'mongodb+srv://artist-viewer-dev:ZgSfV5N8XTXyo5Sl@artist-viewer.czewmfe.mongodb.net/artist-viewer-db?retryWrites=true&w=majority&appName=artist-viewer',
    
    // Configuración de la aplicación
    APP_NAME: 'Spotify Artist Viewer',
    TOKEN_KEY: 'spotify_viewer_token',
    USER_KEY: 'spotify_viewer_user',
    
    // Duración del token (en milisegundos)
    TOKEN_DURATION: 24 * 60 * 60 * 1000, // 24 horas,
    
    // URL base de la API
    // Detectar automáticamente si estamos en producción o desarrollo
    API_BASE_URL: window.location.hostname.includes('vercel.app') || window.location.hostname.includes('netlify.app') 
        ? '/api'  // En Vercel, la API estará en la misma URL base
        : 'http://localhost:3000/api',
    
    // Configuración para modo sin backend
    USE_LOCAL_STORAGE: false, // Usar API en lugar de localStorage
    LOCAL_STORAGE_KEYS: {
        USERS: 'spotify_viewer_users',
        FAVORITE_ARTISTS: 'spotify_viewer_favorite_artists',
        FAVORITE_SONGS: 'spotify_viewer_favorite_songs',
        ARTIST_SONGS: 'spotify_viewer_artist_songs',
        ARTIST_PLAYLISTS: 'spotify_viewer_artist_playlists'
    }
};

// Exportar configuración para Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
