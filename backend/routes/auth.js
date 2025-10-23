const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
const User = require('../models/user');

// Middleware pour vérifier le token
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Récupère le token Bearer
  if (!token) return res.status(401).json({ message: 'Token manquant' });

  try {
    const decoded = JWT.verify(token, process.env.JWT_KEY);
    req.user = decoded; // Stocke les infos du token dans req.user
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token invalide' });
  }
};

// Création d'un compte
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const userExist = await User.findOne({ email });
    if (userExist) return res.status(400).json({ message: 'Email déjà utilisé' });

    // Hash du mot de passe
    const passHash = await bcrypt.hash(password, 10);

    // Création de l'utilisateur
    const newUser = new User({ name, email, password: passHash });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Erreur dans /register :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Email ou mot de passe incorrect' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(400).json({ message: 'Mot de passe incorrect' });

    // Générer le token avec userId, name et email
    const token = JWT.sign(
      { userId: user._id, name: user.name, email: user.email },
      process.env.JWT_KEY,
      { expiresIn: '1d' }
    );

    res.json({ token });
  } catch (err) {
    console.error('Erreur dans /login :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer les infos de l'utilisateur connecté
router.get('/me', authMiddleware, (req, res) => {
  res.json({ name: req.user.name, email: req.user.email });
});

module.exports = router;
