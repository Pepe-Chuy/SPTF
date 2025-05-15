// Clase para manejar la interfaz del perfil de usuario
class UIProfile {
    constructor() {
        // Referencias a elementos DOM
        this.userInfo = document.getElementById('user-info');
        this.editProfileBtn = document.getElementById('edit-profile-btn');
        this.becomeArtistBtn = document.getElementById('become-artist-btn');
        
        // Referencias a elementos del panel de artista
        this.artistSongsContainer = document.getElementById('artist-songs-container');
        this.artistPlaylistsContainer = document.getElementById('artist-playlists-container');
        this.uploadSongForm = document.getElementById('upload-song-form');
        this.createPlaylistForm = document.getElementById('create-playlist-form');
        this.songAlbumSelect = document.getElementById('song-album');
        this.playlistSongsSelection = document.getElementById('playlist-songs-selection');
        this.dashboardBtns = document.querySelectorAll('.dashboard-btn');
        this.dashboardSections = document.querySelectorAll('.dashboard-section');
    }
    
    // Inicializar eventos
    init() {
        // Eventos del perfil
        this.editProfileBtn.addEventListener('click', () => this.handleEditProfile());
        this.becomeArtistBtn.addEventListener('click', () => this.handleBecomeArtist());
        
        // Eventos del panel de artista
        this.uploadSongForm.addEventListener('submit', (e) => this.handleUploadSong(e));
        this.createPlaylistForm.addEventListener('submit', (e) => this.handleCreatePlaylist(e));
        
        // Eventos de navegación del panel de artista
        this.dashboardBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const section = btn.getAttribute('data-section');
                this.showDashboardSection(section);
                
                // Actualizar botón activo
                this.dashboardBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }
    
    // Cargar información del perfil
    async loadProfileInfo() {
        if (!auth.checkAuth()) {
            uiCore.showPage('home');
            uiCore.showToast('Debes iniciar sesión para ver tu perfil', 'error');
            return;
        }
        
        try {
            const user = auth.getCurrentUser();
            
            if (!user) {
                this.userInfo.innerHTML = '<p class="loading-message">Error al cargar información del usuario</p>';
                return;
            }
            
            // Formatear fecha de creación de cuenta
            const createdAt = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Desconocido';
            
            this.userInfo.innerHTML = `
                <div class="profile-field">
                    <span class="field-label">Nombre:</span>
                    <span class="field-value">${user.name}</span>
                </div>
                <div class="profile-field">
                    <span class="field-label">Email:</span>
                    <span class="field-value">${user.email}</span>
                </div>
                <div class="profile-field">
                    <span class="field-label">Tipo de cuenta:</span>
                    <span class="field-value">${user.role === 'artist' ? 'Artista' : 'Usuario'}</span>
                </div>
                <div class="profile-field">
                    <span class="field-label">Miembro desde:</span>
                    <span class="field-value">${createdAt}</span>
                </div>
            `;
            
            // Mostrar/ocultar botón de convertirse en artista
            if (user.role === 'artist') {
                this.becomeArtistBtn.style.display = 'none';
            } else {
                this.becomeArtistBtn.style.display = 'inline-block';
            }
            
            // Si el usuario es artista, cargar datos del panel de artista
            if (user.role === 'artist') {
                this.loadArtistDashboard();
            }
        } catch (error) {
            console.error('Error al cargar información del perfil:', error);
            this.userInfo.innerHTML = '<p class="loading-message">Error al cargar información del usuario</p>';
            uiCore.showToast('Error al cargar información del perfil', 'error');
        }
    }
    
    // Manejar edición de perfil
    handleEditProfile() {
        const user = auth.getCurrentUser();
        
        if (!user) {
            uiCore.showToast('Error al cargar información del usuario', 'error');
            return;
        }
        
        // Rellenar formulario con datos actuales
        document.getElementById('edit-name').value = user.name;
        document.getElementById('edit-email').value = user.email;
        document.getElementById('edit-password').value = '';
        
        // Mostrar modal de edición de perfil
        uiCore.showModal(document.getElementById('edit-profile-modal'));
    }
    
    // Manejar convertirse en artista
    async handleBecomeArtist() {
        if (!auth.checkAuth()) {
            uiCore.showToast('Debes iniciar sesión para convertirte en artista', 'error');
            return;
        }
        
        try {
            await auth.convertToArtist();
            uiCore.updateAuthUI();
            this.loadProfileInfo();
            uiCore.showToast('¡Ahora eres un artista!', 'success');
        } catch (error) {
            console.error('Error al convertirse en artista:', error);
            uiCore.showToast('Error al convertirse en artista', 'error');
        }
    }
    
    // Cargar panel de artista
    async loadArtistDashboard() {
        try {
            // Cargar canciones del artista
            await this.loadArtistSongs();
            
            // Cargar playlists del artista
            await this.loadArtistPlaylists();
            
            // Cargar álbumes para el formulario de subida de canciones
            await this.loadAlbumsForSelect();
            
            // Cargar canciones para el formulario de creación de playlists
            await this.loadSongsForPlaylistForm();
        } catch (error) {
            console.error('Error al cargar panel de artista:', error);
            uiCore.showToast('Error al cargar panel de artista', 'error');
        }
    }
    
    // Cargar canciones del artista
    async loadArtistSongs() {
        try {
            // Mostrar mensaje de carga
            this.artistSongsContainer.innerHTML = '<p class="loading-message">Cargando canciones...</p>';
            
            // Obtener canciones del artista
            const songs = await api.getArtistSongs();
            
            // Si no hay canciones, mostrar mensaje
            if (!songs || songs.length === 0) {
                this.artistSongsContainer.innerHTML = '<p class="loading-message">No has subido canciones todavía</p>';
                return;
            }
            
            // Limpiar contenedor
            this.artistSongsContainer.innerHTML = '';
            
            // Crear elemento para cada canción
            songs.forEach((song, index) => {
                const songElement = this.createArtistSongElement(song, index + 1);
                this.artistSongsContainer.appendChild(songElement);
            });
        } catch (error) {
            console.error('Error al cargar canciones del artista:', error);
            this.artistSongsContainer.innerHTML = '<p class="loading-message">Error al cargar canciones</p>';
        }
    }
    
    // Cargar playlists del artista
    async loadArtistPlaylists() {
        try {
            // Mostrar mensaje de carga
            this.artistPlaylistsContainer.innerHTML = '<p class="loading-message">Cargando playlists...</p>';
            
            // Obtener playlists del artista
            const playlists = await api.getArtistPlaylists();
            
            // Si no hay playlists, mostrar mensaje
            if (!playlists || playlists.length === 0) {
                this.artistPlaylistsContainer.innerHTML = '<p class="loading-message">No has creado playlists todavía</p>';
                return;
            }
            
            // Limpiar contenedor
            this.artistPlaylistsContainer.innerHTML = '';
            
            // Crear tarjeta para cada playlist
            playlists.forEach(playlist => {
                const playlistCard = this.createPlaylistCard(playlist);
                this.artistPlaylistsContainer.appendChild(playlistCard);
            });
        } catch (error) {
            console.error('Error al cargar playlists del artista:', error);
            this.artistPlaylistsContainer.innerHTML = '<p class="loading-message">Error al cargar playlists</p>';
        }
    }
    
    // Cargar álbumes para el formulario de subida de canciones
    async loadAlbumsForSelect() {
        try {
            // En una implementación real, aquí se cargarían los álbumes del artista
            // Por ahora, simplemente añadimos algunas opciones de ejemplo
            this.songAlbumSelect.innerHTML = `
                <option value="">Seleccionar Álbum</option>
                <option value="album1">Mi Primer Álbum</option>
                <option value="album2">Sencillos</option>
            `;
        } catch (error) {
            console.error('Error al cargar álbumes para el formulario:', error);
        }
    }
    
    // Cargar canciones para el formulario de creación de playlists
    async loadSongsForPlaylistForm() {
        try {
            // Obtener canciones del artista
            const songs = await api.getArtistSongs();
            
            // Si no hay canciones, mostrar mensaje
            if (!songs || songs.length === 0) {
                this.playlistSongsSelection.innerHTML = '<p class="loading-message">No has subido canciones todavía</p>';
                return;
            }
            
            // Limpiar contenedor
            this.playlistSongsSelection.innerHTML = '';
            
            // Crear checkbox para cada canción
            songs.forEach(song => {
                const checkboxItem = document.createElement('div');
                checkboxItem.className = 'checkbox-item';
                checkboxItem.innerHTML = `
                    <input type="checkbox" id="song-${song._id}" name="songs" value="${song._id}">
                    <label for="song-${song._id}">${song.name}</label>
                `;
                this.playlistSongsSelection.appendChild(checkboxItem);
            });
        } catch (error) {
            console.error('Error al cargar canciones para el formulario de playlist:', error);
            this.playlistSongsSelection.innerHTML = '<p class="loading-message">Error al cargar canciones</p>';
        }
    }
    
    // Crear elemento de canción para el panel de artista
    createArtistSongElement(song, index) {
        const songElement = document.createElement('div');
        songElement.className = 'song-item';
        
        // Duración formateada
        const duration = song.duration ? uiCore.formatDuration(song.duration * 1000) : '0:00';
        
        songElement.innerHTML = `
            <div class="song-number">${index}</div>
            <div class="song-info">
                <h4 class="song-title">${song.name}</h4>
                <p class="song-artist">${auth.getCurrentUser().name}</p>
            </div>
            <div class="song-duration">${duration}</div>
            <div class="song-actions">
                ${song.previewUrl ? `<button class="play-btn" data-preview="${song.previewUrl}"><i class="fas fa-play"></i></button>` : ''}
                <button class="delete-song-btn" data-id="${song._id}"><i class="fas fa-trash"></i></button>
            </div>
        `;
        
        // Añadir evento para reproducir preview (si está disponible)
        if (song.previewUrl) {
            songElement.querySelector('.play-btn').addEventListener('click', (e) => {
                this.handlePlayPreview(e, song.previewUrl);
            });
        }
        
        // Añadir evento para eliminar canción
        songElement.querySelector('.delete-song-btn').addEventListener('click', () => {
            this.handleDeleteSong(song._id);
        });
        
        return songElement;
    }
    
    // Crear tarjeta de playlist
    createPlaylistCard(playlist) {
        const card = document.createElement('div');
        card.className = 'card';
        
        // Imagen por defecto para playlist
        const imageUrl = 'https://via.placeholder.com/300?text=Playlist';
        
        card.innerHTML = `
            <img src="${imageUrl}" alt="${playlist.name}" class="card-img">
            <div class="card-content">
                <h3 class="card-title">${playlist.name}</h3>
                <p class="card-subtitle">
                    ${playlist.songs ? playlist.songs.length : 0} canciones
                </p>
                <div class="card-actions">
                    <button class="btn view-playlist-btn" data-id="${playlist._id}">Ver</button>
                    <button class="btn delete-playlist-btn" data-id="${playlist._id}"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
        
        // Añadir evento para ver detalles de la playlist
        card.querySelector('.view-playlist-btn').addEventListener('click', () => {
            this.handleViewPlaylist(playlist._id);
        });
        
        // Añadir evento para eliminar playlist
        card.querySelector('.delete-playlist-btn').addEventListener('click', () => {
            this.handleDeletePlaylist(playlist._id);
        });
        
        return card;
    }
    
    // Manejar subida de canción
    async handleUploadSong(e) {
        e.preventDefault();
        
        const name = document.getElementById('song-name').value;
        const duration = document.getElementById('song-duration').value;
        const albumId = document.getElementById('song-album').value;
        const previewUrl = document.getElementById('song-preview').value;
        
        try {
            const songData = {
                name,
                duration: parseInt(duration),
                previewUrl: previewUrl || null
            };
            
            if (albumId) {
                songData.albumId = albumId;
            }
            
            await api.createSong(songData);
            
            // Recargar canciones del artista
            await this.loadArtistSongs();
            
            // Recargar canciones para el formulario de creación de playlists
            await this.loadSongsForPlaylistForm();
            
            // Limpiar formulario
            this.uploadSongForm.reset();
            
            uiCore.showToast('Canción subida exitosamente', 'success');
        } catch (error) {
            console.error('Error al subir canción:', error);
            uiCore.showToast('Error al subir canción', 'error');
        }
    }
    
    // Manejar creación de playlist
    async handleCreatePlaylist(e) {
        e.preventDefault();
        
        const name = document.getElementById('playlist-name').value;
        const description = document.getElementById('playlist-description').value;
        
        // Obtener canciones seleccionadas
        const selectedSongs = Array.from(document.querySelectorAll('input[name="songs"]:checked')).map(checkbox => checkbox.value);
        
        if (selectedSongs.length === 0) {
            uiCore.showToast('Debes seleccionar al menos una canción', 'error');
            return;
        }
        
        try {
            const playlistData = {
                name,
                description,
                songs: selectedSongs
            };
            
            await api.createPlaylist(playlistData);
            
            // Recargar playlists del artista
            await this.loadArtistPlaylists();
            
            // Limpiar formulario
            this.createPlaylistForm.reset();
            
            // Desmarcar todas las canciones
            document.querySelectorAll('input[name="songs"]').forEach(checkbox => {
                checkbox.checked = false;
            });
            
            uiCore.showToast('Playlist creada exitosamente', 'success');
        } catch (error) {
            console.error('Error al crear playlist:', error);
            uiCore.showToast('Error al crear playlist', 'error');
        }
    }
    
    // Manejar eliminación de canción
    async handleDeleteSong(songId) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta canción?')) {
            return;
        }
        
        try {
            // En una implementación real, aquí se llamaría a la API para eliminar la canción
            console.log('Eliminando canción:', songId);
            
            // Recargar canciones del artista
            await this.loadArtistSongs();
            
            // Recargar canciones para el formulario de creación de playlists
            await this.loadSongsForPlaylistForm();
            
            uiCore.showToast('Canción eliminada exitosamente', 'success');
        } catch (error) {
            console.error('Error al eliminar canción:', error);
            uiCore.showToast('Error al eliminar canción', 'error');
        }
    }
    
    // Manejar eliminación de playlist
    async handleDeletePlaylist(playlistId) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta playlist?')) {
            return;
        }
        
        try {
            // En una implementación real, aquí se llamaría a la API para eliminar la playlist
            console.log('Eliminando playlist:', playlistId);
            
            // Recargar playlists del artista
            await this.loadArtistPlaylists();
            
            uiCore.showToast('Playlist eliminada exitosamente', 'success');
        } catch (error) {
            console.error('Error al eliminar playlist:', error);
            uiCore.showToast('Error al eliminar playlist', 'error');
        }
    }
    
    // Manejar ver detalles de playlist
    handleViewPlaylist(playlistId) {
        // En una implementación real, aquí se cargarían los detalles de la playlist
        console.log('Ver detalles de playlist:', playlistId);
        uiCore.showToast('Funcionalidad no implementada', 'error');
    }
    
    // Mostrar sección del panel de artista
    showDashboardSection(sectionId) {
        this.dashboardSections.forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionId}-section`).classList.add('active');
    }
    
    // Manejar reproducción de preview
    handlePlayPreview(e, previewUrl) {
        // Detener cualquier audio que esté reproduciéndose
        const currentAudio = document.querySelector('audio');
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.remove();
        }
        
        const button = e.currentTarget;
        const icon = button.querySelector('i');
        
        // Si ya hay un icono de pausa en este botón, detener la reproducción
        if (icon.classList.contains('fa-pause')) {
            icon.classList.replace('fa-pause', 'fa-play');
            return;
        }
        
        // Restablecer todos los iconos a "play"
        document.querySelectorAll('.play-btn i').forEach(i => {
            i.classList.replace('fa-pause', 'fa-play');
        });
        
        // Cambiar icono a "pause"
        icon.classList.replace('fa-play', 'fa-pause');
        
        // Crear y reproducir audio
        const audio = new Audio(previewUrl);
        audio.volume = 0.5;
        document.body.appendChild(audio);
        
        audio.play();
        
        // Cuando termine, restaurar icono
        audio.addEventListener('ended', () => {
            icon.classList.replace('fa-pause', 'fa-play');
            audio.remove();
        });
    }
}

// Crear instancia global de UIProfile
const uiProfile = new UIProfile();
