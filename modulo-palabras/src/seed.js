const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Usuario = require('./models/Usuario');
const Categoria = require('./models/Categoria');
const Nivel = require('./models/Nivel');
const Flashcard = require('./models/Flashcard');
require('dotenv').config();

const USUARIOS_INICIALES = [
  { nombre: 'David', rol: 'profesor', pin: '1234' },
  { nombre: 'admin', rol: 'superadmin', pin: 'admin123' },
];

const ALUMNO_INICIAL = {
  nombre: 'Juan',
  rol: 'alumno',
  avatar_id: 'avatar1',
  pin: '5678',
};

const { CONTENIDO_INICIAL } = require('./seed-data');

async function upsertUsuario({ nombre, rol, pin, profesor_id, avatar_id }) {
  const existente = await Usuario.findOne({ nombre, rol, deletedAt: null });
  if (existente) {
    console.log(`  → Ya existe: ${nombre} (${rol})`);
    return existente;
  }

  const pin_hash = await bcrypt.hash(pin, 10);
  const usuario = await Usuario.create({
    nombre,
    rol,
    pin_hash,
    ...(avatar_id && { avatar_id }),
    ...(profesor_id && { profesor_id }),
  });

  console.log(`  ✓ Creado: ${nombre} (${rol}) — PIN: ${pin}`);
  return usuario;
}

async function seedContenido(profesorId) {
  console.log('\nCreando contenido de vocabulario...');
  let totalFlashcards = 0;

  for (const item of CONTENIDO_INICIAL) {
    let categoria = await Categoria.findOne({
      nombre: item.categoria.nombre,
      deletedAt: null,
    });

    if (!categoria) {
      categoria = await Categoria.create(item.categoria);
      console.log(`  ✓ Categoría: ${categoria.nombre}`);
    } else {
      console.log(`  → Categoría ya existe: ${categoria.nombre}`);
    }

    for (const nivelData of item.niveles) {
      let nivel = await Nivel.findOne({
        nombre: nivelData.nombre,
        categoria_id: categoria._id,
        deletedAt: null,
      });

      if (!nivel) {
        nivel = await Nivel.create({
          nombre: nivelData.nombre,
          orden: nivelData.orden,
          categoria_id: categoria._id,
        });
        console.log(`    ✓ Nivel: ${nivel.nombre}`);
      } else {
        console.log(`    → Nivel ya existe: ${nivel.nombre}`);
      }

      for (const fc of nivelData.flashcards) {
        const existe = await Flashcard.findOne({
          palabra: fc.palabra,
          categoria_id: categoria._id,
          nivel_id: nivel._id,
          creado_por: profesorId,
          deletedAt: null,
        });

        if (existe) {
          const updates = {};
          if (fc.descripcion) updates.descripcion = fc.descripcion;
          if (fc.imagen_url) updates.imagen_url = fc.imagen_url;
          if (fc.video_url) updates.video_url = fc.video_url;
          if (Object.keys(updates).length) {
            await Flashcard.updateOne({ _id: existe._id }, { $set: updates });
            totalFlashcards++;
          }
          continue;
        }

        await Flashcard.create({
          palabra: fc.palabra,
          descripcion: fc.descripcion,
          imagen_url: fc.imagen_url || undefined,
          video_url: fc.video_url || undefined,
          categoria_id: categoria._id,
          nivel_id: nivel._id,
          creado_por: profesorId,
        });
        totalFlashcards++;
      }
    }
  }

  console.log(`  ✓ Flashcards creadas o actualizadas: ${totalFlashcards}`);
}

function tieneMedios(fc) {
  return Boolean((fc.imagen_url || '').trim() && (fc.video_url || '').trim());
}

async function limpiarDuplicadasIncompletas(profesorId) {
  const incompletas = await Flashcard.find({
    creado_por: profesorId,
    deletedAt: null,
    $or: [
      { imagen_url: { $in: [null, ''] } },
      { video_url: { $in: [null, ''] } },
    ],
  });

  let eliminadas = 0;
  for (const card of incompletas) {
    const completa = await Flashcard.findOne({
      _id: { $ne: card._id },
      palabra: card.palabra,
      creado_por: profesorId,
      deletedAt: null,
      imagen_url: { $nin: [null, ''] },
      video_url: { $nin: [null, ''] },
    });

    if (completa) {
      await Flashcard.updateOne({ _id: card._id }, { deletedAt: new Date() });
      eliminadas++;
    }
  }

  if (eliminadas > 0) {
    console.log(`  ✓ Duplicadas incompletas archivadas: ${eliminadas}`);
  }
}

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error('✗ MONGODB_URI no está definida en .env');
    process.exit(1);
  }

  console.log('Conectando a MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✓ Conectado\n');

  console.log('Creando usuarios de acceso...');
  const profesores = {};
  for (const u of USUARIOS_INICIALES) {
    const creado = await upsertUsuario(u);
    if (u.rol === 'profesor') profesores[u.nombre] = creado;
  }

  const profesorDavid = profesores.David;
  if (profesorDavid) {
    console.log('\nCreando alumno de prueba...');
    const existente = await Usuario.findOne({
      nombre: ALUMNO_INICIAL.nombre,
      rol: 'alumno',
      profesor_id: profesorDavid._id,
      deletedAt: null,
    });

    if (existente) {
      console.log(`  → Ya existe: ${ALUMNO_INICIAL.nombre} (alumno)`);
    } else {
      const pin_hash = await bcrypt.hash(ALUMNO_INICIAL.pin, 10);
      await Usuario.create({
        nombre: ALUMNO_INICIAL.nombre,
        rol: 'alumno',
        avatar_id: ALUMNO_INICIAL.avatar_id,
        pin_hash,
        profesor_id: profesorDavid._id,
        creado_por: profesorDavid._id,
      });
      console.log(`  ✓ Creado: ${ALUMNO_INICIAL.nombre} (alumno) — PIN: ${ALUMNO_INICIAL.pin}`);
    }

    await seedContenido(profesorDavid._id);
    await limpiarDuplicadasIncompletas(profesorDavid._id);
  }

  const totalFc = await Flashcard.countDocuments({ deletedAt: null });
  const totalCat = await Categoria.countDocuments({ deletedAt: null });

  console.log('\n══════════════════════════════════════════');
  console.log('  RESUMEN');
  console.log('══════════════════════════════════════════');
  console.log(`  Categorías:  ${totalCat}`);
  console.log(`  Flashcards:  ${totalFc}`);
  console.log('\n  PROFESOR:  David / PIN 1234');
  console.log('  ADMIN:     admin / PIN admin123');
  console.log('  ALUMNO:    Juan / PIN 5678');
  console.log('══════════════════════════════════════════\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('✗ Error:', err.message);
  process.exit(1);
});
