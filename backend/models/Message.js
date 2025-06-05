const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  user: String, // ou ObjectId si tu veux lier à un utilisateur
  text: String,
  response: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema); 