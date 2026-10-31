import { test, expect, type Page } from '@playwright/test';

// Plan Taller: Q240.00 de subtotal. Sin descuento, el IVA lo deja en Q268.80.
// Un cupón rechazado tiene que mostrar el mensaje Y no tocar el cobro.

async function probarConCupon(page: Page, codigo: string) {
  await page.goto('/checkout');
  await page.getByLabel('Plan').selectOption('taller');
  await page.getByLabel('Cupón').fill(codigo);
  await page.getByRole('button', { name: 'Calcular' }).click();
}

async function esperarSinDescuento(page: Page) {
  await expect(page.getByTestId('subtotal')).toHaveText('Q240.00');
  await expect(page.getByTestId('descuento')).toHaveText('−Q0.00');
  await expect(page.getByTestId('iva')).toHaveText('Q28.80');
  await expect(page.getByTestId('total')).toHaveText('Q268.80');
}

test('avisa que el cupón venció y no descuenta nada', async ({ page }) => {
  await probarConCupon(page, 'USP-1999');

  await expect(page.getByText('Ese cupón ya venció.')).toBeVisible();
  await esperarSinDescuento(page);
});

test('avisa que el cupón ya se agotó y no descuenta nada', async ({ page }) => {
  await probarConCupon(page, 'USP-0404');

  await expect(
    page.getByText('Ese cupón ya se usó todas las veces que podía usarse.'),
  ).toBeVisible();
  await esperarSinDescuento(page);
});

test('avisa que el código no tiene forma de cupón', async ({ page }) => {
  await probarConCupon(page, 'hola');

  await expect(
    page.getByText('Ese código no tiene la forma de un cupón (AAA-0000).'),
  ).toBeVisible();
  await esperarSinDescuento(page);
});
