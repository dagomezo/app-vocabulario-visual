require('dotenv').config();
const mongoose = require('mongoose');
const Flashcard = require('../src/models/Flashcard');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const cards = await Flashcard.find({ deletedAt: null })
    .select('palabra imagen_url video_url creado_por')
    .lean();
  console.log(JSON.stringify(cards, null, 2));
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e.message); process.exit(1); });
