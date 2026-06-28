/** Imágenes libres: Wikimedia Commons (señas ASL) y Unsplash (referencia visual). */

const wiki = (file) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=400`;

const unsplash = (id) =>
  `https://images.unsplash.com/${id}?w=400&h=400&fit=crop&q=80`;

const CONTENIDO_INICIAL = [
  {
    categoria: { nombre: 'Saludos', icono: '👋', descripcion: 'Saludar, despedirse y cortesía' },
    niveles: [{
      nombre: 'Básico', orden: 1,
      flashcards: [
        { palabra: 'Hola', descripcion: 'Saludo al encontrar a alguien', imagen_url: unsplash('photo-1529156069898-49953e39b3ac'), video_url: wiki('ASL OpenB@Finger-PalmAcross-FlatO@CenterChesthigh-PalmAcross Wave.jpg') },
        { palabra: 'Adiós', descripcion: 'Despedida amable', imagen_url: unsplash('photo-1472162076272-efa01c4a88ea'), video_url: wiki('ASL OpenB@Finger-PalmAcross-FlatO@CenterChesthigh-PalmAcross Wave.jpg') },
        { palabra: 'Gracias', descripcion: 'Agradecer algo recibido', imagen_url: unsplash('photo-1516321497487-e288fb19713f'), video_url: wiki('ASL OpenB@Chin-PalmBack.jpg') },
        { palabra: 'Por favor', descripcion: 'Pedir algo con educación', imagen_url: unsplash('photo-1454165804606-c3d57bc86b40'), video_url: wiki('ASL FlatO@CenterChesthigh-PalmUp Circles Horiz.jpg') },
        { palabra: 'Buenos días', descripcion: 'Saludo matutino', imagen_url: unsplash('photo-1495616811223-4d98c6e8c0a5'), video_url: wiki('ASL OpenB@Forehead-PalmBack.jpg') },
        { palabra: 'Sí', descripcion: 'Afirmar o aceptar', imagen_url: unsplash('photo-1618005182384-a83a8bd57fbe'), video_url: wiki('ASL 1@NearHand-FingerUp-1@InsideChesthigh-FingerUp.jpg') },
      ],
    }],
  },
  {
    categoria: { nombre: 'Familia', icono: '👨‍👩‍👧', descripcion: 'Personas de la familia' },
    niveles: [{
      nombre: 'Básico', orden: 1,
      flashcards: [
        { palabra: 'Mamá', descripcion: 'Madre', imagen_url: unsplash('photo-1544005313-94ddf0286df2'), video_url: wiki('ASL 5@Chin-PalmBack Wiggle.jpg') },
        { palabra: 'Papá', descripcion: 'Padre', imagen_url: unsplash('photo-1507003211169-0a1dd7228f2d'), video_url: wiki('ASL 5@Forehead-PalmBack.jpg') },
        { palabra: 'Hermano', descripcion: 'Hermano varón', imagen_url: unsplash('photo-1503454537844-4d6f0f10c828'), video_url: wiki('ASL 1@NearHand-FingerAside-1@CenterChesthigh-FingerAcross.jpg') },
        { palabra: 'Hermana', descripcion: 'Hermana mujer', imagen_url: unsplash('photo-1494790108377-be9c29b29330'), video_url: wiki('ASL 1@NearHand-FingerAside-1@CenterChesthigh-FingerAcross.jpg') },
        { palabra: 'Abuela', descripcion: 'Abuela materna o paterna', imagen_url: unsplash('photo-1581065178047-3f835f036e6c'), video_url: wiki('ASL 5@Chin-PalmBack.jpg') },
        { palabra: 'Bebé', descripcion: 'Niño o niña pequeño', imagen_url: unsplash('photo-1515488042361-ee00e0ddd4e4'), video_url: wiki('ASL 5@InsideElbow-PalmUp Rock.jpg') },
      ],
    }],
  },
  {
    categoria: { nombre: 'Colores', icono: '🎨', descripcion: 'Colores del entorno' },
    niveles: [{
      nombre: 'Básico', orden: 1,
      flashcards: [
        { palabra: 'Rojo', descripcion: 'Color rojo', imagen_url: unsplash('photo-1541701494587-cb58502866ab'), video_url: wiki('ASL 1@Finger-Open8@Center.jpg') },
        { palabra: 'Azul', descripcion: 'Color azul', imagen_url: unsplash('photo-1550684848-fac1c5b4e853'), video_url: wiki('ASL B@CenterTrunkhigh-PalmBack Wiggle.jpg') },
        { palabra: 'Verde', descripcion: 'Color verde', imagen_url: unsplash('photo-1558618666-fcd25c85cd64'), video_url: wiki('ASL G@CenterTrunkhigh-PalmIn Wiggle.jpg') },
        { palabra: 'Amarillo', descripcion: 'Color amarillo', imagen_url: unsplash('photo-1504196606676-a8f8a261b882'), video_url: wiki('ASL Y@CenterTrunkhigh-PalmOut Wiggle.jpg') },
        { palabra: 'Negro', descripcion: 'Color negro', imagen_url: unsplash('photo-1614850523459-c2f5539bee7f'), video_url: wiki('ASL 1@NearPalm-FingerDown-FlatB@CenterChesthigh-PalmUp.jpg') },
        { palabra: 'Blanco', descripcion: 'Color blanco', imagen_url: unsplash('photo-1519681393784-d120267933ba'), video_url: wiki('ASL 1@Palm-FingerDown-FlatB@CenterChesthigh-PalmUp.jpg') },
      ],
    }],
  },
  {
    categoria: { nombre: 'Animales', icono: '🐾', descripcion: 'Animales comunes' },
    niveles: [{
      nombre: 'Básico', orden: 1,
      flashcards: [
        { palabra: 'Perro', descripcion: 'Animal doméstico fiel', imagen_url: unsplash('photo-1583511655852-be7a77ae13af'), video_url: wiki('ASL 1@NearSide-PalmDown Pat.jpg') },
        { palabra: 'Gato', descripcion: 'Animal doméstico ágil', imagen_url: unsplash('photo-1514888286974-6c03e2ca1dba'), video_url: wiki('ASL F@NearCheek-PalmBack Brush.jpg') },
        { palabra: 'Pájaro', descripcion: 'Animal con alas', imagen_url: unsplash('photo-1444464666168-49d633b86797'), video_url: wiki('ASL G@CenterTrunkhigh-PalmIn Wiggle.jpg') },
        { palabra: 'Pez', descripcion: 'Animal acuático', imagen_url: unsplash('photo-1522069163334-018f35d7817a'), video_url: wiki('ASL 1@NearPalm-1@NearPalm Wiggle.jpg') },
        { palabra: 'Caballo', descripcion: 'Animal de granja grande', imagen_url: unsplash('photo-1553284965-83fd3e82fa5a'), video_url: wiki('ASL FlatB@SideHead-PalmForward.jpg') },
        { palabra: 'Conejo', descripcion: 'Animal con orejas largas', imagen_url: unsplash('photo-1585110396000-c9ffd4e4b308'), video_url: wiki('ASL 2@NearSideHead-PalmBack.jpg') },
      ],
    }],
  },
  {
    categoria: { nombre: 'Comida', icono: '🍎', descripcion: 'Alimentos y bebidas' },
    niveles: [{
      nombre: 'Básico', orden: 1,
      flashcards: [
        { palabra: 'Manzana', descripcion: 'Fruta roja o verde', imagen_url: unsplash('photo-1560806887-1e4cd0b6cbd6'), video_url: wiki('ASL A@NearCheek-PalmBack.jpg') },
        { palabra: 'Pan', descripcion: 'Alimento básico horneado', imagen_url: unsplash('photo-1509440159596-0249088772ff'), video_url: wiki('ASL FlatB@CenterTrunkhigh-PalmDown.jpg') },
        { palabra: 'Agua', descripcion: 'Líquido para beber', imagen_url: unsplash('photo-1548839140-29a7493971a9'), video_url: wiki('ASL W@NearChin-PalmDown.jpg') },
        { palabra: 'Leche', descripcion: 'Bebida blanca nutritiva', imagen_url: unsplash('photo-1563636619-e9143da7973b'), video_url: wiki('ASL Open8@CenterChesthigh-PalmIn Squeeze.jpg') },
        { palabra: 'Pizza', descripcion: 'Comida italiana redonda', imagen_url: unsplash('photo-1513104890138-7c749659a591'), video_url: wiki('ASL Z@CenterTrunkhigh-PalmOut.jpg') },
        { palabra: 'Arroz', descripcion: 'Grano blanco cocido', imagen_url: unsplash('photo-1586201375761-83865001e31c'), video_url: wiki('ASL R@NearPalm-1@NearPalm Wiggle.jpg') },
      ],
    }],
  },
  {
    categoria: { nombre: 'Escuela', icono: '🏫', descripcion: 'Vocabulario del aula' },
    niveles: [{
      nombre: 'Básico', orden: 1,
      flashcards: [
        { palabra: 'Libro', descripcion: 'Objeto para leer', imagen_url: unsplash('photo-1495446815901-a7297e633e8d'), video_url: wiki('ASL OpenB@CenterChesthigh-PalmUp OpenClose.jpg') },
        { palabra: 'Lápiz', descripcion: 'Instrumento para escribir', imagen_url: unsplash('photo-1513547922017-7b310b98a9c9'), video_url: wiki('ASL 1@NearPalm-1@NearPalm Wiggle.jpg') },
        { palabra: 'Maestro', descripcion: 'Persona que enseña', imagen_url: unsplash('photo-1503676260728-1c00da094a0b'), video_url: wiki('ASL FlatO@CenterTrunkhigh-PalmOut.jpg') },
        { palabra: 'Escuela', descripcion: 'Lugar de aprendizaje', imagen_url: unsplash('photo-1523050854058-8df90110c9f1'), video_url: wiki('ASL OpenB@CenterChesthigh-PalmUp Clap.jpg') },
        { palabra: 'Amigo', descripcion: 'Persona cercana y de confianza', imagen_url: unsplash('photo-1529156069898-49953e39b3ac'), video_url: wiki('ASL 1@NearHand-FingerAside-1@CenterChesthigh-FingerAcross.jpg') },
        { palabra: 'Aprender', descripcion: 'Adquirir conocimiento', imagen_url: unsplash('photo-1434030216411-0b793f4b4173'), video_url: wiki('ASL FlatO@CenterForehead-PalmBack.jpg') },
      ],
    }],
  },
  {
    categoria: { nombre: 'Números', icono: '🔢', descripcion: 'Números del 1 al 5' },
    niveles: [{
      nombre: 'Básico', orden: 1,
      flashcards: [
        { palabra: 'Uno', descripcion: 'Número 1', imagen_url: unsplash('photo-1635070041078-e363dbe005cb'), video_url: wiki('ASL 1@Finger-Open8@Center.jpg') },
        { palabra: 'Dos', descripcion: 'Número 2', imagen_url: unsplash('photo-1618005182384-a83a8bd57fbe'), video_url: wiki('ASL 2@NearSideHead-PalmBack.jpg') },
        { palabra: 'Tres', descripcion: 'Número 3', imagen_url: unsplash('photo-1614680376573-df3480f0c6ff'), video_url: wiki('ASL 3@SideTrunkhigh-PalmDown.jpg') },
        { palabra: 'Cuatro', descripcion: 'Número 4', imagen_url: unsplash('photo-1614680376593-854a54203b19'), video_url: wiki('ASL 4@TipFinger-OpenB@CenterChesthigh.jpg') },
        { palabra: 'Cinco', descripcion: 'Número 5', imagen_url: unsplash('photo-1614680376733-6d8a3c7f304d'), video_url: wiki('ASL 5@Chest-PalmBack.jpg') },
      ],
    }],
  },
  {
    categoria: { nombre: 'Emociones', icono: '😊', descripcion: 'Sentimientos y estados de ánimo' },
    niveles: [{
      nombre: 'Básico', orden: 1,
      flashcards: [
        { palabra: 'Feliz', descripcion: 'Sentir alegría', imagen_url: unsplash('photo-1492684223066-81342ee5ff30'), video_url: wiki('ASL 1@NearCheek-1@NearCheek.jpg') },
        { palabra: 'Triste', descripcion: 'Sentir pena o melancolía', imagen_url: unsplash('photo-1507003211169-0a1dd7228f2d'), video_url: wiki('ASL 1@NearFace-PalmIn Downward.jpg') },
        { palabra: 'Enojado', descripcion: 'Sentir molestia o rabia', imagen_url: unsplash('photo-1614850523459-c2f5539bee7f'), video_url: wiki('ASL Claw5@NearFace-PalmIn.jpg') },
        { palabra: 'Amor', descripcion: 'Cariño y afecto', imagen_url: unsplash('photo-1518199266798-9fa1082474e5'), video_url: wiki('ASL 5@CenterChesthigh-PalmIn.jpg') },
        { palabra: 'Miedo', descripcion: 'Sentir temor', imagen_url: unsplash('photo-1509245853715-3318f37242f7'), video_url: wiki('ASL 1@NearSfhead-PalmBack.jpg') },
      ],
    }],
  },
];

module.exports = { CONTENIDO_INICIAL };
