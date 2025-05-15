// Clase para manejar la autenticación de usuarios
class Auth {
    constructor() {
        this.token = localStorage.getItem(CONFIG.TOKEN_KEY) || null;
        this.user = JSON.parse(localStorage.getItem(CONFIG.USER_KEY) || 'null');
        this.isAuthenticated = !!this.token;
    }

    // Método para iniciar sesión
    async login(email, password) {
        try {
            const response = await api.loginUser({ email, password });
            this.token = response.token;
            this.user = response.user;
            this.isAuthenticated = true;
            
            // Guardar en localStorage
            localStorage.setItem(CONFIG.TOKEN_KEY, this.token);
            localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(this.ucser));
            
            return this.user;
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    }

    // Método para registrar un usuario
    async register(userData) {
        try {
            const response = await api.registerUser(userData);
            this.token = response.token;
            this.user = response.user;
            this.isAuthenticated = true;
            
            // Guardar en localStorage
            localStorage.setItem(CONFIG.TOKEN_KEY, this.token);
            localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(this.user));
            
            return this.user;
        } catch (error) {
            console.error('Error en registro:', error);
            throw error;
        }
    }

    // Método para cerrar sesión
    logout() {
        this.token = null;
        this.user = null;
        this.isAuthenticated = false;
        
        // Eliminar de localStorage
        localStorage.removeItem(CONFIG.TOKEN_KEY);
        localStorage.removeItem(CONFIG.USER_KEY);
    }

    // Método para verificar si el usuario está autenticado
    checkAuth() {
        return this.isAuthenticated;
    }

    // Método para verificar si el usuario es un artista
    isArtist() {
        return this.user && this.user.role === 'artist';
    }

    // Método para actualizar la información del usuario
    async updateUserInfo(userData) {
        try {
            const updatedUser = await api.updateUserProfile(userData);
            this.user = updatedUser;
            
            // Actualizar en localStorage
            localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(this.user));
            
            return this.user;
        } catch (error) {
            console.error('Error al actualizar información del usuario:', error);
            throw error;
        }
    }

    // Método para convertir un usuario en artista
    async convertToArtist() {
        try {
            const updatedUser = await api.becomeArtist();
            this.user = updatedUser;
            
            // Actualizar en localStorage
            localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(this.user));
            
            return this.user;
        } catch (error) {
            console.error('Error al convertir usuario en artista:', error);
            throw error;
        }
    }

    // Método para obtener el usuario actual
    getCurrentUser() {
        return this.user;
    }

    // Método para obtener el token actual
    getToken() {
        return this.token;
    }
}

// Crear una instancia global de Auth
const auth = new Auth();
