// Rutas de autenticación
class AuthRouter {
    constructor() {
        // No necesitamos almacenamiento local, usaremos MongoDB
        this.apiBaseUrl = CONFIG.API_BASE_URL;
    }
    
    // Registrar un nuevo usuario
    register(userData) {
        return new Promise((resolve, reject) => {
            try {
                console.log('Enviando datos de registro:', userData);
                
                // Usar XMLHttpRequest en lugar de fetch
                const xhr = new XMLHttpRequest();
                xhr.open('POST', `${this.apiBaseUrl.replace(/\/api$/, '')}/api/users/register`, true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.setRequestHeader('Accept', 'application/json');
                
                xhr.onload = function() {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        console.log('Respuesta exitosa del servidor:', xhr.status);
                        try {
                            const data = JSON.parse(xhr.responseText);
                            
                            // Guardar token en localStorage
                            localStorage.setItem(CONFIG.TOKEN_KEY, data.token);
                            
                            // Guardar usuario actual
                            localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(data.user));
                            
                            resolve(data);
                        } catch (e) {
                            console.error('Error al parsear respuesta:', e);
                            reject({ status: xhr.status, message: 'Error al procesar respuesta del servidor' });
                        }
                    } else {
                        console.error('Error del servidor:', xhr.status, xhr.responseText);
                        try {
                            const errorData = JSON.parse(xhr.responseText);
                            reject({ status: xhr.status, message: errorData.message || 'Error al registrar usuario' });
                        } catch (e) {
                            reject({ status: xhr.status, message: 'Error al registrar usuario' });
                        }
                    }
                };
                
                xhr.onerror = function() {
                    console.error('Error de red al registrar usuario');
                    reject({ status: 0, message: 'Error de conexión al servidor' });
                };
                
                // Enviar los datos
                xhr.send(JSON.stringify(userData));
            } catch (error) {
                console.error('Error al registrar usuario:', error);
                reject({ status: 500, message: 'Error al conectar con el servidor' });
            }
        });
    }
    
    // Iniciar sesión
    login(credentials) {
        return new Promise((resolve, reject) => {
            try {
                console.log('Enviando credenciales de login:', credentials);
                
                // Usar XMLHttpRequest en lugar de fetch
                const xhr = new XMLHttpRequest();
                xhr.open('POST', `${this.apiBaseUrl.replace(/\/api$/, '')}/api/users/login`, true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.setRequestHeader('Accept', 'application/json');
                
                xhr.onload = function() {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        console.log('Respuesta exitosa del servidor:', xhr.status);
                        try {
                            const data = JSON.parse(xhr.responseText);
                            
                            // Guardar token en localStorage
                            localStorage.setItem(CONFIG.TOKEN_KEY, data.token);
                            
                            // Guardar usuario actual
                            localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(data.user));
                            
                            resolve(data);
                        } catch (e) {
                            console.error('Error al parsear respuesta:', e);
                            reject({ status: xhr.status, message: 'Error al procesar respuesta del servidor' });
                        }
                    } else {
                        console.error('Error del servidor:', xhr.status, xhr.responseText);
                        try {
                            const errorData = JSON.parse(xhr.responseText);
                            reject({ status: xhr.status, message: errorData.message || 'Error al iniciar sesión' });
                        } catch (e) {
                            reject({ status: xhr.status, message: 'Error al iniciar sesión' });
                        }
                    }
                };
                
                xhr.onerror = function() {
                    console.error('Error de red al iniciar sesión');
                    reject({ status: 0, message: 'Error de conexión al servidor' });
                };
                
                // Enviar los datos
                xhr.send(JSON.stringify(credentials));
            } catch (error) {
                console.error('Error al iniciar sesión:', error);
                reject({ status: 500, message: 'Error al conectar con el servidor' });
            }
        });
    }
    
    // Obtener perfil de usuario
    getProfile(token) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!token) {
                    return reject({ status: 401, message: 'No autorizado' });
                }
                
                // Hacer petición al servidor para obtener perfil
                const response = await fetch(`${this.apiBaseUrl.replace(/\/api$/, '')}/api/users/profile`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    return reject({ status: response.status, message: data.message || 'Error al obtener perfil' });
                }
                
                resolve(data);
            } catch (error) {
                console.error('Error al obtener perfil:', error);
                reject({ status: 500, message: 'Error al conectar con el servidor' });
            }
        });
    }
    
    // Actualizar perfil de usuario
    updateProfile(token, userData) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!token) {
                    return reject({ status: 401, message: 'No autorizado' });
                }
                
                // Hacer petición al servidor para actualizar perfil
                const response = await fetch(`${this.apiBaseUrl.replace(/\/api$/, '')}/api/users/profile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(userData)
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    return reject({ status: response.status, message: data.message || 'Error al actualizar perfil' });
                }
                
                // Actualizar usuario en localStorage
                localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(data));
                
                resolve(data);
            } catch (error) {
                console.error('Error al actualizar perfil:', error);
                reject({ status: 500, message: 'Error al conectar con el servidor' });
            }
        });
    }
    
    // Convertir usuario a artista
    becomeArtist(token) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!token) {
                    return reject({ status: 401, message: 'No autorizado' });
                }
                
                // Hacer petición al servidor para convertir en artista
                const response = await fetch(`${this.apiBaseUrl.replace(/\/api$/, '')}/api/users/become-artist`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    return reject({ status: response.status, message: data.message || 'Error al convertir en artista' });
                }
                
                // Actualizar usuario en localStorage
                localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(data));
                
                resolve(data);
            } catch (error) {
                console.error('Error al convertir en artista:', error);
                reject({ status: 500, message: 'Error al conectar con el servidor' });
            }
        });
    }
}

// Exportar instancia de AuthRouter
const authRouter = new AuthRouter();
