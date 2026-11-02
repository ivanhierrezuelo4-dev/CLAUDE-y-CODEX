import { test, expect } from '@playwright/test';
import { zipSync, strToU8 } from 'fflate';

test('recorrido real: proyecto, memoria aislada, contexto y consulta bloqueada sin permiso', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Las buenas ideas empiezan aquí.' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Nuevo proyecto', exact: true }).first().click();
  const modal = page.getByRole('dialog');
  await modal.getByLabel('Nombre del proyecto').fill('Laboratorio de ideas');
  await modal.getByLabel('Una breve descripción').fill('Un proyecto creado desde el navegador.');
  await modal.getByRole('button', { name: 'Crear proyecto', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Laboratorio de ideas', exact: true }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Memoria', exact: true }).click();
  await page.getByLabel('Proyecto de memoria').selectOption({ label: 'Laboratorio de ideas' });
  await page
    .getByLabel('Importar documentos')
    .setInputFiles({
      name: 'identidad.md',
      mimeType: 'text/markdown',
      buffer: Buffer.from('# Identidad\nLa mascota del laboratorio es una estrella naranja.\n'),
    });
  await expect(page.getByRole('button', { name: /identidad.md.*caracteres/ })).toBeVisible();
  await page.getByRole('button', { name: 'Laboratorio de ideas', exact: true }).click();
  await page.getByLabel('Tu petición').fill('Revisa la identidad y la mascota del laboratorio');
  await page.getByRole('button', { name: 'Preparar', exact: true }).click();
  await expect(page.getByRole('dialog').getByText('Preparada', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /fragmentos seleccionados/ }).click();
  const contextModal = page.getByRole('dialog').last();
  await expect(contextModal.locator('pre')).toContainText('estrella naranja');
  await contextModal.getByRole('button', { name: 'Cerrar ventana' }).click();
  await page.getByRole('button', { name: 'Consultar a Claude' }).click();
  await expect(page.getByRole('alert')).toContainText('Activa las consultas locales');
  expect(errors).toEqual([]);
});

test('importa todas las hojas de Excel y exporta Markdown para Obsidian', async ({ page }) => {
  const workbook = zipSync({
    '[Content_Types].xml': strToU8(
      '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/></Types>',
    ),
    'xl/workbook.xml': strToU8(
      '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Identidad" sheetId="1" r:id="rId1"/><sheet name="Precios" sheetId="2" r:id="rId2"/></sheets></workbook>',
    ),
    'xl/_rels/workbook.xml.rels': strToU8(
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Target="worksheets/sheet1.xml" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet"/><Relationship Id="rId2" Target="worksheets/sheet2.xml" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet"/></Relationships>',
    ),
    'xl/worksheets/sheet1.xml': strToU8(
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="A1"/><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>Marca naranja</t></is></c></row></sheetData></worksheet>',
    ),
    'xl/worksheets/sheet2.xml': strToU8(
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="A1"/><sheetData><row r="1"><c r="A1"><v>150</v></c></row></sheetData></worksheet>',
    ),
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Memoria', exact: true }).click();
  await page.getByLabel('Proyecto de memoria').selectOption({ label: 'Pragmat' });
  await page
    .getByLabel('Importar documentos')
    .setInputFiles({
      name: 'contexto.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: Buffer.from(workbook),
    });
  await page.getByRole('button', { name: /contexto.xlsx.md.*caracteres/ }).click();
  const doc = page.getByRole('dialog');
  await expect(doc.locator('pre')).toContainText('Marca naranja');
  await expect(doc.locator('pre')).toContainText('150');
  await expect(doc.locator('pre')).toContainText('## Precios');
  await doc.getByRole('button', { name: 'Cerrar ventana' }).click();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar Markdown' }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('Pragmat-memoria.zip');
  await page.getByLabel('Proyecto de memoria').selectOption({ label: 'Hecho de Nada' });
  await expect(page.getByText('Aquí empieza la memoria.', { exact: true })).toBeVisible();
});

test('navegación móvil, conexiones honestas y búsqueda por teclado', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Las buenas ideas empiezan aquí.' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Abrir navegación' }).click();
  await page.getByRole('button', { name: 'Conexiones', exact: true }).click();
  await expect(page.getByRole('switch')).not.toBeChecked();
  await expect(page.getByRole('dialog')).toContainText('no cambia automáticamente a una API');
  await page.getByRole('button', { name: 'Cerrar ventana' }).click();
  await page.getByRole('button', { name: 'Cerrar navegación' }).click();
  await page.keyboard.press('Control+k');
  await page.getByLabel('Buscar proyectos o peticiones').fill('Pragmat');
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /Pragmat/ })
    .click();
  await expect(page.getByRole('heading', { name: 'Pragmat', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
