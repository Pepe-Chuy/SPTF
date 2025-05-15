// Servidor Express para la aplicación Spotify Artist Viewer
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Configuración CORS más permisiva
app.use(cors({
  origin: '*', // Permitir cualquier origen
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Middleware para OPTIONS (preflight)
app.options('*', cors());

// Agregar middleware para loguear las solicitudes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware para manejar errores de JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Error en el formato JSON:', err);
    return res.status(400).json({ message: 'Formato JSON inválido' });
  }
  next(err);
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname)));

// Importar configuración
const CONFIG = require('./js/config.js');

// Conexión a MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || CONFIG.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error al conectar a MongoDB:', err));

// Modelos
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'artist', 'admin'], default: 'user' },
  likedSongs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
  likedArtists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artist' }],
  recentSearches: [{ type: String }]
}, {
  timestamps: true
});

const songSchema = new mongoose.Schema({
  spotifyId: { type: String, unique: true },
  name: { type: String, required: true },
  likes: { type: Number, default: 0 },
  artistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
  albumId: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' },
  duration: { type: Number },
  previewUrl: { type: String }
}, {
  timestamps: true
});

const artistSchema = new mongoose.Schema({
  spotifyId: { type: String, unique: true },
  name: { type: String, required: true },
  verified: { type: Boolean, default: false },
  imageUrl: { type: String },
  genres: [{ type: String }],
  popularity: { type: Number },
  followers: { type: Number }
}, {
  timestamps: true
});

const albumSchema = new mongoose.Schema({
  spotifyId: { type: String, unique: true },
  name: { type: String, required: true },
  releaseDate: { type: Date, required: true },
  totalTracks: { type: Number, required: true },
  imageUrl: { type: String },
  artistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true }
}, {
  timestamps: true
});

const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  artistId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }]
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
const Song = mongoose.model('Song', songSchema);
const Artist = mongoose.model('Artist', artistSchema);
const Album = mongoose.model('Album', albumSchema);
const Playlist = mongoose.model('Playlist', playlistSchema);

// Rutas de autenticación
app.post('/api/users/register', async (req, res) => {
  console.log('Recibida solicitud de registro:', req.body);
  console.log('Content-Type:', req.headers['content-type']);
  
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Datos de registro vacíos o inválidos' });
    }
    
    const { name, email, password, role } = req.body;
    
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }
    
    // Crear nuevo usuario
    const newUser = new User({
      name,
      email,
      password, // En una aplicación real, deberías hashear la contraseña
      role: role || 'user'
    });
    
    await newUser.save();
    
    // Generar token (simulado)
    const token = `token_${newUser._id}_${Date.now()}`;
    
    // Devolver usuario sin contraseña
    const userObj = newUser.toObject();
    delete userObj.password;
    
    res.status(201).json({ token, user: userObj });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Buscar usuario
    const user = await User.findOne({ email });
    
    // Verificar si el usuario existe y la contraseña es correcta
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }
    
    // Generar token (simulado)
    const token = `token_${user._id}_${Date.now()}`;
    
    // Devolver usuario sin contraseña
    const userObj = user.toObject();
    delete userObj.password;
    
    res.json({ token, user: userObj });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});

app.get('/api/users/profile', async (req, res) => {
  try {
    // Extraer token del header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No autorizado' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Extraer ID del usuario del token
    const userId = token.split('_')[1];
    
    // Buscar usuario
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Devolver usuario sin contraseña
    const userObj = user.toObject();
    delete userObj.password;
    
    res.json(userObj);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ message: 'Error al obtener perfil' });
  }
});

app.put('/api/users/profile', async (req, res) => {
  try {
    // Extraer token del header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No autorizado' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Extraer ID del usuario del token
    const userId = token.split('_')[1];
    
    // Buscar usuario
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Actualizar datos del usuario
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.password) user.password = req.body.password;
    
    await user.save();
    
    // Devolver usuario sin contraseña
    const userObj = user.toObject();
    delete userObj.password;
    
    res.json(userObj);
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ message: 'Error al actualizar perfil' });
  }
});

app.put('/api/users/become-artist', async (req, res) => {
  try {
    // Extraer token del header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No autorizado' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Extraer ID del usuario del token
    const userId = token.split('_')[1];
    
    // Buscar usuario
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Verificar si ya es artista
    if (user.role === 'artist') {
      return res.status(400).json({ message: 'El usuario ya es un artista' });
    }
    
    // Actualizar rol del usuario
    user.role = 'artist';
    await user.save();
    
    // Devolver usuario sin contraseña
    const userObj = user.toObject();
    delete userObj.password;
    
    res.json(userObj);
  } catch (error) {
    console.error('Error al convertir en artista:', error);
    res.status(500).json({ message: 'Error al convertir en artista' });
  }
});

// Rutas de favoritos
app.post('/api/favorites/artist', async (req, res) => {
  try {
    // Extraer token del header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No autorizado' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Extraer ID del usuario del token
    const userId = token.split('_')[1];
    
    // Buscar usuario
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Buscar o crear artista
    let artist = await Artist.findOne({ spotifyId: req.body.spotifyId });
    
    if (!artist) {
      artist = new Artist({
        spotifyId: req.body.spotifyId,
        name: req.body.name,
        imageUrl: req.body.imageUrl,
        genres: req.body.genres || [],
        popularity: req.body.popularity || 0,
        followers: req.body.followers || 0
      });
      
      await artist.save();
    }
    
    // Verificar si el artista ya está en favoritos
    if (user.likedArtists.includes(artist._id)) {
      return res.status(400).json({ message: 'El artista ya está en favoritos' });
    }
    
    // Añadir artista a favoritos
    user.likedArtists.push(artist._id);
    await user.save();
    
    res.status(201).json(artist);
  } catch (error) {
    console.error('Error al añadir artista a favoritos:', error);
    res.status(500).json({ message: 'Error al añadir artista a favoritos' });
  }
});

app.delete('/api/favorites/artist/:id', async (req, res) => {
  try {
    // Extraer token del header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No autorizado' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Extraer ID del usuario del token
    const userId = token.split('_')[1];
    
    // Buscar usuario
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Buscar artista
    const artist = await Artist.findOne({ spotifyId: req.params.id });
    
    if (!artist) {
      return res.status(404).json({ message: 'Artista no encontrado' });
    }
    
    // Verificar si el artista está en favoritos
    if (!user.likedArtists.includes(artist._id)) {
      return res.status(400).json({ message: 'El artista no está en favoritos' });
    }
    
    // Eliminar artista de favoritos
    user.likedArtists = user.likedArtists.filter(id => !id.equals(artist._id));
    await user.save();
    
    res.json({ message: 'Artista eliminado de favoritos' });
  } catch (error) {
    console.error('Error al eliminar artista de favoritos:', error);
    res.status(500).json({ message: 'Error al eliminar artista de favoritos' });
  }
});

app.post('/api/favorites/song', async (req, res) => {
  try {
    // Extraer token del header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No autorizado' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Extraer ID del usuario del token
    const userId = token.split('_')[1];
    
    // Buscar usuario
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Buscar o crear artista
    let artist = await Artist.findOne({ spotifyId: req.body.artistId });
    
    if (!artist) {
      artist = new Artist({
        spotifyId: req.body.artistId,
        name: req.body.artistName || 'Artista desconocido'
      });
      
      await artist.save();
    }
    
    // Buscar o crear canción
    let song = await Song.findOne({ spotifyId: req.body.spotifyId });
    
    if (!song) {
      song = new Song({
        spotifyId: req.body.spotifyId,
        name: req.body.name,
        artistId: artist._id,
        duration: req.body.duration || 0,
        previewUrl: req.body.previewUrl || null
      });
      
      await song.save();
    }
    
    // Verificar si la canción ya está en favoritos
    if (user.likedSongs.includes(song._id)) {
      return res.status(400).json({ message: 'La canción ya está en favoritos' });
    }
    
    // Añadir canción a favoritos
    user.likedSongs.push(song._id);
    await user.save();
    
    res.status(201).json(song);
  } catch (error) {
    console.error('Error al añadir canción a favoritos:', error);
    res.status(500).json({ message: 'Error al añadir canción a favoritos' });
  }
});

app.delete('/api/favorites/song/:id', async (req, res) => {
  try {
    // Extraer token del header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No autorizado' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Extraer ID del usuario del token
    const userId = token.split('_')[1];
    
    // Buscar usuario
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Buscar canción
    const song = await Song.findOne({ spotifyId: req.params.id });
    
    if (!song) {
      return res.status(404).json({ message: 'Canción no encontrada' });
    }
    
    // Verificar si la canción está en favoritos
    if (!user.likedSongs.includes(song._id)) {
      return res.status(400).json({ message: 'La canción no está en favoritos' });
    }
    
    // Eliminar canción de favoritos
    user.likedSongs = user.likedSongs.filter(id => !id.equals(song._id));
    await user.save();
    
    res.json({ message: 'Canción eliminada de favoritos' });
  } catch (error) {
    console.error('Error al eliminar canción de favoritos:', error);
    res.status(500).json({ message: 'Error al eliminar canción de favoritos' });
  }
});

app.get('/api/favorites/artists', async (req, res) => {
  try {
    // Extraer token del header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No autorizado' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Extraer ID del usuario del token
    const userId = token.split('_')[1];
    
    // Buscar usuario con artistas favoritos
    const user = await User.findById(userId).populate('likedArtists');
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json(user.likedArtists);
  } catch (error) {
    console.error('Error al obtener artistas favoritos:', error);
    res.status(500).json({ message: 'Error al obtener artistas favoritos' });
  }
});

app.get('/api/favorites/songs', async (req, res) => {
  try {
    // Extraer token del header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No autorizado' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Extraer ID del usuario del token
    const userId = token.split('_')[1];
    
    // Buscar usuario con canciones favoritas
    const user = await User.findById(userId).populate({
      path: 'likedSongs',
      populate: {
        path: 'artistId',
        model: 'Artist'
      }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Añadir nombre del artista a cada canción
    const songs = user.likedSongs.map(song => {
      const songObj = song.toObject();
      songObj.artistName = song.artistId ? song.artistId.name : 'Artista desconocido';
      return songObj;
    });
    
    res.json(songs);
  } catch (error) {
    console.error('Error al obtener canciones favoritas:', error);
    res.status(500).json({ message: 'Error al obtener canciones favoritas' });
  }
});

// Rutas de artistas y canciones
app.post('/api/songs', async (req, res) => {
  try {
    // Extraer token del header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No autorizado' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Extraer ID del usuario del token
    const userId = token.split('_')[1];
    
    // Buscar usuario
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Verificar si el usuario es un artista
    if (user.role !== 'artist') {
      return res.status(403).json({ message: 'Solo los artistas pueden crear canciones' });
    }
    
    // Crear artista si no existe
    let artist = await Artist.findOne({ spotifyId: user._id.toString() });
    
    if (!artist) {
      artist = new Artist({
        spotifyId: user._id.toString(),
        name: user.name,
        verified: true
      });
      
      await artist.save();
    }
    
    // Crear nueva canción
    const newSong = new Song({
      spotifyId: `user_${user._id}_${Date.now()}`,
      name: req.body.name,
      artistId: artist._id,
      duration: req.body.duration || 0,
      previewUrl: req.body.previewUrl || null
    });
    
    await newSong.save();
    
    res.status(201).json(newSong);
  } catch (error) {
    console.error('Error al crear canción:', error);
    res.status(500).json({ message: 'Error al crear canción' });
  }
});

app.get('/api/songs/artist', async (req, res) => {
  try {
    // Extraer token del header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No autorizado' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Extraer ID del usuario del token
    const userId = token.split('_')[1];
    
    // Buscar usuario
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Verificar si el usuario es un artista
    if (user.role !== 'artist') {
      return res.status(403).json({ message: 'Solo los artistas pueden ver sus canciones' });
    }
    
    // Buscar artista
    const artist = await Artist.findOne({ spotifyId: user._id.toString() });
    
    if (!artist) {
      return res.json([]);
    }
    
    // Buscar canciones del artista
    const songs = await Song.find({ artistId: artist._id });
    
    res.json(songs);
  } catch (error) {
    console.error('Error al obtener canciones del artista:', error);
    res.status(500).json({ message: 'Error al obtener canciones del artista' });
  }
});

app.post('/api/playlists', async (req, res) => {
  try {
    // Extraer token del header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No autorizado' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Extraer ID del usuario del token
    const userId = token.split('_')[1];
    
    // Buscar usuario
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Verificar si el usuario es un artista
    if (user.role !== 'artist') {
      return res.status(403).json({ message: 'Solo los artistas pueden crear playlists' });
    }
    
    // Verificar que las canciones existen
    if (req.body.songs && req.body.songs.length > 0) {
      const songs = await Song.find({ _id: { $in: req.body.songs } });
      
      if (songs.length !== req.body.songs.length) {
        return res.status(400).json({ message: 'Algunas canciones no existen' });
      }
    }
    
    // Crear nueva playlist
    const newPlaylist = new Playlist({
      name: req.body.name,
      description: req.body.description || '',
      artistId: user._id,
      songs: req.body.songs || []
    });
    
    await newPlaylist.save();
    
    res.status(201).json(newPlaylist);
  } catch (error) {
    console.error('Error al crear playlist:', error);
    res.status(500).json({ message: 'Error al crear playlist' });
  }
});

app.get('/api/playlists/artist', async (req, res) => {
  try {
    // Extraer token del header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No autorizado' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Extraer ID del usuario del token
    const userId = token.split('_')[1];
    
    // Buscar usuario
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Verificar si el usuario es un artista
    if (user.role !== 'artist') {
      return res.status(403).json({ message: 'Solo los artistas pueden ver sus playlists' });
    }
    
    // Buscar playlists del artista
    const playlists = await Playlist.find({ artistId: user._id }).populate('songs');
    
    res.json(playlists);
  } catch (error) {
    console.error('Error al obtener playlists del artista:', error);
    res.status(500).json({ message: 'Error al obtener playlists del artista' });
  }
});

// Ruta para manejar todas las demás solicitudes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
