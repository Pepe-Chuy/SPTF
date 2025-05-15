// Archivo principal de enrutamiento
// Este archivo actúa como un controlador central para todas las rutas

class Router {
    constructor() {
        // Inicializar rutas
        this.routes = {
            // Rutas de autenticación
            '/api/users/register': {
                post: (data) => authRouter.register(data)
            },
            '/api/users/login': {
                post: (data) => authRouter.login(data)
            },
            '/api/users/profile': {
                get: (token) => authRouter.getProfile(token),
                put: (token, data) => authRouter.updateProfile(token, data)
            },
            '/api/users/become-artist': {
                put: (token) => authRouter.becomeArtist(token)
            },
            
            // Rutas de favoritos
            '/api/favorites/artist': {
                post: (token, data) => favoritesRouter.addArtistToFavorites(token, data)
            },
            '/api/favorites/artist/:id': {
                delete: (token, id) => favoritesRouter.removeArtistFromFavorites(token, id)
            },
            '/api/favorites/song': {
                post: (token, data) => favoritesRouter.addSongToFavorites(token, data)
            },
            '/api/favorites/song/:id': {
                delete: (token, id) => favoritesRouter.removeSongFromFavorites(token, id)
            },
            '/api/favorites/artists': {
                get: (token) => favoritesRouter.getFavoriteArtists(token)
            },
            '/api/favorites/songs': {
                get: (token) => favoritesRouter.getFavoriteSongs(token)
            },
            
            // Rutas de artistas y canciones
            '/api/songs': {
                post: (token, data) => artistRouter.createSong(token, data)
            },
            '/api/songs/artist': {
                get: (token) => artistRouter.getArtistSongs(token)
            },
            '/api/songs/:id': {
                delete: (token, id) => artistRouter.deleteSong(token, id)
            },
            '/api/playlists': {
                post: (token, data) => artistRouter.createPlaylist(token, data)
            },
            '/api/playlists/artist': {
                get: (token) => artistRouter.getArtistPlaylists(token)
            },
            '/api/playlists/:id': {
                delete: (token, id) => artistRouter.deletePlaylist(token, id)
            }
        };
    }
    
    // Manejar solicitud
    async handleRequest(path, method, token, data) {
        // Convertir método a minúsculas
        method = method.toLowerCase();
        
        // Buscar ruta exacta
        let route = this.routes[path];
        
        // Si no se encuentra una ruta exacta, buscar rutas con parámetros
        if (!route) {
            // Buscar rutas con parámetros (por ejemplo, /api/favorites/artist/:id)
            const routeKeys = Object.keys(this.routes);
            for (const routeKey of routeKeys) {
                // Verificar si la ruta tiene un parámetro
                if (routeKey.includes('/:')) {
                    const routeParts = routeKey.split('/');
                    const pathParts = path.split('/');
                    
                    // Verificar si la cantidad de partes coincide
                    if (routeParts.length === pathParts.length) {
                        let match = true;
                        let params = {};
                        
                        // Comparar cada parte de la ruta
                        for (let i = 0; i < routeParts.length; i++) {
                            // Si la parte de la ruta comienza con ':', es un parámetro
                            if (routeParts[i].startsWith(':')) {
                                const paramName = routeParts[i].substring(1);
                                params[paramName] = pathParts[i];
                            } else if (routeParts[i] !== pathParts[i]) {
                                // Si las partes no coinciden, no es una coincidencia
                                match = false;
                                break;
                            }
                        }
                        
                        // Si es una coincidencia, usar esta ruta
                        if (match) {
                            route = this.routes[routeKey];
                            // Usar el primer parámetro como ID (asumiendo que solo hay un parámetro)
                            data = Object.values(params)[0];
                            break;
                        }
                    }
                }
            }
        }
        
        // Si no se encuentra la ruta, devolver error
        if (!route) {
            return Promise.reject({
                status: 404,
                message: `Ruta ${path} no encontrada`
            });
        }
        
        // Si no se encuentra el método, devolver error
        if (!route[method]) {
            return Promise.reject({
                status: 405,
                message: `Método ${method} no permitido para la ruta ${path}`
            });
        }
        
        try {
            // Ejecutar el controlador de la ruta
            return await route[method](token, data);
        } catch (error) {
            return Promise.reject(error);
        }
    }
}

// Exportar instancia de Router
const router = new Router();
