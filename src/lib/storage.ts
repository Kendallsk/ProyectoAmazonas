import { FichaTecnicaData } from '../components/FichaTecnica/types';

const STORAGE_KEY = 'ficha-tecnica:datos:v1';

export type SaveResult = 'ok' | 'parcial' | 'error';

/** Último contenido realmente escrito: evita escrituras repetidas e idénticas. */
let lastPayload: string | null = null;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Combina lo guardado sobre los valores por defecto.
 * Si el esquema cambia entre versiones, las claves nuevas toman su valor por defecto
 * y las claves viejas se ignoran: nunca rompe la restauración.
 */
function merge<T>(base: T, saved: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(saved)) {
    return (saved === undefined ? base : saved) as T;
  }

  const result: Record<string, unknown> = { ...base };
  for (const [key, savedValue] of Object.entries(saved)) {
    if (!(key in (base as Record<string, unknown>))) continue;
    result[key] = merge((base as Record<string, unknown>)[key], savedValue);
  }
  return result as T;
}

export function loadFicha(createDefault: () => FichaTecnicaData): FichaTecnicaData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefault();

    const parsed: unknown = JSON.parse(raw);
    if (!isPlainObject(parsed)) return createDefault();

    return merge(createDefault(), parsed);
  } catch {
    return createDefault();
  }
}

export function saveFicha(data: FichaTecnicaData): SaveResult {
  let payload: string;
  try {
    payload = JSON.stringify(data);
  } catch {
    return 'error';
  }

  if (payload === lastPayload) return 'ok';

  try {
    localStorage.setItem(STORAGE_KEY, payload);
    lastPayload = payload;
    return 'ok';
  } catch {
    // Sin espacio: se prioriza el texto (lo que se escribe a mano) sobre las fotos.
    try {
      const soloTexto: FichaTecnicaData = {
        ...data,
        caracteristicasGenerales: {
          ...data.caracteristicasGenerales,
          imagenAntes: '',
          imagenDespues: '',
        },
        productosUso: data.productosUso.map((producto) => ({ ...producto, imagen: '' })),
      };
      const soloTextoPayload = JSON.stringify(soloTexto);
      localStorage.setItem(STORAGE_KEY, soloTextoPayload);
      lastPayload = soloTextoPayload;
      return 'parcial';
    } catch {
      return 'error';
    }
  }
}

export function clearFicha(): void {
  lastPayload = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Almacenamiento no disponible: se ignora.
  }
}
