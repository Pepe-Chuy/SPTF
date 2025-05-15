// Clase para manejar las llamadas a la API
class API {
    constructor() {
        this.spotifyToken = null;
        this.spotifyTokenExpiry = null;
    }

    // Método para obtener token de Spotify
    async getSpotifyToken() {
        // Si ya tenemos un token válido, lo devolvemos
        if (this.spotifyToken && this.spotifyTokenExpiry > Date.now()) {
            return this.spotifyToken;
        }

        try {
            const response = await fetch(CONFIG.SPOTIFY_AUTH_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(`${CONFIG.SPOTIFY_CLIENT_ID}:${CONFIG.SPOTIFY_CLIENT_SECRET}`)
                },
                body: 'grant_type=client_credentials'
            });

            if (!response.ok) {
                throw new Error('Error al obtener token de Spotify');
            }

            const data = await response.json();
            this.spotifyToken = data.access_token;
            // Establecer tiempo de expiración (token dura 1 hora)
            this.spotifyTokenExpiry = Date.now() + (data.expires_in * 1000);
            return this.spotifyToken;
        } catch (error) {
            console.error('Error al obtener token de Spotify:', error);
            throw error;
        }
    }

    // Método para buscar artistas en Spotify
    async searchArtists(query) {
        try {
            const token = await this.getSpotifyToken();
            const response = await fetch(`${CONFIG.SPOTIFY_API_URL}/search?q=${encodeURIComponent(query)}&type=artist&limit=10`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al buscar artistas');
            }

            const data = await response.json();
            return data.artists.items;
        } catch (error) {
            console.error('Error al buscar artistas:', error);
            throw error;
        }
    }

    // Método para obtener detalles de un artista
    async getArtist(artistId) {
        try {
            const token = await this.getSpotifyToken();
            const response = await fetch(`${CONFIG.SPOTIFY_API_URL}/artists/${artistId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al obtener detalles del artista');
            }

            return await response.json();
        } catch (error) {
            console.error('Error al obtener detalles del artista:', error);
            throw error;
        }
    }

    // Método para obtener los álbumes de un artista
    async getArtistAlbums(artistId) {
        try {
            const token = await this.getSpotifyToken();
            const response = await fetch(`${CONFIG.SPOTIFY_API_URL}/artists/${artistId}/albums?limit=20&include_groups=album,single`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al obtener álbumes del artista');
            }

            const data = await response.json();
            return data.items;
        } catch (error) {
            console.error('Error al obtener álbumes del artista:', error);
            throw error;
        }
    }

    // Método para obtener las canciones más populares de un artista
    async getArtistTopTracks(artistId) {
        try {
            const token = await this.getSpotifyToken();
            const response = await fetch(`${CONFIG.SPOTIFY_API_URL}/artists/${artistId}/top-tracks?market=ES`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al obtener canciones populares del artista');
            }

            const data = await response.json();
            return data.tracks;
        } catch (error) {
            console.error('Error al obtener canciones populares del artista:', error);
            throw error;
        }
    }

    // Método para obtener artistas destacados
    async getFeaturedArtists() {
        try {
            const token = await this.getSpotifyToken();
            // Obtenemos algunos artistas populares predefinidos
            const artistIds = [
                '06HL4z0CvFAxyc27GXpf02', // Taylor Swift
                '1Xyo4u8uXC1ZmMpatF05PJ', // The Weeknd
                '4q3ewBCX7sLwd24euuV69X', // Bad Bunny
                '3TVXtAsR1Inumwj472S9r4', // Drake
                '6eUKZXaKkcviH0Ku9w2n3V'  // Ed Sheeran
            ];
            
            const promises = artistIds.map(id => this.getArtist(id));
            return await Promise.all(promises);
        } catch (error) {
            console.error('Error al obtener artistas destacados:', error);
            throw error;
        }
    }

    // Método para obtener canciones populares
    async getTopSongs() {
        try {
            const token = await this.getSpotifyToken();
            const response = await fetch(`${CONFIG.SPOTIFY_API_URL}/playlists/37i9dQZEVXbMDoHDwVN2tF`, { // Global Top 50
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al obtener canciones populares');
            }

            const data = await response.json();
            return data.tracks.items.slice(0, 10).map(item => item.track);
        } catch (error) {
            console.error('Error al obtener canciones populares:', error);
            throw error;
        }
    }

    // ---- Métodos para interactuar con nuestra base de datos a través del router ----
    
    // Método para registrar un usuario
    async registerUser(userData) {
        try {
            // Utilizar el router para manejar la solicitud
            return await router.handleRequest('/api/users/register', 'POST', null, userData);
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            throw new Error(error.message || 'Error al registrar usuario');
        }
    }

    // Método para iniciar sesión
    async loginUser(credentials) {
        try {
            // Utilizar el router para manejar la solicitud
            return await router.handleRequest('/api/users/login', 'POST', null, credentials);
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            throw new Error(error.message || 'Error al iniciar sesión');
        }
    }

    // Método para obtener información del usuario
    async getUserProfile() {
        try {
            const token = localStorage.getItem(CONFIG.TOKEN_KEY);
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            // Utilizar el router para manejar la solicitud
            return await router.handleRequest('/api/users/profile', 'GET', token, null);
        } catch (error) {
            console.error('Error al obtener perfil de usuario:', error);
            throw new Error(error.message || 'Error al obtener perfil de usuario');
        }
    }

    // Método para actualizar información del usuario
    async updateUserProfile(userData) {
        try {
            const token = localStorage.getItem(CONFIG.TOKEN_KEY);
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            // Utilizar el router para manejar la solicitud
            return await router.handleRequest('/api/users/profile', 'PUT', token, userData);
        } catch (error) {
            console.error('Error al actualizar perfil de usuario:', error);
            throw new Error(error.message || 'Error al actualizar perfil de usuario');
        }
    }

    // Método para convertir un usuario en artista
    async becomeArtist() {
        try {
            const token = localStorage.getItem(CONFIG.TOKEN_KEY);
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            // Utilizar el router para manejar la solicitud
            return await router.handleRequest('/api/users/become-artist', 'PUT', token, null);
        } catch (error) {
            console.error('Error al convertirse en artista:', error);
            throw new Error(error.message || 'Error al convertirse en artista');
        }
    }

    // Método para añadir un artista a favoritos
    async addArtistToFavorites(artistData) {
        try {
            const token = localStorage.getItem(CONFIG.TOKEN_KEY);
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            // Utilizar el router para manejar la solicitud
            return await router.handleRequest('/api/favorites/artist', 'POST', token, artistData);
        } catch (error) {
            console.error('Error al añadir artista a favoritos:', error);
            throw new Error(error.message || 'Error al añadir artista a favoritos');
        }
    }

    // Método para eliminar un artista de favoritos
    async removeArtistFromFavorites(artistId) {
        try {
            const token = localStorage.getItem(CONFIG.TOKEN_KEY);
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            // Utilizar el router para manejar la solicitud
            return await router.handleRequest(`/api/favorites/artist/${artistId}`, 'DELETE', token, artistId);
        } catch (error) {
            console.error('Error al eliminar artista de favoritos:', error);
            throw new Error(error.message || 'Error al eliminar artista de favoritos');
        }
    }

    // Método para añadir una canción a favoritos
    async addSongToFavorites(songData) {
        try {
            const token = localStorage.getItem(CONFIG.TOKEN_KEY);
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            // Utilizar el router para manejar la solicitud
            return await router.handleRequest('/api/favorites/song', 'POST', token, songData);
        } catch (error) {
            console.error('Error al añadir canción a favoritos:', error);
            throw new Error(error.message || 'Error al añadir canción a favoritos');
        }
    }

    // Método para eliminar una canción de favoritos
    async removeSongFromFavorites(songId) {
        try {
            const token = localStorage.getItem(CONFIG.TOKEN_KEY);
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            // Utilizar el router para manejar la solicitud
            return await router.handleRequest(`/api/favorites/song/${songId}`, 'DELETE', token, songId);
        } catch (error) {
            console.error('Error al eliminar canción de favoritos:', error);
            throw new Error(error.message || 'Error al eliminar canción de favoritos');
        }
    }

    // Método para obtener artistas favoritos
    async getFavoriteArtists() {
        try {
            const token = localStorage.getItem(CONFIG.TOKEN_KEY);
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            // Utilizar el router para manejar la solicitud
            return await router.handleRequest('/api/favorites/artists', 'GET', token, null);
        } catch (error) {
            console.error('Error al obtener artistas favoritos:', error);
            throw new Error(error.message || 'Error al obtener artistas favoritos');
        }
    }

    // Método para obtener canciones favoritas
    async getFavoriteSongs() {
        try {
            const token = localStorage.getItem(CONFIG.TOKEN_KEY);
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            // Utilizar el router para manejar la solicitud
            return await router.handleRequest('/api/favorites/songs', 'GET', token, null);
        } catch (error) {
            console.error('Error al obtener canciones favoritas:', error);
            throw new Error(error.message || 'Error al obtener canciones favoritas');
        }
    }

    // Método para crear una canción (solo para artistas)
    async createSong(songData) {
        try {
            const token = localStorage.getItem(CONFIG.TOKEN_KEY);
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            // Utilizar el router para manejar la solicitud
            return await router.handleRequest('/api/songs', 'POST', token, songData);
        } catch (error) {
            console.error('Error al crear canción:', error);
            throw new Error(error.message || 'Error al crear canción');
        }
    }

    // Método para obtener canciones de un artista
    async getArtistSongs() {
        try {
            const token = localStorage.getItem(CONFIG.TOKEN_KEY);
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            // Utilizar el router para manejar la solicitud
            return await router.handleRequest('/api/songs/artist', 'GET', token, null);
        } catch (error) {
            console.error('Error al obtener canciones del artista:', error);
            throw new Error(error.message || 'Error al obtener canciones del artista');
        }
    }

    // Método para crear una playlist (solo para artistas)
    async createPlaylist(playlistData) {
        try {
            const token = localStorage.getItem(CONFIG.TOKEN_KEY);
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            // Utilizar el router para manejar la solicitud
            return await router.handleRequest('/api/playlists', 'POST', token, playlistData);
        } catch (error) {
            console.error('Error al crear playlist:', error);
            throw new Error(error.message || 'Error al crear playlist');
        }
    }

    // Método para obtener playlists de un artista
    async getArtistPlaylists() {
        try {
            const token = localStorage.getItem(CONFIG.TOKEN_KEY);
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            // Utilizar el router para manejar la solicitud
            return await router.handleRequest('/api/playlists/artist', 'GET', token, null);
        } catch (error) {
            console.error('Error al obtener playlists del artista:', error);
            throw new Error(error.message || 'Error al obtener playlists del artista');
        }
    }
}

// Crear una instancia global de la API
const api = new API();
