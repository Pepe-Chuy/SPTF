# Spotify Artist Viewer - Versión Simple

Esta es una versión simplificada del Spotify Artist Viewer, desarrollada con HTML, CSS y JavaScript puro (sin frameworks). La aplicación permite a los usuarios buscar artistas, ver sus detalles, álbumes y canciones populares, así como guardar favoritos y gestionar playlists.

## Características

- **Búsqueda de artistas**: Busca artistas en Spotify
- **Visualización de artistas**: Ver detalles, álbumes y canciones populares de un artista
- **Sistema de usuarios**: Registro e inicio de sesión
- **Favoritos**: Guarda artistas y canciones favoritas
- **Panel de artista**: Permite a los usuarios convertirse en artistas y subir sus propias canciones y playlists
- **Reproducción de previews**: Escucha previews de canciones (cuando estén disponibles)

## Estructura del Proyecto

```
simple_page/
├── css/
│   └── styles.css
├── js/
│   ├── app.js
│   ├── api.js
│   ├── auth.js
│   ├── config.js
│   ├── ui-core.js
│   ├── ui-home.js
│   ├── ui-search.js
│   ├── ui-artist.js
│   └── ui-profile.js
├── images/
└── index.html
```

## Configuración

1. Asegúrate de tener las credenciales de Spotify en el archivo `js/config.js`:

```javascript
SPOTIFY_CLIENT_ID: 'tu_client_id',
SPOTIFY_CLIENT_SECRET: 'tu_client_secret'
```

2. Para el backend, necesitas tener MongoDB ejecutándose. La aplicación espera que MongoDB esté disponible en:

```
mongodb://admin:password@localhost:27017/spotify-app?authSource=admin
```

## Cómo ejecutar la aplicación

1. Clona este repositorio
2. Configura MongoDB (puedes usar Docker con el archivo docker-compose.yml incluido)
3. Abre `index.html` en tu navegador o usa un servidor web simple

Para usar un servidor web simple, puedes utilizar:

```bash
# Si tienes Python instalado
python -m http.server

# Si tienes Node.js instalado
npx serve
```

## Integración con MongoDB

La aplicación está diseñada para funcionar con una base de datos MongoDB con los siguientes modelos:

- **User**: Usuarios de la aplicación (normales o artistas)
- **Artist**: Artistas guardados de Spotify o creados por usuarios
- **Song**: Canciones de Spotify o creadas por usuarios artistas
- **Album**: Álbumes de Spotify
- **Playlist**: Playlists creadas por usuarios artistas

## Funcionalidades por implementar

Esta es una versión simplificada que incluye la estructura frontend. Para una implementación completa, se necesitaría:

1. Implementar el backend con Node.js/Express o cualquier otro framework
2. Crear las APIs RESTful para manejar usuarios, artistas, canciones, etc.
3. Implementar autenticación JWT
4. Configurar CORS para permitir peticiones desde el frontend
5. Implementar manejo de errores más robusto

## Notas

- Esta aplicación usa la API de Spotify solo para búsqueda y visualización
- Las funcionalidades de artista son simuladas y no interactúan con Spotify
- Se requiere una cuenta de Spotify Developer para las credenciales API
