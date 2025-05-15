// Rutas de artistas
class ArtistRouter {
    constructor() {
        // No necesitamos almacenamiento local, usaremos MongoDB
        this.apiBaseUrl = CONFIG.API_BASE_URL;
    }
    
    // Verificar si el usuario es un artista
    async isArtist(token) {
        if (!token) return false;
        
        try {
            // Obtener perfil del usuario desde el servidor
            const response = await fetch(`${this.apiBaseUrl.replace(/\/api$/, '')}/api/users/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) return false;
            
            const user = await response.json();
            return user && user.role === 'artist';
        } catch (error) {
            console.error('Error al verificar si el usuario es artista:', error);
            return false;
        }
    }
    
    // Crear una nueva canción (solo para artistas)
    createSong(token, songData) {
        return new Promise(async (resolve, reject) => {
            try {
                // Verificar si el usuario es un artista
                const isArtist = await this.isArtist(token);
                if (!isArtist) {
                    return reject({ status: 403, message: 'Solo los artistas pueden crear canciones' });
                }
                
                // Hacer petición al servidor para crear canción
                const response = await fetch(`${this.apiBaseUrl.replace(/\/api$/, '')}/api/songs`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(songData)
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    return reject({ status: response.status, message: data.message || 'Error al crear canción' });
                }
                
                resolve(data);
            } catch (error) {
                console.error('Error al crear canción:', error);
                reject({ status: 500, message: 'Error al conectar con el servidor' });
            }
        });
    }
    
    // Obtener canciones de un artista
    getArtistSongs(token) {
        return new Promise(async (resolve, reject) => {
            try {
                // Verificar si el usuario es un artista
                const isArtist = await this.isArtist(token);
                if (!isArtist) {
                    return reject({ status: 403, message: 'Solo los artistas pueden ver sus canciones' });
                }
                
                // Hacer petición al servidor para obtener canciones del artista
                const response = await fetch(`${this.apiBaseUrl.replace(/\/api$/, '')}/api/songs/artist`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    return reject({ status: response.status, message: data.message || 'Error al obtener canciones del artista' });
                }
                
                resolve(data);
            } catch (error) {
                console.error('Error al obtener canciones del artista:', error);
                reject({ status: 500, message: 'Error al conectar con el servidor' });
            }
        });
    }
    
    // Crear una nueva playlist (solo para artistas)
    createPlaylist(token, playlistData) {
        return new Promise(async (resolve, reject) => {
            try {
                // Verificar si el usuario es un artista
                const isArtist = await this.isArtist(token);
                if (!isArtist) {
                    return reject({ status: 403, message: 'Solo los artistas pueden crear playlists' });
                }
                
                // Hacer petición al servidor para crear playlist
                const response = await fetch(`${this.apiBaseUrl.replace(/\/api$/, '')}/api/playlists`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(playlistData)
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    return reject({ status: response.status, message: data.message || 'Error al crear playlist' });
                }
                
                resolve(data);
            } catch (error) {
                console.error('Error al crear playlist:', error);
                reject({ status: 500, message: 'Error al conectar con el servidor' });
            }
        });
    }
    
    // Obtener playlists de un artista
    getArtistPlaylists(token) {
        return new Promise(async (resolve, reject) => {
            try {
                // Verificar si el usuario es un artista
                const isArtist = await this.isArtist(token);
                if (!isArtist) {
                    return reject({ status: 403, message: 'Solo los artistas pueden ver sus playlists' });
                }
                
                // Hacer petición al servidor para obtener playlists del artista
                const response = await fetch(`${this.apiBaseUrl.replace(/\/api$/, '')}/api/playlists/artist`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    return reject({ status: response.status, message: data.message || 'Error al obtener playlists del artista' });
                }
                
                resolve(data);
            } catch (error) {
                console.error('Error al obtener playlists del artista:', error);
                reject({ status: 500, message: 'Error al conectar con el servidor' });
            }
        });
    }
    
    // Eliminar una canción (solo para artistas)
    deleteSong(token, songId) {
        return new Promise(async (resolve, reject) => {
            try {
                // Verificar si el usuario es un artista
                const isArtist = await this.isArtist(token);
                if (!isArtist) {
                    return reject({ status: 403, message: 'Solo los artistas pueden eliminar canciones' });
                }
                
                // Hacer petición al servidor para eliminar canción
                const response = await fetch(`${this.apiBaseUrl.replace(/\/api$/, '')}/api/songs/${songId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    return reject({ status: response.status, message: data.message || 'Error al eliminar canción' });
                }
                
                resolve(data);
            } catch (error) {
                console.error('Error al eliminar canción:', error);
                reject({ status: 500, message: 'Error al conectar con el servidor' });
            }
        });
    }
    
    // Eliminar una playlist (solo para artistas)
    deletePlaylist(token, playlistId) {
        return new Promise(async (resolve, reject) => {
            try {
                // Verificar si el usuario es un artista
                const isArtist = await this.isArtist(token);
                if (!isArtist) {
                    return reject({ status: 403, message: 'Solo los artistas pueden eliminar playlists' });
                }
                
                // Hacer petición al servidor para eliminar playlist
                const response = await fetch(`${this.apiBaseUrl.replace(/\/api$/, '')}/api/playlists/${playlistId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    return reject({ status: response.status, message: data.message || 'Error al eliminar playlist' });
                }
                
                resolve(data);
            } catch (error) {
                console.error('Error al eliminar playlist:', error);
                reject({ status: 500, message: 'Error al conectar con el servidor' });
            }
        });
    }
}

// Exportar instancia de ArtistRouter
const artistRouter = new ArtistRouter();
