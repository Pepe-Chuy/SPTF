// Clase para manejar la interfaz de usuario principal
class UICore {
    constructor() {
        // Referencias a elementos DOM comunes
        this.pages = document.querySelectorAll('.page');
        this.navLinks = document.querySelectorAll('#main-nav a');
        this.loginBtn = document.getElementById('login-btn');
        this.registerBtn = document.getElementById('register-btn');
        this.logoutBtn = document.getElementById('logout-btn');
        this.profileLink = document.getElementById('profile-link');
        
        // Referencias a modales
        this.loginModal = document.getElementById('login-modal');
        this.registerModal = document.getElementById('register-modal');
        this.editProfileModal = document.getElementById('edit-profile-modal');
        this.closeModalBtns = document.querySelectorAll('.close-modal');
        
        // Referencias a formularios
        this.loginForm = document.getElementById('login-form');
        this.registerForm = document.getElementById('register-form');
        this.editProfileForm = document.getElementById('edit-profile-form');
        
        // Elemento toast para notificaciones
        this.toast = document.getElementById('toast');
    }
    
    // Inicializar eventos de la UI
    init() {
        // Eventos de navegación
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.showPage(page);
                
                // Actualizar navegación activa
                this.navLinks.forEach(navLink => navLink.classList.remove('active'));
                link.classList.add('active');
            });
        });
        
        // Eventos de modales y autenticación
        this.loginBtn.addEventListener('click', () => this.showModal(this.loginModal));
        this.registerBtn.addEventListener('click', () => this.showModal(this.registerModal));
        this.logoutBtn.addEventListener('click', () => this.handleLogout());
        
        // Cerrar modales
        this.closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal');
                this.hideModal(modal);
            });
        });
        
        // Cerrar modal al hacer clic fuera
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal(e.target);
            }
        });
        
        // Manejar envío de formularios (método antiguo, ya no se usa)
        // this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        
        // Usar botón en lugar de submit para el login
        const loginSubmitBtn = document.getElementById('login-submit-btn');
        if (loginSubmitBtn) {
            loginSubmitBtn.addEventListener('click', () => this.handleLoginDirect());
        }
        
        // Usar botón en lugar de submit para el registro
        const registerSubmitBtn = document.getElementById('register-submit-btn');
        if (registerSubmitBtn) {
            registerSubmitBtn.addEventListener('click', () => this.handleRegisterDirect());
        }
        
        // Inicializar estado de autenticación
        this.updateAuthUI();
    }
    
    // Mostrar una página específica
    showPage(pageId) {
        this.pages.forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(`${pageId}-page`).classList.add('active');
    }
    
    // Mostrar un modal
    showModal(modal) {
        modal.style.display = 'block';
    }
    
    // Ocultar un modal
    hideModal(modal) {
        modal.style.display = 'none';
    }
    
    // Actualizar la UI según el estado de autenticación
    updateAuthUI() {
        if (auth.checkAuth()) {
            // Usuario autenticado
            this.loginBtn.style.display = 'none';
            this.registerBtn.style.display = 'none';
            this.logoutBtn.style.display = 'inline-block';
            this.profileLink.style.display = 'inline-block';
            
            // Actualizar elementos que requieren autenticación
            document.querySelectorAll('.auth-required').forEach(el => {
                el.style.display = 'none';
            });
            
            // Mostrar panel de artista si el usuario es artista
            if (auth.isArtist()) {
                const artistDashboardLink = document.createElement('li');
                artistDashboardLink.innerHTML = '<a href="#" data-page="artist-dashboard">Panel de Artista</a>';
                artistDashboardLink.querySelector('a').addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showPage('artist-dashboard');
                    
                    // Actualizar navegación activa
                    this.navLinks.forEach(navLink => navLink.classList.remove('active'));
                    e.target.classList.add('active');
                });
                
                // Añadir enlace al panel de artista si no existe
                if (!document.querySelector('a[data-page="artist-dashboard"]')) {
                    document.querySelector('#main-nav ul').appendChild(artistDashboardLink);
                }
            }
        } else {
            // Usuario no autenticado
            this.loginBtn.style.display = 'inline-block';
            this.registerBtn.style.display = 'inline-block';
            this.logoutBtn.style.display = 'none';
            this.profileLink.style.display = 'none';
            
            // Actualizar elementos que requieren autenticación
            document.querySelectorAll('.auth-required').forEach(el => {
                el.style.display = 'block';
            });
            
            // Eliminar enlace al panel de artista si existe
            const artistDashboardLink = document.querySelector('a[data-page="artist-dashboard"]');
            if (artistDashboardLink) {
                artistDashboardLink.closest('li').remove();
            }
        }
    }
    
    // Manejar inicio de sesión
    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            await auth.login({ email, password });
            this.hideModal(this.loginModal);
            this.updateAuthUI();
            this.showToast('Inicio de sesión exitoso', 'success');
            
            // Limpiar formulario
            this.loginForm.reset();
        } catch (error) {
            this.showToast(error.message || 'Error al iniciar sesión', 'error');
        }
    }
    
    // Nuevo método de login directo
    async handleLoginDirect() {
        // Obtener valores del formulario directamente
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');
        
        if (!emailInput || !passwordInput) {
            this.showToast('Error: No se pudieron encontrar los campos del formulario', 'error');
            return;
        }
        
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        
        // Validar que los campos no estén vacíos
        if (!email || !password) {
            this.showToast('Por favor complete todos los campos', 'error');
            return;
        }
        
        console.log('Datos del formulario de login directo:', { email, password });
        
        try {
            // Hacer una petición directa al servidor
            const xhr = new XMLHttpRequest();
            // Usar la URL de la API del config en lugar de hardcodear
            xhr.open('POST', `${CONFIG.API_BASE_URL}/users/login`, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    console.log('Respuesta exitosa del servidor:', xhr.status, xhr.responseText);
                    try {
                        const data = JSON.parse(xhr.responseText);
                        
                        // Guardar token en localStorage
                        localStorage.setItem(CONFIG.TOKEN_KEY, data.token);
                        
                        // Guardar usuario actual
                        localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(data.user));
                        
                        // Actualizar UI
                        this.hideModal(this.loginModal);
                        this.updateAuthUI();
                        this.showToast('Inicio de sesión exitoso', 'success');
                        
                        // Limpiar formulario
                        this.loginForm.reset();
                    } catch (e) {
                        console.error('Error al parsear respuesta:', e);
                        this.showToast('Error al procesar respuesta del servidor', 'error');
                    }
                } else {
                    console.error('Error del servidor:', xhr.status, xhr.responseText);
                    try {
                        const errorData = JSON.parse(xhr.responseText);
                        this.showToast(errorData.message || 'Error al iniciar sesión', 'error');
                    } catch (e) {
                        this.showToast('Error al iniciar sesión', 'error');
                    }
                }
            };
            
            xhr.onerror = () => {
                console.error('Error de red al iniciar sesión');
                this.showToast('Error de conexión al servidor', 'error');
            };
            
            // Crear objeto de datos
            const userData = { email, password };
            
            // Enviar los datos
            xhr.send(JSON.stringify(userData));
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            this.showToast('Error al conectar con el servidor', 'error');
        }
    }
    
    // Manejar registro (método antiguo, ya no se usa)
    async handleRegister(e) {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const role = document.getElementById('register-role').value;
        
        console.log('Datos del formulario de registro:', { name, email, password, role });
        
        try {
            await auth.register({ name, email, password, role });
            this.hideModal(this.registerModal);
            this.updateAuthUI();
            this.showToast('Registro exitoso', 'success');
            
            // Limpiar formulario
            this.registerForm.reset();
        } catch (error) {
            this.showToast(error.message || 'Error al registrarse', 'error');
        }
    }

    // Nuevo método de registro directo
    async handleRegisterDirect() {
        // Obtener valores del formulario directamente
        const nameInput = document.getElementById('register-name');
        const emailInput = document.getElementById('register-email');
        const passwordInput = document.getElementById('register-password');
        const roleInput = document.getElementById('register-role');
        
        if (!nameInput || !emailInput || !passwordInput || !roleInput) {
            this.showToast('Error: No se pudieron encontrar los campos del formulario', 'error');
            return;
        }
        
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const role = roleInput.value;
        
        // Validar que los campos no estén vacíos
        if (!name || !email || !password || !role) {
            this.showToast('Por favor complete todos los campos', 'error');
            return;
        }
        
        console.log('Datos del formulario de registro directo:', { name, email, password, role });
        
        try {
            // Hacer una petición directa al servidor
            const xhr = new XMLHttpRequest();
            // Usar la URL de la API del config en lugar de hardcodear
            xhr.open('POST', `${CONFIG.API_BASE_URL}/users/register`, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    console.log('Respuesta exitosa del servidor:', xhr.status, xhr.responseText);
                    try {
                        const data = JSON.parse(xhr.responseText);
                        
                        // Guardar token en localStorage
                        localStorage.setItem(CONFIG.TOKEN_KEY, data.token);
                        
                        // Guardar usuario actual
                        localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(data.user));
                        
                        // Actualizar UI
                        this.hideModal(this.registerModal);
                        this.updateAuthUI();
                        this.showToast('Registro exitoso', 'success');
                        
                        // Limpiar formulario
                        this.registerForm.reset();
                    } catch (e) {
                        console.error('Error al parsear respuesta:', e);
                        this.showToast('Error al procesar respuesta del servidor', 'error');
                    }
                } else {
                    console.error('Error del servidor:', xhr.status, xhr.responseText);
                    try {
                        const errorData = JSON.parse(xhr.responseText);
                        this.showToast(errorData.message || 'Error al registrar usuario', 'error');
                    } catch (e) {
                        this.showToast('Error al registrar usuario', 'error');
                    }
                }
            };
            
            xhr.onerror = () => {
                console.error('Error de red al registrar usuario');
                this.showToast('Error de conexión al servidor', 'error');
            };
            
            // Crear objeto de datos
            const userData = { name, email, password, role };
            
            // Enviar los datos
            xhr.send(JSON.stringify(userData));
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            this.showToast('Error al conectar con el servidor', 'error');
        }
    }
    
    // Manejar actualización de perfil
    async handleProfileUpdate(e) {
        e.preventDefault();
        
        const name = document.getElementById('edit-name').value;
        const email = document.getElementById('edit-email').value;
        const password = document.getElementById('edit-password').value;
        
        const userData = { name, email };
        if (password) {
            userData.password = password;
        }
        
        try {
            await auth.updateUserInfo(userData);
            this.hideModal(this.editProfileModal);
            this.showToast('Perfil actualizado exitosamente', 'success');
            
            // Actualizar información del perfil en la UI
            this.updateProfileInfo();
            
            // Limpiar formulario
            this.editProfileForm.reset();
        } catch (error) {
            this.showToast(error.message || 'Error al actualizar perfil', 'error');
        }
    }
    
    // Manejar cierre de sesión
    handleLogout() {
        auth.logout();
        this.updateAuthUI();
        this.showPage('home');
        this.showToast('Sesión cerrada exitosamente', 'success');
    }
    
    // Mostrar notificación toast
    showToast(message, type = 'success') {
        this.toast.textContent = message;
        this.toast.className = 'toast';
        this.toast.classList.add(type);
        this.toast.classList.add('show');
        
        // Ocultar toast después de 3 segundos
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }
    
    // Formatear duración de canción (de segundos a MM:SS)
    formatDuration(durationMs) {
        const minutes = Math.floor(durationMs / 60000);
        const seconds = ((durationMs % 60000) / 1000).toFixed(0);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    
    // Formatear número (ej: 1500 -> 1.5K)
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
}

// Crear instancia global de UICore
const uiCore = new UICore();
