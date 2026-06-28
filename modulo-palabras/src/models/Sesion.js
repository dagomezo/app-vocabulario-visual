const mongoose = require('mongoose');

const sesionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  deviceId: { type: String },
  nombreAlumno: { type: String },
  avatar: { type: String },
  palabras: [{
    palabraId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flashcard' },
    acertada: Boolean,
    juegoTipo: { type: String, enum: ['flashcards', 'quiz', 'memoria', 'unir'] },
    timestamp: { type: Date, default: Date.now }
  }],
  juegosCompletados: [{
    tipo: String,
    categoriaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria' },
    total: Number,
    correctas: Number,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

sesionSchema.index({ deviceId: 1 });

module.exports = mongoose.model('Sesion', sesionSchema);
