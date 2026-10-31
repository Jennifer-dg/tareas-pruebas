import { describe, it, expect } from 'vitest';
import { validarCupon, type CuponGuardado } from '../../lib/cupones';

const d = (iso: string) => new Date(`${iso}T00:00:00Z`);
const AHORA = d('2026-10-24');

/** Un cupón de catálogo, con lo que quieras cambiado encima. */
const guardado = (extra: Partial<CuponGuardado> = {}): CuponGuardado => ({
  codigo: 'USP-2026',
  tipo: 'porcentaje',
  valor: 50,
  venceEn: d('2026-12-31'),
  limiteUsos: 100,
  usos: 0,
  ...extra,
});

const CATALOGO = [guardado()];

describe('validarCupon', () => {
  // ── Esta te la regalo, para que veas la forma ──────────────────────────────
  it('acepta un código que existe y está vigente', () => {
    const r = validarCupon('USP-2026', CATALOGO, AHORA);
    expect(r.ok).toBe(true);
  });

  // ── Una prueba por regla de lib/cupones.ts ─────────────────────────────────
  // Todas miran la `razon` exacta, no solo `ok: false`: un rechazo por el
  // motivo equivocado sigue siendo un error.

  it('rechaza un código con el formato equivocado', () => {
    // Solo dos letras, y con cinco dígitos: cada una rompe una parte distinta.
    expect(validarCupon('US-2026', CATALOGO, AHORA)).toEqual({ ok: false, razon: 'formato' });
    expect(validarCupon('USP-20261', CATALOGO, AHORA)).toEqual({ ok: false, razon: 'formato' });
    expect(validarCupon('USP2026', CATALOGO, AHORA)).toEqual({ ok: false, razon: 'formato' });
  });

  it('rechaza un código que no está en el catálogo', () => {
    expect(validarCupon('NOP-9999', CATALOGO, AHORA)).toEqual({ ok: false, razon: 'inexistente' });
  });

  it('rechaza un cupón vencido', () => {
    const catalogo = [guardado({ venceEn: d('2026-10-23') })];
    expect(validarCupon('USP-2026', catalogo, AHORA)).toEqual({ ok: false, razon: 'vencido' });
  });

  it('acepta el cupón el mismo día en que vence', () => {
    // Vence exactamente en `AHORA`: todavía sirve, vence al final de ese día.
    const catalogo = [guardado({ venceEn: AHORA })];
    expect(validarCupon('USP-2026', catalogo, AHORA).ok).toBe(true);
  });

  it('rechaza un cupón que ya llegó a su límite de usos', () => {
    // usos === limiteUsos: ya se usó todas las veces que podía.
    const catalogo = [guardado({ limiteUsos: 3, usos: 3 })];
    expect(validarCupon('USP-2026', catalogo, AHORA)).toEqual({ ok: false, razon: 'agotado' });
  });

  it('acepta un cupón al que todavía le queda un uso', () => {
    const catalogo = [guardado({ limiteUsos: 3, usos: 2 })];
    expect(validarCupon('USP-2026', catalogo, AHORA).ok).toBe(true);
  });

  it('acepta el código aunque venga en minúsculas', () => {
    const r = validarCupon('usp-2026', CATALOGO, AHORA);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.cupon.codigo).toBe('USP-2026');
  });

  it('acepta el código aunque venga con espacios en los extremos', () => {
    expect(validarCupon('  USP-2026  ', CATALOGO, AHORA).ok).toBe(true);
  });
});
