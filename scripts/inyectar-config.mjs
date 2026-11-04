// Corre en el build de Netlify: pone la clave web de Firebase en la app de Forja.
// El repo solo guarda el marcador, así la clave no queda en git. Si falta la
// variable, el build falla y Netlify mantiene publicada la versión anterior.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const MARCADOR = '__FORJA_FIREBASE_API_KEY__';
const clave = process.env.FORJA_FIREBASE_API_KEY || '';
if (!/^AIza[\w-]{35}$/.test(clave)) {
  console.error('Falta FORJA_FIREBASE_API_KEY en Netlify (o no tiene el formato de una clave web de Firebase).');
  process.exit(1);
}

const carpeta = join('forja', 'app', 'assets');
let cambiados = 0;
for (const nombre of readdirSync(carpeta)) {
  if (!nombre.endsWith('.js')) continue;
  const ruta = join(carpeta, nombre);
  const texto = readFileSync(ruta, 'utf8');
  if (!texto.includes(MARCADOR)) continue;
  writeFileSync(ruta, texto.replaceAll(MARCADOR, clave));
  cambiados++;
}
if (!cambiados) {
  console.error(`No se encontró ${MARCADOR} en ${carpeta}: la compilación de Forja no es la esperada.`);
  process.exit(1);
}
console.log(`Clave de Firebase inyectada en ${cambiados} archivo(s).`);
