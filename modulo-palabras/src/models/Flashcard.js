 const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
  palabra: { type: String, required: true },
  descripcion: { type: String },
  imagen_url: { type: String },
  video_url: { type: String },
  categoria_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria', required: true },
  nivel_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Nivel', required: true },
  creado_por: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Flashcard', flashcardSchema);
