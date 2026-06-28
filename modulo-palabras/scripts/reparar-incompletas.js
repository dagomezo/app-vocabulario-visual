require('dotenv').config();
const mongoose = require('mongoose');
const Flashcard = require('../src/models/Flashcard');
const { CONTENIDO_INICIAL } = require('../src/seed-data');

const seedPorPalabra = new Map();
for (const item of CONTENIDO_INICIAL) {
  for (const nivel of item.niveles) {
    for (const fc of nivel.flashcards) {
      if (!seedPorPalabra.has(fc.palabra)) {
        seedPorPalabra.set(fc.palabra, fc);
      }
    }
  }
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  const incompletas = await Flashcard.find({
    deletedAt: null,
    $or: [
      { imagen_url: { $in: [null, ''] } },
      { video_url: { $in: [null, ''] } },
    ],
  });

  let actualizadas = 0;
  let eliminadas = 0;

  for (const card of incompletas) {
    const seed = seedPorPalabra.get(card.palabra);
    const completaDuplicada = await Flashcard.findOne({
      _id: { $ne: card._id },
      palabra: card.palabra,
      creado_por: card.creado_por,
      deletedAt: null,
      imagen_url: { $nin: [null, ''] },
      video_url: { $nin: [null, ''] },
    });

    if (completaDuplicada) {
      await Flashcard.updateOne({ _id: card._id }, { deletedAt: new Date() });
      eliminadas++;
      continue;
    }

    if (seed) {
      await Flashcard.updateOne(
        { _id: card._id },
        {
          $set: {
            descripcion: seed.descripcion || card.descripcion,
            imagen_url: seed.imagen_url || card.imagen_url,
            video_url: seed.video_url || card.video_url,
          },
        },
      );
      actualizadas++;
    }
  }

  const completas = await Flashcard.countDocuments({
    deletedAt: null,
    imagen_url: { $nin: [null, ''] },
    video_url: { $nin: [null, ''] },
  });
  const total = await Flashcard.countDocuments({ deletedAt: null });

  console.log(JSON.stringify({ actualizadas, eliminadas, total, completas }, null, 2));
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
