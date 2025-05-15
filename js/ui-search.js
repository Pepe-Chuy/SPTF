// Clase para manejar la interfaz de búsqueda
class UISearch {
    constructor() {
        // Referencias a elementos DOM
        this.searchInput = document.getElementById('search-input');
        this.searchBtn = document.getElementById('search-btn');
        this.searchResults = document.getElementById('search-results');
    }
    
    // Inicializar eventos
    init() {
        // Evento de clic en botón de búsqueda
        this.searchBtn.addEventListener('click', () => this.handleSearch());
        
        // Evento de presionar Enter en el input de búsqueda
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });
    }
    
    // Manejar búsqueda
    async handleSearch() {
        const query = this.searchInput.value.trim();
        
        if (!query) {
            uiCore.showToast('Ingresa un término de búsqueda', 'error');
            return;
        }
        
        try {
            // Mostrar mensaje de carga
            this.searchResults.innerHTML = '<p class="loading-message">Buscando artistas...</p>';
            
            // Realizar búsqueda
            const artists = await api.searchArtists(query);
            
            // Si no hay resultados, mostrar mensaje
            if (!artists || artists.length === 0) {
                this.searchResults.innerHTML = '<p class="loading-message">No se encontraron artistas</p>';
                return;
            }
            
            // Limpiar resultados anteriores
            this.searchResults.innerHTML = '';
            
            // Crear tarjeta para cada artista
            artists.forEach(artist => {
                const artistCard = this.createArtistCard(artist);
                this.searchResults.appendChild(artistCard);
            });
            
            // Si el usuario está autenticado, guardar búsqueda reciente
            if (auth.checkAuth()) {
                this.saveRecentSearch(query);
            }
        } catch (error) {
            console.error('Error al buscar artistas:', error);
            this.searchResults.innerHTML = '<p class="loading-message">Error al buscar artistas</p>';
            uiCore.showToast('Error al buscar artistas', 'error');
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
                    ${auth.checkAuth() ? `<button class="btn favorite-btn" data-id="${artist.id}"><i class="far fa-heart"></i></button>` : ''}
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
    
    // Guardar búsqueda reciente
    async saveRecentSearch(query) {
        try {
            // Esta función sería para guardar la búsqueda en el historial del usuario
            // En una implementación real, se llamaría a una API para guardar esto en la base de datos
            console.log('Guardando búsqueda reciente:', query);
            
            // Aquí se implementaría la llamada a la API para guardar la búsqueda
            // await api.saveRecentSearch(query);
        } catch (error) {
            console.error('Error al guardar búsqueda reciente:', error);
        }
    }
}

// Crear instancia global de UISearch
const uiSearch = new UISearch();
