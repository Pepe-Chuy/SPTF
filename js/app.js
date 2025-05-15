// Archivo principal para inicializar la aplicación

// Clase principal de la aplicación
class App {
    constructor() {
        // Inicializar componentes de la UI
        this.initComponents();
        
        // Inicializar eventos de navegación
        this.initNavigation();
        
        // Inicializar eventos de pestañas
        this.initTabs();
        
        // Cargar contenido inicial
        this.loadInitialContent();
    }
    
    // Inicializar componentes de la UI
    initComponents() {
        // Inicializar componente principal de la UI
        uiCore.init();
        
        // Inicializar componente de búsqueda
        uiSearch.init();
        
        // Inicializar componente de artista
        uiArtist.init();
        
        // Inicializar componente de perfil
        uiProfile.init();
    }
    
    // Inicializar eventos de navegación
    initNavigation() {
        // Evento para cargar la página de favoritos
        document.querySelector('a[data-page="favorites"]').addEventListener('click', () => {
            this.loadFavoritesPage();
        });
        
        // Evento para cargar la página de perfil
        document.querySelector('a[data-page="profile"]').addEventListener('click', () => {
            uiProfile.loadProfileInfo();
        });
    }
    
    // Inicializar eventos de pestañas
    initTabs() {
        // Pestañas de favoritos
        const favoriteTabs = document.querySelectorAll('.tab-btn');
        const favoriteContents = document.querySelectorAll('.tab-content');
        
        favoriteTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                
                // Actualizar pestaña activa
                favoriteTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Mostrar contenido de la pestaña
                favoriteContents.forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(tabId).classList.add('active');
                
                // Cargar contenido de la pestaña
                if (tabId === 'favorite-artists') {
                    this.loadFavoriteArtists();
                } else if (tabId === 'favorite-songs') {
                    this.loadFavoriteSongs();
                }
            });
        });
    }
    
    // Cargar contenido inicial
    async loadInitialContent() {
        try {
            // Cargar página de inicio
            await uiHome.init();
        } catch (error) {
            console.error('Error al cargar contenido inicial:', error);
            uiCore.showToast('Error al cargar contenido inicial', 'error');
        }
    }
    
    // Cargar página de favoritos
    loadFavoritesPage() {
        // Verificar si el usuario está autenticado
        if (!auth.checkAuth()) {
            document.getElementById('favorite-artists-container').innerHTML = '<p class="auth-required">Inicia sesión para ver tus artistas favoritos</p>';
            document.getElementById('favorite-songs-container').innerHTML = '<p class="auth-required">Inicia sesión para ver tus canciones favoritas</p>';
            return;
        }
        
        // Cargar favoritos según la pestaña activa
        const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
        
        if (activeTab === 'favorite-artists') {
            this.loadFavoriteArtists();
        } else if (activeTab === 'favorite-songs') {
            this.loadFavoriteSongs();
        }
    }
    
    // Cargar artistas favoritos
    async loadFavoriteArtists() {
        // Verificar si el usuario está autenticado
        if (!auth.checkAuth()) {
            document.getElementById('favorite-artists-container').innerHTML = '<p class="auth-required">Inicia sesión para ver tus artistas favoritos</p>';
            return;
        }
        
        try {
            // Mostrar mensaje de carga
            document.getElementById('favorite-artists-container').innerHTML = '<p class="loading-message">Cargando artistas favoritos...</p>';
            
            // Obtener artistas favoritos
            const artists = await api.getFavoriteArtists();
            
            // Si no hay artistas favoritos, mostrar mensaje
            if (!artists || artists.length === 0) {
                document.getElementById('favorite-artists-container').innerHTML = '<p class="loading-message">No tienes artistas favoritos</p>';
                return;
            }
            
            // Limpiar contenedor
            document.getElementById('favorite-artists-container').innerHTML = '';
            
            // Crear tarjeta para cada artista
            artists.forEach(artist => {
                const artistCard = this.createFavoriteArtistCard(artist);
                document.getElementById('favorite-artists-container').appendChild(artistCard);
            });
        } catch (error) {
            console.error('Error al cargar artistas favoritos:', error);
            document.getElementById('favorite-artists-container').innerHTML = '<p class="loading-message">Error al cargar artistas favoritos</p>';
            uiCore.showToast('Error al cargar artistas favoritos', 'error');
        }
    }
    
    // Cargar canciones favoritas
    async loadFavoriteSongs() {
        // Verificar si el usuario está autenticado
        if (!auth.checkAuth()) {
            document.getElementById('favorite-songs-container').innerHTML = '<p class="auth-required">Inicia sesión para ver tus canciones favoritas</p>';
            return;
        }
        
        try {
            // Mostrar mensaje de carga
            document.getElementById('favorite-songs-container').innerHTML = '<p class="loading-message">Cargando canciones favoritas...</p>';
            
            // Obtener canciones favoritas
            const songs = await api.getFavoriteSongs();
            
            // Si no hay canciones favoritas, mostrar mensaje
            if (!songs || songs.length === 0) {
                document.getElementById('favorite-songs-container').innerHTML = '<p class="loading-message">No tienes canciones favoritas</p>';
                return;
            }
            
            // Limpiar contenedor
            document.getElementById('favorite-songs-container').innerHTML = '';
            
            // Crear elemento para cada canción
            songs.forEach((song, index) => {
                const songElement = this.createFavoriteSongElement(song, index + 1);
                document.getElementById('favorite-songs-container').appendChild(songElement);
            });
        } catch (error) {
            console.error('Error al cargar canciones favoritas:', error);
            document.getElementById('favorite-songs-container').innerHTML = '<p class="loading-message">Error al cargar canciones favoritas</p>';
            uiCore.showToast('Error al cargar canciones favoritas', 'error');
        }
    }
    
    // Crear tarjeta de artista favorito
    createFavoriteArtistCard(artist) {
        const card = document.createElement('div');
        card.className = 'card';
        
        // Imagen del artista (usar imagen disponible o imagen por defecto)
        const imageUrl = artist.imageUrl || 'https://via.placeholder.com/300?text=No+Image';
        
        card.innerHTML = `
            <img src="${imageUrl}" alt="${artist.name}" class="card-img">
            <div class="card-content">
                <h3 class="card-title">${artist.name}</h3>
                <p class="card-subtitle">
                    ${artist.followers ? uiCore.formatNumber(artist.followers) + ' seguidores' : ''}
                    ${artist.genres && artist.genres.length > 0 ? ' • ' + artist.genres[0] : ''}
                </p>
                <div class="card-actions">
                    <button class="btn view-artist-btn" data-id="${artist.spotifyId}">Ver Artista</button>
                    <button class="btn remove-favorite-btn" data-id="${artist._id}"><i class="fas fa-heart"></i></button>
                </div>
            </div>
        `;
        
        // Añadir evento para ver detalles del artista
        card.querySelector('.view-artist-btn').addEventListener('click', () => {
            this.handleViewArtist(artist.spotifyId);
        });
        
        // Añadir evento para eliminar de favoritos
        card.querySelector('.remove-favorite-btn').addEventListener('click', () => {
            this.handleRemoveFavoriteArtist(artist._id, artist.name);
        });
        
        return card;
    }
    
    // Crear elemento de canción favorita
    createFavoriteSongElement(song, index) {
        const songElement = document.createElement('div');
        songElement.className = 'song-item';
        
        // Duración formateada
        const duration = song.duration ? uiCore.formatDuration(song.duration * 1000) : '0:00';
        
        songElement.innerHTML = `
            <div class="song-number">${index}</div>
            <div class="song-info">
                <h4 class="song-title">${song.name}</h4>
                <p class="song-artist">${song.artistName || 'Artista desconocido'}</p>
            </div>
            <div class="song-duration">${duration}</div>
            <div class="song-actions">
                ${song.previewUrl ? `<button class="play-btn" data-preview="${song.previewUrl}"><i class="fas fa-play"></i></button>` : ''}
                <button class="remove-favorite-song-btn" data-id="${song._id}"><i class="fas fa-heart"></i></button>
            </div>
        `;
        
        // Añadir evento para reproducir preview (si está disponible)
        if (song.previewUrl) {
            songElement.querySelector('.play-btn').addEventListener('click', (e) => {
                this.handlePlayPreview(e, song.previewUrl);
            });
        }
        
        // Añadir evento para eliminar de favoritos
        songElement.querySelector('.remove-favorite-song-btn').addEventListener('click', () => {
            this.handleRemoveFavoriteSong(song._id, song.name);
        });
        
        return songElement;
    }
    
    // Manejar ver detalles de artista
    handleViewArtist(artistId) {
        // Guardar ID del artista en sessionStorage para acceder desde la página de artista
        sessionStorage.setItem('currentArtistId', artistId);
        
        // Mostrar página de artista
        uiCore.showPage('artist');
        
        // Disparar evento personalizado para cargar detalles del artista
        const event = new CustomEvent('loadArtistDetails', { detail: { artistId } });
        document.dispatchEvent(event);
    }
    
    // Manejar eliminar artista de favoritos
    async handleRemoveFavoriteArtist(artistId, artistName) {
        try {
            await api.removeArtistFromFavorites(artistId);
            
            // Recargar artistas favoritos
            this.loadFavoriteArtists();
            
            uiCore.showToast(`${artistName} eliminado de favoritos`, 'success');
        } catch (error) {
            console.error('Error al eliminar artista de favoritos:', error);
            uiCore.showToast('Error al eliminar artista de favoritos', 'error');
        }
    }
    
    // Manejar eliminar canción de favoritos
    async handleRemoveFavoriteSong(songId, songName) {
        try {
            await api.removeSongFromFavorites(songId);
            
            // Recargar canciones favoritas
            this.loadFavoriteSongs();
            
            uiCore.showToast(`${songName} eliminado de favoritos`, 'success');
        } catch (error) {
            console.error('Error al eliminar canción de favoritos:', error);
            uiCore.showToast('Error al eliminar canción de favoritos', 'error');
        }
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

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Crear instancia de la aplicación
    const app = new App();
});
