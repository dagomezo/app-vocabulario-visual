📱 Pantallas actuales
1. Login profesor (/)
┌─────────────────────────────────────┐
│  [Fondo: img/fondo.png con gradiente]│
│                                     │
│      ┌─────────────────────┐        │
│      │  🤟 Señas App       │        │
│      │  Aprende señas      │        │
│      │  mientras juegas    │        │
│      │                     │        │
│      │  [Bienvenido]       │← badge  │
│      │                     │        │
│      │  Tu nombre          │        │
│      │  ┌───────────────┐  │        │
│      │  │ Ej: David     │  │        │
│      │  └───────────────┘  │        │
│      │                     │        │
│      │  PIN de acceso      │        │
│      │  ┌───────────────┐  │        │
│      │  │ ●●●●          │  │        │
│      │  └───────────────┘  │        │
│      │                     │        │
│      │  [█████ Entrar █████]│← verde  │
│      │  ───────────────────│        │
│      │  ¿Eres alumno?      │        │
│      │  [🧑‍🎓 Entrar como   │        │
│      │   alumno]           │← outline│
│      └─────────────────────┘        │
└─────────────────────────────────────┘
- Card blanca centrada, sombra suave
- Fondo con imagen de paisaje/naturaleza (fondo.png)
- Inputs con borde beige y focus verde
2. Login alumno (/login-alumno) — 3 pasos
Paso 1: Elegir profesor          Paso 2: Elegir alumno         Paso 3: PIN
┌──────────────────────┐         ┌──────────────────────┐      ┌──────────────────┐
│  [○ ● ○] Pasos       │         │  [● ● ○] Pasos       │      │  [● ● ●] Pasos   │
│                      │         │                      │      │                  │
│  Selecciona tu       │         │  ¿Quién eres?        │      │  [Avatar grande]  │
│  profesor:           │         │                      │      │  Nombre           │
│                      │         │  ┌────┐ ┌────┐      │      │                  │
│  ┌────────────────┐  │         │  │img │ │img │      │      │  Ingresa tu PIN:  │
│  │ David          │  │         │  │Juan │ │María│      │      │  ┌────────────┐  │
│  └────────────────┘  │         │  └────┘ └────┘      │      │  │  ●●●●      │  │
│                      │         │                      │      │  └────────────┘  │
│  [Continuar]         │         │  [Atrás]             │      │                  │
└──────────────────────┘         └──────────────────────┘      │  [Entrar]        │
                                                               └──────────────────┘
- Mismo layout que login pero con fondo f2.png
- Paso 1: lista de profesores (nombre)
- Paso 2: grid de tarjetas (avatar + nombre del alumno)
- Paso 3: avatar grande + input PIN de 4 dígitos con letra grande
3. Inicio alumno (/inicio)
┌─────────────────────────────────────┐
│  [🖼️ Avatar] Juan  @juanito     🔒 │← top bar
├─────────────────────────────────────┤
│                                     │
│  🔥 ¡Bienvenido, Juan!             │
│                                     │
│  ┌──────────────────────────┐       │
│  │   📊 12 / 30 palabras    │       │
│  │   ▓▓▓▓▓▓▓░░░░░░░         │       │← barra de progreso
│  │   Aprendidas: 12         │       │
│  │   Por repasar: 5         │       │
│  └──────────────────────────┘       │
│                                     │
│  ┌──────────────────────────┐       │
│  │  🎯 Misión de Hoy        │       │
│  │  5 palabras pendientes   │       │← tarjeta verde
│  │  [Comenzar]              │       │
│  └──────────────────────────┘       │
│                                     │
│  ┌──────────────────────────┐       │
│  │  🎮 Juegos               │       │
│  │  Practica libre          │       │
│  └──────────────────────────┘       │
│                                     │
├─────────────────────────────────────┤
│  🏠 Inicio  📖 Diccionario  🎮 Juegos│← bottom nav
└─────────────────────────────────────┘
- Fondo crema con textura de fondo f3.png
- Top bar sticky con avatar, nombre, @apodo
- Bottom nav fijo en móvil, 3 iconos
4. Diccionario (/diccionario)
┌─────────────────────────────────────┐
│  Top bar + bottom nav               │
│                                     │
│  🔍 Buscar palabra...               │← input
│                                     │
│  [Todas las categorías ▾]           │← filtro
│  [Todos los niveles ▾]              │
│                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐        │
│  │ img  │ │ img  │ │ img  │        │← grid de cards
│  │ Perro │ │ Gato │ │ Casa │        │
│  │ Básico│ │ Básic│ │ Básic│        │
│  └──────┘ └──────┘ └──────┘        │
│                                     │
│  ◀ Página 1 de 5 ▶                 │← paginación
└─────────────────────────────────────┘
- Grid responsive (auto-fill, min 150px)
- Cada card: imagen arriba (130px), palabra abajo, nivel
5. Detalle Palabra (/diccionario/:id)
┌─────────────────────────────────────┐
│  ← Volver                           │
│                                     │
│  ┌──────────────────────────┐       │
│  │      [Imagen grande]     │       │
│  │      Perro               │       │
│  └──────────────────────────┘       │
│                                     │
│  ┌──────────────────────────┐       │
│  │     [Video de la seña]   │       │
│  └──────────────────────────┘       │
│                                     │
│  Descripción:                       │
│  ┌──────────────────────────┐       │
│  │  Señal que se hace con   │       │
│  │  la mano derecha...      │       │
│  └──────────────────────────┘       │
└─────────────────────────────────────┘
6. Juegos Hub (/juegos)
┌─────────────────────────────────────┐
│  Top bar + bottom nav               │
│                                     │
│  🔥 Camino del Diccionario          │
│  Progreso: ▓▓▓▓░░░░ 3/10           │← barra
│                                     │
│  ┌──────┬────────────────────┐      │
│  │  1   │ Flashcards - Fácil │      │← tarjeta
│  │  🃏  │ Saludos básicos    │      │  con borde
│  │      │ 🟢 completado      │      │  color por tipo
│  └──────┴────────────────────┘      │
│  ┌──────┬────────────────────┐      │
│  │  2   │ Quiz - Fácil       │      │
│  │  ❓  │ Familia            │      │
│  │      │ ▶ Jugar            │      │
│  └──────┴────────────────────┘      │
│  ... (10 slots)                     │
│                                     │
│  ──── Práctica Libre ────           │
│  [10] [20] [50]                     │← selector cantidad
│                                     │
│  [Saludos] [Familia] [Colores]      │← categorías
│  🃏 ❓ 🧠 🔗                       │← tipos juego
└─────────────────────────────────────┘
- "Camino": 10 slots con diseño tipo tarjeta, borde de color según tipo
- Cada slot tiene número circular verde, nombre, descripción, badge de dificultad
- Práctica libre: categorías con botones por tipo de juego
7. Juego Flashcards (/juegos/flashcards)
┌─────────────────────────────────────┐
│  ← Volver       3/10               │← barra inmersiva
├─────────────────────────────────────┤
│                                     │
│  ▓▓▓▓▓▓▓▓░░░░░░░░░                  │← barra progreso
│                                     │
│  ┌──────────────────────────┐       │
│  │      [Imagen grande]     │       │← panel verde
│  │       🐕 PERRO           │       │
│  │  Toca la seña correcta   │       │
│  └──────────────────────────┘       │
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │ [Video 1]│  │ [Video 2]│        │← 4 opciones
│  └──────────┘  └──────────┘        │  en grid 2x2
│  ┌──────────┐  ┌──────────┐        │
│  │ [Video 3]│  │ [Video 4]│        │
│  └──────────┘  └──────────┘        │
│                                     │
│  [Feedback: ✅ o ❌ + corrección]   │
│  [Siguiente →]                      │
└─────────────────────────────────────┘
- Fondo inmersivo (oculta nav). 4 opciones en grid 2x2
- Al acertar: confeti, al fallar: shake + muestra respuesta correcta
- Botón de calificación 1-5 estrellas (SM-2)
8. Quiz (/juegos/quiz)
┌─────────────────────────────────────┐
│  ← Volver       3/10               │
├─────────────────────────────────────┤
│                                     │
│  ▓▓▓▓▓▓▓▓░░░░░░░░                   │
│                                     │
│  ┌──────────────────────────┐       │
│  │     [Video de seña]      │       │← panel blanco
│  │     ¿Qué palabra es?     │       │
│  └──────────────────────────┘       │
│                                     │
│  ┌──────────────────────────┐       │
│  │  Perro                    │       │← 4 opciones texto
│  ├──────────────────────────┤       │
│  │  Gato                     │       │
│  ├──────────────────────────┤       │
│  │  Casa                     │       │
│  ├──────────────────────────┤       │
│  │  Árbol                    │       │
│  └──────────────────────────┘       │
│                                     │
│  [Feedback: ✅ o ❌]                │
└─────────────────────────────────────┘
9. Memoria (/juegos/memoria)
┌─────────────────────────────────────┐
│  ← Volver       3/10               │
├─────────────────────────────────────┤
│                                     │
│  🧠 Encuentra los pares            │
│                                     │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐              │
│  │❓│ │❓│ │❓│ │❓│              │← 12 cards
│  └──┘ └──┘ └──┘ └──┘              │  (hasta 6 pares)
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐              │
│  │❓│ │❓│ │❓│ │❓│              │
│  └──┘ └──┘ └──┘ └──┘              │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐              │
│  │❓│ │❓│ │❓│ │❓│              │
│  └──┘ └──┘ └──┘ └──┘              │
│                                     │
│  Intentos: 3    Pares: 2/6         │
└─────────────────────────────────────┘
- Grid de 12 cartas (6 pares: palabra ↔ seña)
- Al dar vuelta, muestra imagen o video de seña
10. Unir (/juegos/unir)
┌─────────────────────────────────────┐
│  ← Volver       3/10               │
├─────────────────────────────────────┤
│                                     │
│  🔗 Une cada palabra con su seña   │
│                                     │
│  ┌──────────┐    ┌──────────┐      │
│  │ Perro    │    │ [Video]  │      │
│  ├──────────┤    ├──────────┤      │
│  │ Gato     │    │ [Video]  │      │
│  ├──────────┤    ├──────────┤      │
│  │ Casa     │    │ [Video]  │      │
│  ├──────────┤    ├──────────┤      │
│  │ Árbol    │    │ [Video]  │      │
│  └──────────┘    └──────────┘      │
│                                     │
│  Toca palabra → toca seña          │
└─────────────────────────────────────┘
11. Fin de Sesión (/juegos/fin)
┌─────────────────────────────────────┐
│                                     │
│          🎉                         │← emoji grande
│      ¡Bien hecho!                    │  animación bounce
│                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐        │
│  │  12  │ │  5   │ │  92% │        │← stats cards
│  │Palab.│ │Racha │ │Acier.│        │
│  └──────┘ └──────┘ └──────┘        │
│                                     │
│  🪙 +15 monedas                     │
│  🔥 Racha de 5 días                 │
│                                     │
│  [🔄 Jugar de nuevo]                │
│  [🎮 Más juegos]                    │
│  [🏠 Ir al inicio]                  │
└─────────────────────────────────────┘
12. Admin (/admin/*)
┌──────────────┬──────────────────────────┐
│  Sidebar     │  Contenido principal      │
│  verde       │                          │
│              │  Panel de Administración  │
│  🏠 Inicio   │  ┌────────────────────┐  │
│  👥 Alumnos  │  │ 📊 Analytics       │  │
│  📚 Palabras │  │ Alumnos: 12        │  │
│    📁 Cat.   │  │ Activos: 8         │  │
│    📊 Niv.   │  │ ...                │  │
│    🃏 Flash  │  └────────────────────┘  │
│  📈 Analít.  │                          │
│              │  ┌────────────────────┐  │
│  [🔒 Cerrar  │  │ Gráfico semanal   │  │
│   sesión]    │  │ ▓▓▓▓▓▓░░░░        │  │
│              │  └────────────────────┘  │
└──────────────┴──────────────────────────┘
- Sidebar fijo a la izquierda (gradiente verde oscuro → verde)
- Contenido a la derecha
- En móvil: sidebar se oculta, se muestra menú hamburguesa
- Secciones: Alumnos (CRUD), Categorías, Niveles, Flashcards (CRUD con upload Cloudinary)
📐 Componentes compartidos
Componente	Descripción
StudentLayout	Top bar sticky (avatar+nombre+@apodo), bottom nav fijo (🏠📖🎮), breadcrumbs
Mascot	SVG mascota con 4 variantes (wave, read, celebrate, point)
SafeImage	Imagen con fallback si no carga
AvatarIcon	Muestra avatar del alumno
StudentProgressBar	Barra de progreso horizontal
StreakBadge	🔥 badge de racha
ConfirmDialog	Modal de confirmación con borde grueso y sombra
GameImmersiveBar	Barra superior durante juegos (← volver + progreso)
AvatarSelectGrid	Grid para seleccionar avatar
📌 Para Figma
Crea un archivo Figma con:
1. Página 1: Login Profesor + Login Alumno (3 pasos)
2. Página 2: Inicio + Diccionario + Detalle Palabra
3. Página 3: Hub Juegos + Juego Flashcards + Quiz
4. Página 4: Memoria + Unir + Fin Sesión
5. Página 5: Admin Panel (sidebar + analytics + CRUD)