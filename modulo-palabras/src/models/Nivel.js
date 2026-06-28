 const mongoose = require('mongoose');

const nivelSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  orden: { type: Number, required: true },
  categoria_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria', required: true },
  config: {
    max_repasos_diarios: { type: Number, default: 20 },
    max_tarjetas_nuevas: { type: Number, default: 5 }
  },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Nivel', nivelSchema);
