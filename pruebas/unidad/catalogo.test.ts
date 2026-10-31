import { describe, it, expect } from 'vitest';
import { CATALOGO, MENSAJES } from '../../lib/catalogo';
import { validarCupon } from '../../lib/cupones';

// lib/catalogo.ts alimenta la pantalla de pago. Si una `razon` nueva de
// validarCupon se queda sin mensaje, el cliente vería `undefined`.

describe('catálogo de la aplicación de ejemplo', () => {
  it('tiene un mensaje para cada razón de rechazo', () => {
    for (const razon of ['formato', 'inexistente', 'vencido', 'agotado']) {
      expect(typeof MENSAJES[razon]).toBe('string');
      expect(MENSAJES[razon].length > 0).toBe(true);
    }
  });

  it('cada cupón del catálogo tiene un código que el validador reconoce', () => {
    const ahora = new Date('2026-10-24T00:00:00Z');
    for (const c of CATALOGO) {
      const r = validarCupon(c.codigo, CATALOGO, ahora);
      const razon = r.ok ? null : r.razon;
      expect(razon === 'formato' || razon === 'inexistente').toBe(false);
    }
  });
});
