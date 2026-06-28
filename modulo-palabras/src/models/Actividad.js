const mongoose = require('mongoose');

const actividadSchema = new mongoose.Schema({
  usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  profesor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  tipo: { type: String, enum: ['practica_libre', 'mision_dia', 'diccionario'], required: true },
  categoria_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria' },
  flashcard_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Flashcard' },
  fecha: { type: Date, default: Date.now },
});

actividadSchema.index({ usuario_id: 1, fecha: -1 });
actividadSchema.index({ profesor_id: 1, fecha: -1 });

module.exports = mongoose.model('Actividad', actividadSchema);
