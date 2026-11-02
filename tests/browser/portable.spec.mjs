import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const file = new URL('../../index.html', import.meta.url);
test('la vista autónoma funciona sin red, sin servidor ni archivos externos', async ({
  page,
  context,
}) => {
  const errors = [];
  const remoteRequests = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (/^https?:/.test(request.url())) remoteRequests.push(request.url());
  });
  await context.setOffline(true);
  // The managed browser disallows file:// navigation. Feed the same standalone HTML
  // into its document while offline, as an embedded artifact viewer does.
  await page.setContent(readFileSync(file, 'utf8'));
  await expect(page.getByRole('button', { name: 'Nexo, ir al inicio' })).toBeVisible();
  await expect(page.getByText('Vista de prueba.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Pragmat', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Pragmat', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Memoria', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Contexto que se queda.' })).toBeVisible();
  expect(remoteRequests).toEqual([]);
  expect(errors).toEqual([]);
});

test('el HTML se puede mostrar incrustado y conserva una vista sin JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const html = readFileSync(file, 'utf8');
  await page.setContent('<iframe title="Nexo" style="width:100%;height:900px"></iframe>');
  await page.locator('iframe').evaluate((iframe, html) => {
    iframe.srcdoc = html;
  }, html);
  const frame = page.frameLocator('iframe');
  await expect(frame.getByRole('button', { name: 'Nexo, ir al inicio' })).toBeVisible();
  await context.close();
  const noScript = await browser.newContext({ javaScriptEnabled: false });
  const fallback = await noScript.newPage();
  await fallback.setContent(html);
  await expect(
    fallback.getByRole('heading', { name: 'Las buenas ideas empiezan aquí.' }),
  ).toBeVisible();
  await expect(fallback.getByRole('heading', { name: 'Hecho de Nada', exact: true })).toBeVisible();
  await noScript.close();
});
