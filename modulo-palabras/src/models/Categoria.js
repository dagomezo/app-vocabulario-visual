const mongoose = require('mongoose');

const categoriaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  icono: { type: String },
  descripcion: { type: String },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Categoria', categoriaSchema); 
