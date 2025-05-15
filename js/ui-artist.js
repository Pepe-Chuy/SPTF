// Clase para manejar la interfaz de la página de artista
class UIArtist {
    constructor() {
        // Referencias a elementos DOM
        this.artistDetails = document.getElementById('artist-details');
        this.artistAlbums = document.getElementById('artist-albums');
        this.artistTopTracks = document.getElementById('artist-top-tracks');
        
        // Artista actual
        this.currentArtist = null;
    }
    
    // Inicializar eventos
    init() {
        // Escuchar evento personalizado para cargar detalles del artista
        document.addEventListener('loadArtistDetails', (e) => {
            const { artistId } = e.detail;
            this.loadArtistDetails(artistId);
        });
    }
    
    // Cargar detalles del artista
    async loadArtistDetails(artistId) {
        try {
            // Mostrar mensaje de carga
            this.artistDetails.innerHTML = '<p class="loading-message">Cargando detalles del artista...</p>';
            this.artistAlbums.innerHTML = '<p class="loading-message">Cargando álbumes...</p>';
            this.artistTopTracks.innerHTML = '<p class="loading-message">Cargando canciones populares...</p>';
            
            // Obtener detalles del artista
            const artist = await api.getArtist(artistId);
            this.currentArtist = artist;
            
            // Renderizar detalles del artista
            this.renderArtistDetails(artist);
            
            // Cargar álbumes y canciones populares
            this.loadArtistAlbums(artistId);
            this.loadArtistTopTracks(artistId);
        } catch (error) {
            console.error('Error al cargar detalles del artista:', error);
            this.artistDetails.innerHTML = '<p class="loading-message">Error al cargar detalles del artista</p>';
            uiCore.showToast('Error al cargar detalles del artista', 'error');
        }
    }
    
    // Renderizar detalles del artista
    renderArtistDetails(artist) {
        // Imagen del artista (usar la primera imagen disponible o imagen por defecto)
        const imageUrl = artist.images && artist.images.length > 0 
            ? artist.images[0].url 
            : 'https://via.placeholder.com/300?text=No+Image';
        
        // Formatear número de seguidores
        const followers = artist.followers ? uiCore.formatNumber(artist.followers.total) : '0';
        
        // Géneros del artista
        const genres = artist.genres && artist.genres.length > 0 
            ? artist.genres.join(', ') 
            : 'Sin géneros';
        
        // Popularidad del artista (de 0 a 100)
        const popularity = artist.popularity || 0;
        
        this.artistDetails.innerHTML = `
            <img src="${imageUrl}" alt="${artist.name}" class="artist-image">
            <div class="artist-info">
                <h2>${artist.name}</h2>
                <div class="artist-stats">
                    <div class="artist-stat">
                        <i class="fas fa-users"></i> ${followers} seguidores
                    </div>
                    <div class="artist-stat">
                        <i class="fas fa-fire"></i> Popularidad: ${popularity}/100
                    </div>
                </div>
                <p class="artist-genres">Géneros: ${genres}</p>
                <div class="artist-actions">
                    <button id="follow-artist-btn" class="btn">
                        <i class="far fa-heart"></i> Seguir
                    </button>
                    <a href="https://open.spotify.com/artist/${artist.id}" target="_blank" class="btn">
                        <i class="fab fa-spotify"></i> Abrir en Spotify
                    </a>
                </div>
            </div>
        `;
        
        // Añadir evento para seguir/dejar de seguir artista
        const followBtn = document.getElementById('follow-artist-btn');
        followBtn.addEventListener('click', () => this.handleToggleFollowArtist());
        
        // Comprobar si el usuario ya sigue al artista
        this.checkIfFollowingArtist();
    }
    
    // Cargar álbumes del artista
    async loadArtistAlbums(artistId) {
        try {
            // Obtener álbumes del artista
            const albums = await api.getArtistAlbums(artistId);
            
            // Si no hay álbumes, mostrar mensaje
            if (!albums || albums.length === 0) {
                this.artistAlbums.innerHTML = '<p class="loading-message">No se encontraron álbumes</p>';
                return;
            }
            
            // Limpiar contenedor
            this.artistAlbums.innerHTML = '';
            
            // Crear tarjeta para cada álbum
            albums.forEach(album => {
                const albumCard = this.createAlbumCard(album);
                this.artistAlbums.appendChild(albumCard);
            });
        } catch (error) {
            console.error('Error al cargar álbumes del artista:', error);
            this.artistAlbums.innerHTML = '<p class="loading-message">Error al cargar álbumes</p>';
        }
    }
    
    // Cargar canciones populares del artista
    async loadArtistTopTracks(artistId) {
        try {
            // Obtener canciones populares del artista
            const tracks = await api.getArtistTopTracks(artistId);
            
            // Si no hay canciones, mostrar mensaje
            if (!tracks || tracks.length === 0) {
                this.artistTopTracks.innerHTML = '<p class="loading-message">No se encontraron canciones populares</p>';
                return;
            }
            
            // Limpiar contenedor
            this.artistTopTracks.innerHTML = '';
            
            // Crear elemento para cada canción
            tracks.forEach((track, index) => {
                const trackElement = this.createTrackElement(track, index + 1);
                this.artistTopTracks.appendChild(trackElement);
            });
        } catch (error) {
            console.error('Error al cargar canciones populares del artista:', error);
            this.artistTopTracks.innerHTML = '<p class="loading-message">Error al cargar canciones populares</p>';
        }
    }
    
    // Crear tarjeta de álbum
    createAlbumCard(album) {
        const card = document.createElement('div');
        card.className = 'card';
        
        // Imagen del álbum (usar la primera imagen disponible o imagen por defecto)
        const imageUrl = album.images && album.images.length > 0 
            ? album.images[0].url 
            : 'https://via.placeholder.com/300?text=No+Image';
        
        // Formatear fecha de lanzamiento
        const releaseDate = new Date(album.release_date).toLocaleDateString();
        
        card.innerHTML = `
            <img src="${imageUrl}" alt="${album.name}" class="card-img">
            <div class="card-content">
                <h3 class="card-title">${album.name}</h3>
                <p class="card-subtitle">
                    ${releaseDate} • ${album.total_tracks} canciones
                </p>
                <div class="card-actions">
                    <a href="https://open.spotify.com/album/${album.id}" target="_blank" class="btn">
                        <i class="fab fa-spotify"></i> Abrir
                    </a>
                </div>
            </div>
        `;
        
        return card;
    }
    
    // Crear elemento de canción
    createTrackElement(track, index) {
        const trackElement = document.createElement('div');
        trackElement.className = 'song-item';
        
        // Duración formateada
        const duration = uiCore.formatDuration(track.duration_ms);
        
        trackElement.innerHTML = `
            <div class="song-number">${index}</div>
            <div class="song-info">
                <h4 class="song-title">${track.name}</h4>
                <p class="song-artist">${this.currentArtist.name}</p>
            </div>
            <div class="song-duration">${duration}</div>
            <div class="song-actions">
                ${track.preview_url ? `<button class="play-btn" data-preview="${track.preview_url}"><i class="fas fa-play"></i></button>` : ''}
                ${auth.checkAuth() ? `<button class="favorite-song-btn" data-id="${track.id}"><i class="far fa-heart"></i></button>` : ''}
            </div>
        `;
        
        // Añadir evento para reproducir preview (si está disponible)
        if (track.preview_url) {
            trackElement.querySelector('.play-btn').addEventListener('click', (e) => {
                this.handlePlayPreview(e, track.preview_url);
            });
        }
        
        // Añadir evento para añadir a favoritos (si el usuario está autenticado)
        if (auth.checkAuth()) {
            trackElement.querySelector('.favorite-song-btn').addEventListener('click', (e) => {
                this.handleToggleFavoriteSong(e, track);
            });
        }
        
        return trackElement;
    }
    
    // Comprobar si el usuario sigue al artista
    async checkIfFollowingArtist() {
        if (!auth.checkAuth() || !this.currentArtist) {
            return;
        }
        
        try {
            // En una implementación real, aquí se consultaría a la API si el usuario sigue al artista
            // Por ahora, simulamos que no lo sigue
            const followBtn = document.getElementById('follow-artist-btn');
            followBtn.innerHTML = '<i class="far fa-heart"></i> Seguir';
        } catch (error) {
            console.error('Error al comprobar si sigue al artista:', error);
        }
    }
    
    // Manejar seguir/dejar de seguir artista
    async handleToggleFollowArtist() {
        if (!auth.checkAuth()) {
            uiCore.showToast('Debes iniciar sesión para seguir artistas', 'error');
            return;
        }
        
        try {
            const followBtn = document.getElementById('follow-artist-btn');
            const isFollowing = followBtn.querySelector('i').classList.contains('fas');
            
            if (isFollowing) {
                // Dejar de seguir artista
                await api.removeArtistFromFavorites(this.currentArtist.id);
                followBtn.innerHTML = '<i class="far fa-heart"></i> Seguir';
                uiCore.showToast(`Has dejado de seguir a ${this.currentArtist.name}`, 'success');
            } else {
                // Seguir artista
                const artistData = {
                    spotifyId: this.currentArtist.id,
                    name: this.currentArtist.name,
                    imageUrl: this.currentArtist.images && this.currentArtist.images.length > 0 ? this.currentArtist.images[0].url : null,
                    genres: this.currentArtist.genres || [],
                    popularity: this.currentArtist.popularity || 0,
                    followers: this.currentArtist.followers ? this.currentArtist.followers.total : 0
                };
                
                await api.addArtistToFavorites(artistData);
                followBtn.innerHTML = '<i class="fas fa-heart"></i> Siguiendo';
                uiCore.showToast(`Ahora sigues a ${this.currentArtist.name}`, 'success');
            }
        } catch (error) {
            console.error('Error al seguir/dejar de seguir artista:', error);
            uiCore.showToast('Error al actualizar seguimiento', 'error');
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
                    artistId: this.currentArtist.id,
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

// Crear instancia global de UIArtist
const uiArtist = new UIArtist();
