import { existsSync } from 'node:fs';
import { preview } from 'vite';
import puppeteer from 'puppeteer-core';

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];
const CHROME = CHROME_PATHS.find((p) => existsSync(p));
if (!CHROME) throw new Error('No se encontró Chrome/Edge para la prueba de humo.');

const PORT = 4173;
const URL = `http://localhost:${PORT}/`;

const TEXT_300 = 'Peluquería prueba de salto de línea muy largo '.repeat(8);

let failures = 0;
const check = (name, condition, detail = '') => {
  const ok = Boolean(condition);
  console.log(`${ok ? 'PASS' : 'FAIL'} - ${name}${detail ? ` (${detail})` : ''}`);
  if (!ok) failures += 1;
};

async function suite(mode) {
  console.log(`\n=== Modo: ${mode} ===`);
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  if (mode === 'js') {
    await page.evaluateOnNewDocument(() => {
      const original = CSS.supports.bind(CSS);
      CSS.supports = (prop, value) =>
        prop === 'field-sizing' ? false : original(prop, value);
    });
  }

  await page.goto(URL, { waitUntil: 'networkidle0' });

  const info = await page.evaluate(() => ({
    fieldSizing: CSS.supports('field-sizing', 'content'),
    textInputs: document.querySelectorAll(
      'input[type="text"], input[type="tel"], input[type="email"], input[type="number"], input:not([type])'
    ).length,
    textareas: document.querySelectorAll('textarea').length,
    inputs: document.querySelectorAll('input').length,
  }));

  check(`${mode}: ningún <input> de texto libre`, info.textInputs === 0, `encontrados=${info.textInputs}`);
  check(`${mode}: hay campos multi-línea`, info.textareas >= 15, `textareas=${info.textareas}`);
  check(`${mode}: se aplicó el modo esperado`, mode === 'js' ? !info.fieldSizing : info.fieldSizing);

  const medir = async (selector, texto) => {
    await page.evaluate((sel) => document.querySelector(sel)?.scrollIntoView({ block: 'center' }), selector);
    const antes = await page.evaluate(
      (sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        return { h: el.clientHeight, w: el.clientWidth, sw: el.scrollWidth, sh: el.scrollHeight };
      },
      selector
    );
    if (!antes) return { existe: false };
    await page.type(selector, texto, { delay: 0 });
    const despues = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      return { h: el.clientHeight, w: el.clientWidth, sw: el.scrollWidth, sh: el.scrollHeight, v: el.value };
    }, selector);
    return { existe: true, antes, despues };
  };

  // 1) Campo corto (nombre): debe crecer y no tener scroll horizontal ni vertical
  const nombre = await medir('#nombre', TEXT_300);
  check(`${mode}: #nombre existe`, nombre.existe);
  if (nombre.existe) {
    const { antes, despues } = nombre;
    check(`${mode}: #nombre sin scroll horizontal`, despues.sw <= despues.w + 1, `sw=${despues.sw} w=${despues.w}`);
    check(`${mode}: #nombre sin scroll vertical interno`, despues.sh <= despues.h + 1, `sh=${despues.sh} h=${despues.h}`);
    check(`${mode}: #nombre creció con el texto`, despues.h > antes.h, `${antes.h} -> ${despues.h}`);
  }

  // 2) Caja grande (seguimiento): llega al borde y hace salto de línea
  const seguimiento = await medir('#seguimiento', TEXT_300);
  check(`${mode}: #seguimiento existe`, seguimiento.existe);
  if (seguimiento.existe) {
    const { despues } = seguimiento;
    check(`${mode}: #seguimiento sin scroll horizontal`, despues.sw <= despues.w + 1, `sw=${despues.sw} w=${despues.w}`);
    check(`${mode}: #seguimiento sin scroll vertical interno`, despues.sh <= despues.h + 1, `sh=${despues.sh} h=${despues.h}`);
  }

  // 3) Persistencia: recargar y comprobar que los datos siguen
  await new Promise((r) => setTimeout(r, 900)); // deja terminar el guardado con debounce
  const almacenado = await page.evaluate(() => {
    const raw = localStorage.getItem('ficha-tecnica:datos:v1');
    return raw ? JSON.parse(raw) : null;
  });
  check(`${mode}: hay datos en localStorage`, Boolean(almacenado));
  check(
    `${mode}: localStorage conserva el nombre escrito`,
    almacenado?.datosGenerales?.nombre?.length === TEXT_300.length,
    `len=${almacenado?.datosGenerales?.nombre?.length}`
  );

  await page.reload({ waitUntil: 'networkidle0' });
  const trasRecargar = await page.evaluate(() => ({
    nombre: document.querySelector('#nombre')?.value ?? '',
    seguimiento: document.querySelector('#seguimiento')?.value ?? '',
  }));
  check(
    `${mode}: el nombre sobrevive a la recarga`,
    trasRecargar.nombre === TEXT_300,
    `len=${trasRecargar.nombre.length}`
  );
  check(`${mode}: el seguimiento sobrevive a la recarga`, trasRecargar.seguimiento === TEXT_300);

  // 4) Tras recargar, la caja vuelve a medir su contenido (no queda cortada)
  const trasRecargaMedicion = await page.evaluate(() => {
    const el = document.querySelector('#nombre');
    return { sh: el.scrollHeight, h: el.clientHeight, w: el.clientWidth, sw: el.scrollWidth };
  });
  check(
    `${mode}: tras recargar, texto visible sin scroll`,
    trasRecargaMedicion.sh <= trasRecargaMedicion.h + 1 && trasRecargaMedicion.sw <= trasRecargaMedicion.w + 1,
    `sh=${trasRecargaMedicion.sh} h=${trasRecargaMedicion.h}`
  );

  await browser.close();
}

async function suiteFlush() {
  console.log('\n=== Modo: cierre inmediato (pagehide) + Nueva ficha ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(URL, { waitUntil: 'networkidle0' });

  await page.type('#nombre', 'Guardado de emergencia', { delay: 0 });
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
  await page.reload({ waitUntil: 'networkidle0' });
  const nombreTrasCierre = await page.evaluate(() => document.querySelector('#nombre')?.value ?? '');
  check('flush: el texto escrito queda si la pestaña se cierra de inmediato', nombreTrasCierre === 'Guardado de emergencia');

  page.on('dialog', (dialog) => dialog.accept());
  await page.evaluate(() => {
    [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('Nueva ficha'))?.click();
  });
  await new Promise((r) => setTimeout(r, 700));
  const trasNueva = await page.evaluate(() => ({
    nombre: document.querySelector('#nombre')?.value ?? '',
    guardado: localStorage.getItem('ficha-tecnica:datos:v1'),
  }));
  check('nueva ficha: limpia el formulario', trasNueva.nombre === '', `nombre="${trasNueva.nombre}"`);
  check(
    'nueva ficha: limpia lo almacenado',
    !trasNueva.guardado || !JSON.parse(trasNueva.guardado).datosGenerales.nombre,
    `guardado=${trasNueva.guardado?.slice(0, 40)}`
  );

  await browser.close();
}

async function suiteImpresion() {
  console.log('\n=== Modo: impresión (ancho A4 con márgenes) ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(URL, { waitUntil: 'networkidle0' });

  await page.type('#seguimiento', TEXT_300, { delay: 0 });
  await new Promise((r) => setTimeout(r, 700));

  await page.emulateMediaType('print');
  await page.setViewport({ width: 734, height: 1000 }); // A4 8mm de margen @96dpi
  await new Promise((r) => setTimeout(r, 400));

  const resultado = await page.evaluate(() => {
    const toolbar = document.querySelector('.ficha-toolbar');
    const oculto = toolbar ? getComputedStyle(toolbar).display === 'none' : false;
    const recortados = [...document.querySelectorAll('textarea')].filter(
      (el) => el.scrollHeight > el.clientHeight + 1
    );
    const horizontal = [...document.querySelectorAll('textarea')].filter(
      (el) => el.scrollWidth > el.clientWidth + 1
    );
    return {
      oculto,
      total: document.querySelectorAll('textarea').length,
      recortados: recortados.length,
      horizontal: horizontal.length,
      ejemplos: recortados.slice(0, 3).map((el) => el.id || el.name),
    };
  });

  check('impresión: la barra de herramientas no se imprime', resultado.oculto);
  check(
    'impresión: ningún texto queda cortado al reducir el ancho a A4',
    resultado.recortados === 0,
    `recortados=${resultado.recortados} (${resultado.ejemplos.join(', ')})`
  );
  check(
    'impresión: ningún texto desborda en horizontal',
    resultado.horizontal === 0,
    `total=${resultado.total}`
  );

  const pdf = await page.pdf({ format: 'A4', printBackground: true });
  check('impresión: se genera un PDF con contenido', pdf.length > 20000, `bytes=${pdf.length}`);

  await browser.close();
}

async function suiteTipografia() {
  console.log('\n=== Modo: tipografía global (pantalla y PDF) ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(URL, { waitUntil: 'networkidle0' });

  const leer = () =>
    page.evaluate(() => {
      const estilo = (el) => {
        if (!el) return null;
        const cs = getComputedStyle(el);
        return { size: cs.fontSize, family: cs.fontFamily, weight: cs.fontWeight };
      };
      const grupo = (selectores) =>
        selectores
          .map((s) => ({ sel: s, ...estilo(document.querySelector(s)) }))
          .filter((x) => x.size);
      const raiz = getComputedStyle(document.documentElement);
      const token = (n) => raiz.getPropertyValue(n).trim();
      return {
        tokens: {
          campos: token('--fs-campo'),
          etiquetas: token('--fs-etiqueta'),
          opciones: token('--fs-lista'),
          titulos: token('--fs-titulo'),
        },
        campos: grupo([
          '.especifique-input',
          '.caracteristicas-input',
          '.cuidado-input',
          '.seguimiento-textarea',
          '.cronograma-textarea',
          '.input-field-input',
        ]),
        etiquetas: grupo([
          '.especifique-label',
          '.caracteristicas-label',
          '.input-field-label',
          '.historial-pregunta',
          '.diagnostico-pregunta',
        ]),
        opciones: grupo([
          '.tipo-radio',
          '.historial-option',
          '.diagnostico-option',
          '.cuidado-radio',
          '.cronograma-option',
        ]),
        titulos: [...document.querySelectorAll('.section-title')].map((el) => ({
          sel: 'section-title',
          ...estilo(el),
        })),
      };
    });

  const validar = (etiqueta, datos) => {
    for (const [rol, items] of Object.entries(datos)) {
      if (rol === 'tokens') continue;
      const esperado = datos.tokens[rol];
      check(`${etiqueta}: hay varios ${rol}`, items.length >= 2, `n=${items.length}`);
      const distintos = [...new Set(items.map((i) => i.size))].filter((s) => s !== esperado);
      check(
        `${etiqueta}: ${rol} usan el token ${esperado}`,
        items.length > 0 && distintos.length === 0,
        distintos.join(' | ') || 'todos'
      );
    }
    return datos;
  };

  const pantalla = validar('tipografía pantalla', await leer());
  const familias = new Set(
    [...pantalla.campos, ...pantalla.etiquetas, ...pantalla.opciones, ...pantalla.titulos].map(
      (i) => i.family
    )
  );
  check('tipografía pantalla: una sola familia en toda la ficha', familias.size === 1, [...familias].join(' | '));

  await page.emulateMediaType('print');
  await new Promise((r) => setTimeout(r, 300));
  const impresa = validar('tipografía PDF', await leer());

  const menor = (a, b) => parseFloat(a) < parseFloat(b);
  check(
    'tipografía PDF: los campos se imprimen más pequeños que en pantalla',
    impresa.campos.every((c, i) => menor(c.size, pantalla.campos[i].size)),
    `${pantalla.campos[0].size} -> ${impresa.campos[0].size}`
  );
  check(
    'tipografía PDF: los títulos conservan la jerarquía (más grandes que los campos)',
    impresa.titulos.every((t) => !menor(t.size, impresa.campos[0].size)),
    `titulo=${impresa.titulos[0].size} campo=${impresa.campos[0].size}`
  );

  await browser.close();
}

const server = await preview({ preview: { port: PORT, strictPort: true } });
try {
  await suite('nativa');
  await suite('js');
  await suiteFlush();
  await suiteImpresion();
  await suiteTipografia();
} finally {
  await server.httpServer.close();
}
console.log(failures === 0 ? '\nTODO OK' : `\n${failures} comprobaciones fallidas`);
process.exit(failures === 0 ? 0 : 1);
