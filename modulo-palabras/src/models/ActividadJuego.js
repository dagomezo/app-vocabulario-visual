const mongoose = require('mongoose');

const actividadJuegoSchema = new mongoose.Schema({
  profesor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  nombre: { type: String, required: true, trim: true },
  descripcion: { type: String, default: '', trim: true },
  categoria_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria', required: true },
  nivel_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Nivel', default: null },
  tipo: { type: String, enum: ['flashcards', 'quiz', 'memoria', 'unir'], required: true },
  cuenta_progreso: { type: Boolean, default: false },
  cantidad: { type: Number, default: 20, min: 5, max: 50 },
  icono: { type: String, default: '🎮' },
  activo: { type: Boolean, default: true },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

actividadJuegoSchema.index({ profesor_id: 1, activo: 1, deletedAt: 1 });

module.exports = mongoose.model('ActividadJuego', actividadJuegoSchema);
