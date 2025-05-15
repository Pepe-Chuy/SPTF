// Rutas de favoritos
class FavoritesRouter {
    constructor() {
        // No necesitamos almacenamiento local, usaremos MongoDB
        this.apiBaseUrl = CONFIG.API_BASE_URL;
    }
    
    // Añadir artista a favoritos
    addArtistToFavorites(token, artistData) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!token) {
                    return reject({ status: 401, message: 'No autorizado' });
                }
                
                // Hacer petición al servidor para añadir artista a favoritos
                const response = await fetch(`${this.apiBaseUrl.replace(/\/api$/, '')}/api/favorites/artist`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(artistData)
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    return reject({ status: response.status, message: data.message || 'Error al añadir artista a favoritos' });
                }
                
                resolve(data);
            } catch (error) {
                console.error('Error al añadir artista a favoritos:', error);
                reject({ status: 500, message: 'Error al conectar con el servidor' });
            }
        });
    }
    
    // Eliminar artista de favoritos
    removeArtistFromFavorites(token, artistId) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!token) {
                    return reject({ status: 401, message: 'No autorizado' });
                }
                
                // Hacer petición al servidor para eliminar artista de favoritos
                const response = await fetch(`${this.apiBaseUrl.replace(/\/api$/, '')}/api/favorites/artist/${artistId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    return reject({ status: response.status, message: data.message || 'Error al eliminar artista de favoritos' });
                }
                
                resolve(data);
            } catch (error) {
                console.error('Error al eliminar artista de favoritos:', error);
                reject({ status: 500, message: 'Error al conectar con el servidor' });
            }
        });
    }
    
    // Añadir canción a favoritos
    addSongToFavorites(token, songData) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!token) {
                    return reject({ status: 401, message: 'No autorizado' });
                }
                
                // Hacer petición al servidor para añadir canción a favoritos
                const response = await fetch(`${this.apiBaseUrl.replace(/\/api$/, '')}/api/favorites/song`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(songData)
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    return reject({ status: response.status, message: data.message || 'Error al añadir canción a favoritos' });
                }
                
                resolve(data);
            } catch (error) {
                console.error('Error al añadir canción a favoritos:', error);
                reject({ status: 500, message: 'Error al conectar con el servidor' });
            }
        });
    }
    
    // Eliminar canción de favoritos
    removeSongFromFavorites(token, songId) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!token) {
                    return reject({ status: 401, message: 'No autorizado' });
                }
                
                // Hacer petición al servidor para eliminar canción de favoritos
                const response = await fetch(`${this.apiBaseUrl.replace(/\/api$/, '')}/api/favorites/song/${songId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    return reject({ status: response.status, message: data.message || 'Error al eliminar canción de favoritos' });
                }
                
                resolve(data);
            } catch (error) {
                console.error('Error al eliminar canción de favoritos:', error);
                reject({ status: 500, message: 'Error al conectar con el servidor' });
            }
        });
    }
    
    // Obtener artistas favoritos
    getFavoriteArtists(token) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!token) {
                    return reject({ status: 401, message: 'No autorizado' });
                }
                
                // Hacer petición al servidor para obtener artistas favoritos
                const response = await fetch(`${this.apiBaseUrl.replace(/\/api$/, '')}/api/favorites/artists`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    return reject({ status: response.status, message: data.message || 'Error al obtener artistas favoritos' });
                }
                
                resolve(data);
            } catch (error) {
                console.error('Error al obtener artistas favoritos:', error);
                reject({ status: 500, message: 'Error al conectar con el servidor' });
            }
        });
    }
    
    // Obtener canciones favoritas
    getFavoriteSongs(token) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!token) {
                    return reject({ status: 401, message: 'No autorizado' });
                }
                
                // Hacer petición al servidor para obtener canciones favoritas
                const response = await fetch(`${this.apiBaseUrl.replace(/\/api$/, '')}/api/favorites/songs`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    return reject({ status: response.status, message: data.message || 'Error al obtener canciones favoritas' });
                }
                
                resolve(data);
            } catch (error) {
                console.error('Error al obtener canciones favoritas:', error);
                reject({ status: 500, message: 'Error al conectar con el servidor' });
            }
        });
    }
}

// Exportar instancia de FavoritesRouter
const favoritesRouter = new FavoritesRouter();
