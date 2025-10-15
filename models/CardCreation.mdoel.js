const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  cardId: { type: Number, unique: true },
  projectId: { type: Number, required: true },
  creatorId: { type: Number, required: true },
  cardName: { type: String, required: true },
  cardDescription: { type: String, required: true },
  status: { type: String, enum: ['start', 'ongoing', 'complete'], default: 'start' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Card', cardSchema);
