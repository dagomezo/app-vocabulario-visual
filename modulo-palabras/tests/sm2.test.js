const assert = require('assert');
const { calcularSM2, PESO } = require('../src/utils/sm2');

function assertCerca(actual, esperado, tol = 0.01, msg) {
  if (Math.abs(actual - esperado) > tol) {
    throw new assert.AssertionError({
      message: msg || `Se esperaba ${esperado}, se obtuvo ${actual}`,
      actual,
      expected: esperado
    });
  }
}

function cloneProgreso(p) {
  return { intervalo: p.intervalo, easiness_factor: p.easiness_factor, repeticiones: p.repeticiones };
}

let pasados = 0;
let fallados = 0;

function test(nombre, fn) {
  try {
    fn();
    pasados++;
    console.log(`  ✅ ${nombre}`);
  } catch (err) {
    fallados++;
    console.log(`  ❌ ${nombre}: ${err.message}`);
  }
}

console.log('\n📋 Tests SM-2\n');

// ====== Repaso Nuevo (repeticiones=0) ======
test('score 5 con repeticiones=0 → intervalo=1, EF≥2.5', () => {
  const prog = cloneProgreso({ intervalo: 1, easiness_factor: 2.5, repeticiones: 0 });
  const r = calcularSM2(prog, 5);
  assert.strictEqual(r.intervalo, 1, 'Primer repaso siempre intervalo=1');
  assert.ok(r.easiness_factor >= 2.5, 'EF no debe bajar con score=5');
  assert.strictEqual(r.repeticiones, 1);
});

test('score 3 con repeticiones=0 → intervalo=1, EF≈2.36', () => {
  const prog = cloneProgreso({ intervalo: 1, easiness_factor: 2.5, repeticiones: 0 });
  const r = calcularSM2(prog, 3);
  assert.strictEqual(r.intervalo, 1);
  assertCerca(r.easiness_factor, 2.36, 0.01);
  assert.strictEqual(r.repeticiones, 1);
});

test('score 1 con repeticiones=0 → reinicia (intervalo=1, rep=0)', () => {
  const prog = cloneProgreso({ intervalo: 1, easiness_factor: 2.5, repeticiones: 0 });
  const r = calcularSM2(prog, 1);
  assert.strictEqual(r.intervalo, 1);
  assert.strictEqual(r.repeticiones, 0, 'Score<3 debe reiniciar repeticiones');
  assertCerca(r.easiness_factor, 2.5);
});

// ====== Segundo Repaso (repeticiones=1) ======
test('score 5 con repeticiones=1 → intervalo=6', () => {
  const prog = cloneProgreso({ intervalo: 1, easiness_factor: 2.5, repeticiones: 1 });
  const r = calcularSM2(prog, 5);
  assert.strictEqual(r.intervalo, 6, 'Segundo repaso con score≥3 debe dar intervalo=6');
  assert.strictEqual(r.repeticiones, 2);
});

test('score 1 con repeticiones=1 → reinicia a intervalo=1, rep=0', () => {
  const prog = cloneProgreso({ intervalo: 6, easiness_factor: 2.5, repeticiones: 1 });
  const r = calcularSM2(prog, 1);
  assert.strictEqual(r.intervalo, 1);
  assert.strictEqual(r.repeticiones, 0);
});

// ====== Repasos Posteriores (repeticiones≥2) ======
test('score 5 con repeticiones=2 → intervalo = round(6 * 2.6) = 16', () => {
  const prog = cloneProgreso({ intervalo: 6, easiness_factor: 2.6, repeticiones: 2 });
  const r = calcularSM2(prog, 5);
  assert.strictEqual(r.intervalo, Math.round(6 * 2.6));
  assert.strictEqual(r.repeticiones, 3);
  assert.ok(r.easiness_factor > 2.6, 'EF debe aumentar con score=5');
});

test('score 3 con repeticiones=2 → EF baja ligeramente', () => {
  const prog = cloneProgreso({ intervalo: 10, easiness_factor: 2.5, repeticiones: 2 });
  const r = calcularSM2(prog, 3);
  assert.ok(r.easiness_factor < 2.5, 'Score=3 debe bajar ligeramente EF');
  assert.ok(r.easiness_factor >= 1.3, 'EF nunca debe bajar de 1.3');
});

// ====== Límite Inferior EF ======
test('EF nunca baja de 1.3 aunque scores sean malos', () => {
  const prog = cloneProgreso({ intervalo: 1, easiness_factor: 1.3, repeticiones: 5 });
  const r = calcularSM2(prog, 1);
  assert.ok(r.easiness_factor >= 1.3, 'EF mínimo es 1.3');
  assert.strictEqual(r.intervalo, 1);
  assert.strictEqual(r.repeticiones, 0, 'Score<3 siempre reinicia');
});

// ====== Pesos por Tipo de Juego ======
test('memoria: score 5 con peso 0.7 → scoreAjustado=4 → no reinicia', () => {
  const prog = cloneProgreso({ intervalo: 1, easiness_factor: 2.5, repeticiones: 0 });
  const r = calcularSM2(prog, 5, 'memoria');
  assert.strictEqual(r.repeticiones, 1, 'scoreAjustado=4 (≥3) no debe reiniciar');
});

test('unir: score 3 con peso 0.8 → scoreAjustado=2 → reinicia', () => {
  const prog = cloneProgreso({ intervalo: 1, easiness_factor: 2.5, repeticiones: 2 });
  const r = calcularSM2(prog, 3, 'unir');
  assert.strictEqual(r.repeticiones, 0, 'scoreAjustado=2 (<3) debe reiniciar');
});

test('flashcards: score 5 con peso 1.0 → scoreAjustado=5', () => {
  const prog = cloneProgreso({ intervalo: 1, easiness_factor: 2.5, repeticiones: 0 });
  const r = calcularSM2(prog, 5, 'flashcards');
  assert.strictEqual(r.repeticiones, 1);
  assertCerca(r.easiness_factor, 2.6, 0.01);
});

// ====== Repaso Después de Largo Tiempo ======
test('intervalo se multiplica por EF en repasos avanzados', () => {
  const prog = cloneProgreso({ intervalo: 30, easiness_factor: 2.5, repeticiones: 10 });
  const r = calcularSM2(prog, 4);
  assert.strictEqual(r.intervalo, Math.round(30 * 2.5));
  assert.strictEqual(r.repeticiones, 11);
});

// ====== proximo_repaso es futuro ======
test('proximo_repaso es una fecha futura', () => {
  const prog = cloneProgreso({ intervalo: 1, easiness_factor: 2.5, repeticiones: 0 });
  const r = calcularSM2(prog, 5);
  assert.ok(r.proximo_repaso instanceof Date, 'proximo_repaso debe ser Date');
  assert.ok(r.proximo_repaso > new Date(), 'proximo_repaso debe ser futuro');
});

// ====== Score Ajustado con Redondeo ======
test('score 4 en memoria → scoreAjustado=round(4*0.7)=round(2.8)=3 → no reinicia', () => {
  const prog = cloneProgreso({ intervalo: 1, easiness_factor: 2.5, repeticiones: 0 });
  const r = calcularSM2(prog, 4, 'memoria');
  assert.strictEqual(r.repeticiones, 1, 'round(2.8)=3 ≥ 3, no debe reiniciar');
});

// ====== Resumen ======
console.log(`\n📊 Resultados: ${pasados} pasados, ${fallados} fallados de ${pasados + fallados}\n`);

process.exit(fallados > 0 ? 1 : 0);
