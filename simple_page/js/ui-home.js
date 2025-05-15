// Clase para manejar la interfaz de la página de inicio
class UIHome {
    constructor() {
        // Referencias a elementos DOM
        this.featuredArtistsContainer = document.getElementById('featured-artists-container');
        this.topSongsContainer = document.getElementById('top-songs-container');
    }
    
    // Inicializar eventos y cargar datos
    async init() {
        try {
            // Cargar artistas destacados y canciones populares
            await this.loadFeaturedArtists();
            await this.loadTopSongs();
        } catch (error) {
            console.error('Error al inicializar la página de inicio:', error);
            uiCore.showToast('Error al cargar contenido destacado', 'error');
        }
    }
    
    // Cargar artistas destacados
    async loadFeaturedArtists() {
        try {
            // Mostrar mensaje de carga
            this.featuredArtistsContainer.innerHTML = '<p class="loading-message">Cargando artistas destacados...</p>';
            
            // Obtener artistas destacados
            const artists = await api.getFeaturedArtists();
            
            // Si no hay artistas, mostrar mensaje
            if (!artists || artists.length === 0) {
                this.featuredArtistsContainer.innerHTML = '<p class="loading-message">No se encontraron artistas destacados</p>';
                return;
            }
            
            // Limpiar contenedor
            this.featuredArtistsContainer.innerHTML = '';
            
            // Crear tarjeta para cada artista
            artists.forEach(artist => {
                const artistCard = this.createArtistCard(artist);
                this.featuredArtistsContainer.appendChild(artistCard);
            });
        } catch (error) {
            console.error('Error al cargar artistas destacados:', error);
            this.featuredArtistsContainer.innerHTML = '<p class="loading-message">Error al cargar artistas destacados</p>';
        }
    }
    
    // Cargar canciones populares
    async loadTopSongs() {
        try {
            // Mostrar mensaje de carga
            this.topSongsContainer.innerHTML = '<p class="loading-message">Cargando canciones populares...</p>';
            
            // Obtener canciones populares
            const songs = await api.getTopSongs();
            
            // Si no hay canciones, mostrar mensaje
            if (!songs || songs.length === 0) {
                this.topSongsContainer.innerHTML = '<p class="loading-message">No se encontraron canciones populares</p>';
                return;
            }
            
            // Limpiar contenedor
            this.topSongsContainer.innerHTML = '';
            
            // Crear elemento para cada canción
            songs.forEach((song, index) => {
                const songElement = this.createSongElement(song, index + 1);
                this.topSongsContainer.appendChild(songElement);
            });
        } catch (error) {
            console.error('Error al cargar canciones populares:', error);
            this.topSongsContainer.innerHTML = '<p class="loading-message">Error al cargar canciones populares</p>';
        }
    }
    
    // Crear tarjeta de artista
    createArtistCard(artist) {
        const card = document.createElement('div');
        card.className = 'card';
        
        // Imagen del artista (usar la primera imagen disponible o imagen por defecto)
        const imageUrl = artist.images && artist.images.length > 0 
            ? artist.images[0].url 
            : 'https://via.placeholder.com/300?text=No+Image';
        
        card.innerHTML = `
            <img src="${imageUrl}" alt="${artist.name}" class="card-img">
            <div class="card-content">
                <h3 class="card-title">${artist.name}</h3>
                <p class="card-subtitle">
                    ${artist.followers ? uiCore.formatNumber(artist.followers.total) + ' seguidores' : ''}
                    ${artist.genres && artist.genres.length > 0 ? ' • ' + artist.genres[0] : ''}
                </p>
                <div class="card-actions">
                    <button class="btn view-artist-btn" data-id="${artist.id}">Ver Artista</button>
                    ${auth.checkAuth() ? `<button class="btn favorite-btn" data-id="${artist.id}"><i class="fas fa-heart"></i></button>` : ''}
                </div>
            </div>
        `;
        
        // Añadir evento para ver detalles del artista
        card.querySelector('.view-artist-btn').addEventListener('click', () => {
            this.handleViewArtist(artist.id);
        });
        
        // Añadir evento para añadir a favoritos (si el usuario está autenticado)
        if (auth.checkAuth()) {
            card.querySelector('.favorite-btn').addEventListener('click', (e) => {
                this.handleToggleFavoriteArtist(e, artist);
            });
        }
        
        return card;
    }
    
    // Crear elemento de canción
    createSongElement(song, index) {
        const songElement = document.createElement('div');
        songElement.className = 'song-item';
        
        // Artistas de la canción
        const artistNames = song.artists.map(artist => artist.name).join(', ');
        
        // Duración formateada
        const duration = uiCore.formatDuration(song.duration_ms);
        
        songElement.innerHTML = `
            <div class="song-number">${index}</div>
            <div class="song-info">
                <h4 class="song-title">${song.name}</h4>
                <p class="song-artist">${artistNames}</p>
            </div>
            <div class="song-duration">${duration}</div>
            <div class="song-actions">
                ${song.preview_url ? `<button class="play-btn" data-preview="${song.preview_url}"><i class="fas fa-play"></i></button>` : ''}
                ${auth.checkAuth() ? `<button class="favorite-song-btn" data-id="${song.id}"><i class="far fa-heart"></i></button>` : ''}
            </div>
        `;
        
        // Añadir evento para reproducir preview (si está disponible)
        if (song.preview_url) {
            songElement.querySelector('.play-btn').addEventListener('click', (e) => {
                this.handlePlayPreview(e, song.preview_url);
            });
        }
        
        // Añadir evento para añadir a favoritos (si el usuario está autenticado)
        if (auth.checkAuth()) {
            songElement.querySelector('.favorite-song-btn').addEventListener('click', (e) => {
                this.handleToggleFavoriteSong(e, song);
            });
        }
        
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
    
    // Manejar toggle de artista favorito
    async handleToggleFavoriteArtist(e, artist) {
        try {
            // Verificar si el usuario está autenticado
            if (!auth.checkAuth()) {
                uiCore.showToast('Debes iniciar sesión para añadir favoritos', 'error');
                return;
            }
            
            const button = e.currentTarget;
            const icon = button.querySelector('i');
            
            // Comprobar si ya es favorito (basado en la clase del icono)
            const isFavorite = icon.classList.contains('fas');
            
            if (isFavorite) {
                // Eliminar de favoritos
                await api.removeArtistFromFavorites(artist.id);
                icon.classList.replace('fas', 'far');
                uiCore.showToast(`${artist.name} eliminado de favoritos`, 'success');
            } else {
                // Añadir a favoritos
                const artistData = {
                    spotifyId: artist.id,
                    name: artist.name,
                    imageUrl: artist.images && artist.images.length > 0 ? artist.images[0].url : null,
                    genres: artist.genres || [],
                    popularity: artist.popularity || 0,
                    followers: artist.followers ? artist.followers.total : 0
                };
                
                await api.addArtistToFavorites(artistData);
                icon.classList.replace('far', 'fas');
                uiCore.showToast(`${artist.name} añadido a favoritos`, 'success');
            }
        } catch (error) {
            console.error('Error al gestionar favorito:', error);
            uiCore.showToast('Error al gestionar favorito', 'error');
        }
    }
    
    // Manejar toggle de canción favorita
    async handleToggleFavoriteSong(e, song) {
        try {
            // Verificar si el usuario está autenticado
            if (!auth.checkAuth()) {
                uiCore.showToast('Debes iniciar sesión para añadir favoritos', 'error');
                return;
            }
            
            const button = e.currentTarget;
            const icon = button.querySelector('i');
            
            // Comprobar si ya es favorito (basado en la clase del icono)
            const isFavorite = icon.classList.contains('fas');
            
            if (isFavorite) {
                // Eliminar de favoritos
                await api.removeSongFromFavorites(song.id);
                icon.classList.replace('fas', 'far');
                uiCore.showToast(`${song.name} eliminado de favoritos`, 'success');
            } else {
                // Añadir a favoritos
                const songData = {
                    spotifyId: song.id,
                    name: song.name,
                    artistId: song.artists[0].id, // Usar el primer artista como principal
                    duration: Math.floor(song.duration_ms / 1000), // Convertir a segundos
                    previewUrl: song.preview_url || null
                };
                
                await api.addSongToFavorites(songData);
                icon.classList.replace('far', 'fas');
                uiCore.showToast(`${song.name} añadido a favoritos`, 'success');
            }
        } catch (error) {
            console.error('Error al gestionar favorito:', error);
            uiCore.showToast('Error al gestionar favorito', 'error');
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

// Crear instancia global de UIHome
const uiHome = new UIHome();
