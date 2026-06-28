require('dotenv').config();
const mongoose = require('mongoose');
const Flashcard = require('../src/models/Flashcard');
const Usuario = require('../src/models/Usuario');
const Categoria = require('../src/models/Categoria');

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI no definida');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Conectado a:', process.env.MONGODB_URI.replace(/\/\/.*@/, '//***@'));

  const users = await Usuario.find({ deletedAt: null }).select('nombre rol profesor_id').lean();
  const cats = await Categoria.countDocuments({ deletedAt: null });
  const total = await Flashcard.countDocuments({ deletedAt: null });
  const completas = await Flashcard.countDocuments({
    deletedAt: null,
    imagen_url: { $nin: [null, ''] },
    video_url: { $nin: [null, ''] },
  });
  const sinImagen = await Flashcard.countDocuments({
    deletedAt: null,
    $or: [{ imagen_url: { $in: [null, ''] } }],
  });
  const sinSena = await Flashcard.countDocuments({
    deletedAt: null,
    $or: [{ video_url: { $in: [null, ''] } }],
  });

  const porProfesor = await Flashcard.aggregate([
    { $match: { deletedAt: null } },
    { $group: { _id: '$creado_por', total: { $sum: 1 }, completas: {
      $sum: { $cond: [{ $and: [
        { $ne: ['$imagen_url', null] }, { $ne: ['$imagen_url', ''] },
        { $ne: ['$video_url', null] }, { $ne: ['$video_url', ''] },
      ]}, 1, 0] },
    } } },
  ]);

  console.log(JSON.stringify({
    usuarios: users,
    categorias: cats,
    flashcards: { total, completas, sinImagen, sinSena },
    porProfesor,
    incompletas: await Flashcard.find({
      deletedAt: null,
      $or: [
        { imagen_url: { $in: [null, ''] } },
        { video_url: { $in: [null, ''] } },
      ],
    }).select('palabra imagen_url video_url').lean(),
  }, null, 2));

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
