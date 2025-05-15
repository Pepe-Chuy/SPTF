// Serverless function para registro de usuarios en Vercel
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

// Esquema de usuario
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

// Modelo de usuario
let User;
try {
  // Intentar obtener el modelo existente
  User = mongoose.model('User');
} catch (e) {
  // Si no existe, crear uno nuevo
  User = mongoose.model('User', userSchema);
}

// URL de conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://artist-viewer-dev:ZgSfV5N8XTXyo5Sl@artist-viewer.czewmfe.mongodb.net/artist-viewer-db?retryWrites=true&w=majority&appName=artist-viewer';

// Función para conectar a MongoDB
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  
  // Conectar a MongoDB
  const client = await MongoClient.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  const db = client.db();
  cachedDb = db;
  return db;
}

module.exports = async (req, res) => {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  
  // Manejar solicitudes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Solo permitir solicitudes POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }
  
  try {
    // Conectar a la base de datos
    await connectToDatabase();
    
    // Verificar que los datos del cuerpo sean válidos
    const { name, email, password, role } = req.body;
    
    console.log('Datos recibidos:', { name, email, role });
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nombre, email y contraseña son obligatorios' });
    }
    
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }
    
    // Crear nuevo usuario
    const newUser = new User({
      name,
      email,
      password, // En producción, se debería hashear la contraseña
      role: role || 'user'
    });
    
    await newUser.save();
    
    // Generar token simple
    const token = `token_${newUser._id}`;
    
    // Devolver respuesta sin la contraseña
    const userObj = newUser.toObject();
    delete userObj.password;
    
    return res.status(201).json({ token, user: userObj });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    return res.status(500).json({ 
      message: 'Error al registrar usuario', 
      error: error.message 
    });
  }
};
