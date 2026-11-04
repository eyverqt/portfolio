// Genera el sitio para GitHub Pages en ../eyverqt.github.io.
// Pages no tiene _redirects: cada ruta limpia es una carpeta con su index.html.
// Uso: node scripts/pages.mjs   y luego commit y push en eyverqt.github.io
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const raiz = resolve(import.meta.dirname, '..');
const salida = resolve(raiz, '..', 'eyverqt.github.io');
const SITIO = 'https://eyverqt.github.io';
const HEFESTO = 'https://hefestopro.web.app';

const SECCIONES = ['agoge', 'crawlphantom', 'plisto', 'tiro', 'talaria', 'histia', 'aldo', 'hefesto',
  'about', 'experience', 'education', 'skills', 'certificates', 'contact'];
const RUTAS_TIRO = ['transcribir', 'biblioteca', 'preguntar', 'crear', 'ajustes'];

const escribir = (ruta, texto) => {
  const destino = join(salida, ruta);
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, texto);
};
const redirigir = url => `<!doctype html><html lang="es"><meta charset="utf-8"><title>Redirigiendo</title><meta http-equiv="refresh" content="0;url=${url}"><link rel="canonical" href="${url}"><script>location.replace(${JSON.stringify(url)})</script><a href="${url}">${url}</a></html>\n`;

const pagina = readFileSync(join(raiz, 'index.html'), 'utf8')
  .replace('<head>', '<head>\n<base href="/">')
  .replaceAll('https://eyverqt.netlify.app', SITIO);

for (const carpeta of ['assets', 'tiro', 'forja', 'verba']) rmSync(join(salida, carpeta), { recursive: true, force: true });
for (const s of SECCIONES) rmSync(join(salida, s), { recursive: true, force: true });

cpSync(join(raiz, 'assets'), join(salida, 'assets'), { recursive: true });
cpSync(join(raiz, 'tiro'), join(salida, 'tiro'), { recursive: true });

escribir('index.html', pagina);
for (const s of SECCIONES) if (s !== 'tiro') escribir(`${s}/index.html`, pagina);

// /tiro es una sección del portfolio; la app sigue en /tiro/app.
escribir('tiro/index.html', pagina);
const tiro = readFileSync(join(raiz, 'tiro', 'app', 'index.html'), 'utf8').replaceAll('https://eyverqt.netlify.app', SITIO);
escribir('tiro/app/index.html', tiro);
for (const r of RUTAS_TIRO) escribir(`tiro/app/${r}/index.html`, tiro);

// Direcciones antiguas
escribir('verba/index.html', redirigir(`${SITIO}/tiro`));
escribir('verba/app/index.html', redirigir(`${SITIO}/tiro/app/`));
escribir('forja/index.html', redirigir(`${SITIO}/hefesto`));
escribir('forja/app/index.html', redirigir(`${HEFESTO}/`));

// Cualquier otra ruta de la app antigua va a Hefesto; lo demás muestra el inicio.
escribir('404.html', pagina.replace('<head>', `<head>\n<script>var m=location.pathname.match(/^\\/forja\\/app(\\/.*)?$/);if(m)location.replace(${JSON.stringify(HEFESTO)}+(m[1]||"/")+location.search);</script>`));
escribir('.nojekyll', '');
console.log('Sitio generado en', salida);
