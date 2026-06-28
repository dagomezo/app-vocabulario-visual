const mongoose = require('mongoose');

const progresoSchema = new mongoose.Schema({
  usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  flashcard_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Flashcard', required: true },
  intervalo: { type: Number, default: 1 },
  easiness_factor: { type: Number, default: 2.5 },
  repeticiones: { type: Number, default: 0 },
  proximo_repaso: { type: Date, default: Date.now },
  ultima_respuesta: { type: Date },
  ultima_fuente: { type: String, enum: ['flashcards', 'memoria', 'unir', 'quiz'], default: 'flashcards' }
}, { timestamps: true });

// Índices para queries eficientes
progresoSchema.index({ usuario_id: 1, proximo_repaso: 1 });

module.exports = mongoose.model('Progreso', progresoSchema); 
