require('dotenv').config();
const mongoose = require('mongoose');

const uris = [
  { label: 'Actual (.env)', uri: process.env.MONGODB_URI },
  {
    label: 'Con nombre de BD (senasapp)',
    uri: process.env.MONGODB_URI?.replace(
      '.mongodb.net/?',
      '.mongodb.net/senasapp?'
    ).replace(
      '.mongodb.net/',
      '.mongodb.net/senasapp/'
    ),
  },
  { label: 'Local', uri: 'mongodb://localhost:27017/senasapp' },
];

async function probar({ label, uri }) {
  if (!uri) return { label, ok: false, error: 'URI vacía' };

  try {
    const conn = await mongoose.createConnection(uri, {
      serverSelectionTimeoutMS: 8000,
    }).asPromise();
    await conn.db.admin().ping();
    const dbName = conn.db.databaseName;
    await conn.close();
    return { label, ok: true, dbName, uri: uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@') };
  } catch (err) {
    return { label, ok: false, error: err.message, code: err.code || err.name };
  }
}

(async () => {
  console.log('Probando conexiones MongoDB...\n');
  for (const item of uris) {
    const r = await probar(item);
    if (r.ok) {
      console.log(`✓ ${r.label}`);
      console.log(`  BD: ${r.dbName}`);
      console.log(`  URI: ${r.uri}\n`);
    } else {
      console.log(`✗ ${r.label}`);
      console.log(`  Error: ${r.error}`);
      if (r.code) console.log(`  Código: ${r.code}`);
      console.log('');
    }
  }
  process.exit(0);
})();
