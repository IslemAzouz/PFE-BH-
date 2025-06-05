require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const cors = require('cors');
const mongoose = require('mongoose');
const Message = require('./models/Message');

const app = express();
app.use(express.json());
app.use(helmet());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// Limite brute-force sur les routes sensibles
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5,
  message: "Trop de tentatives, réessayez plus tard."
});

// Schéma de validation Zod
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  CIN: z.string().regex(/^\d{8}$/),
  RIB: z.string().regex(/^\d{20,24}$/),
});

// Simule une base de données (à remplacer par MongoDB, PostgreSQL, etc.)
const users = [];

// REGISTER
app.post('/api/auth/register', authLimiter, async (req, res) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: "Données invalides", details: result.error.errors });
  }
  const { email, password, CIN, RIB } = req.body;

  // Vérifier si l'utilisateur existe déjà
  if (users.find(u => u.email === email || u.CIN === CIN)) {
    return res.status(409).json({ error: "Utilisateur déjà existant." });
  }

  // Hashage du mot de passe
  const hashedPassword = await bcrypt.hash(password, 10);

  // Stockage (à remplacer par un vrai insert en base)
  const user = { email, password: hashedPassword, CIN, RIB, admin: 0 };
  users.push(user);

  // Génération du token JWT
  const token = jwt.sign({ email, CIN, admin: user.admin }, process.env.JWT_SECRET, { expiresIn: '2h' });

  res.json({ token, user: { email, CIN, admin: user.admin } });
});

// LOGIN
app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { CIN, RIB } = req.body;
  const user = users.find(u => u.CIN === CIN && u.RIB === RIB);
  if (!user) {
    return res.status(401).json({ error: "Identifiants invalides." });
  }

  // Génération du token JWT
  const token = jwt.sign({ email: user.email, CIN: user.CIN, admin: user.admin }, process.env.JWT_SECRET, { expiresIn: '2h' });

  res.json({ token, user: { email: user.email, CIN: user.CIN, admin: user.admin } });
});

// Middleware de vérification du token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Exemple de route protégée
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Accès autorisé', user: req.user });
});

// Sauvegarder un message
app.post('/api/chatbot/message', async (req, res) => {
  const { user, text, response } = req.body;
  const message = new Message({ user, text, response });
  await message.save();
  res.json(message);
});

// Récupérer l'historique des messages
app.get('/api/chatbot/history', async (req, res) => {
  const history = await Message.find().sort({ createdAt: -1 }).limit(50);
  res.json(history);
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Erreur serveur" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));

mongoose.connect('mongodb://localhost:27017/bhbank-chatbot', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on('connected', () => {
  console.log('Connecté à MongoDB');
}); 