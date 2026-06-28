 const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  rol: { type: String, enum: ['superadmin', 'profesor', 'alumno'], required: true },
  avatar_id: { type: String },
  sexo: { type: String, enum: ['masculino', 'femenino'], default: 'masculino' },
  apodo: { type: String, trim: true, default: '' },
  pin_hash: { type: String },
  profesor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  creado_por: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  racha_actual: { type: Number, default: 0 },
  racha_maxima: { type: Number, default: 0 },
  ultima_sesion_fecha: { type: Date, default: null },
  sesiones_completadas: { type: Number, default: 0 },
  retos_camino: { type: Number, default: 0 },
  monedas: { type: Number, default: 0, min: 0 },
  avatares_extra: { type: [String], default: [] },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Usuario', usuarioSchema);
