/**
 * archive-data.js
 * Datos del Archivo del recorrido, folios M-01 a M-04,
 * normalización de palabra de mantenimiento y mensajes de la terminal.
 * Fase 3.1 según contratos 1.5 y EASTER_EGG.md.
 */

export const ARCHIVE_HEADER_TEXT =
  "NULL tenía un oficio antes de los desafíos. Lee sus cuatro notas siguiendo la ruta del campus.";

export const ARCHIVE_SHEETS = Object.freeze([
  Object.freeze({
    id: "estacionamiento",
    index: 1,
    place: "1 · Estacionamiento",
    folio: "M-01 · G",
    letter: "G",
    text: "Chilo enseña el primer paso: observa la señal antes de acercarte. Los conos delimitan el duelo; los vehículos quedan fuera de la arena.",
  }),
  Object.freeze({
    id: "cancha",
    index: 2,
    place: "2 · Cancha",
    folio: "M-02 · U",
    letter: "U",
    text: "Las líneas muestran por dónde vendrá Vera. Un salto a tiempo evita la carrera; mira también el regreso del balón.",
  }),
  Object.freeze({
    id: "laboratorio",
    index: 3,
    place: "3 · Laboratorio",
    folio: "M-03 · Í",
    letter: "Í",
    text: "Los sensores de CÁTODO-3 se iluminan antes de activarse. La franja apagada marca el camino seguro.",
  }),
  Object.freeze({
    id: "biblioteca",
    index: 4,
    place: "4 · Biblioteca",
    folio: "M-04 · A",
    letter: "A",
    text: "Entre los estantes hay rutas para explorar. Ningún estudiante debe perder la libertad de elegir su camino.",
  }),
]);

export const TERMINAL_MESSAGES = Object.freeze({
  EMPTY: "Escribe la palabra que describía el trabajo original de NULL.",
  INCORRECT: "Registro no encontrado. Revisa los folios en el orden del recorrido.",
  FIRST_UNLOCK: "Función recuperada: Visor GUÍA. Puedes usarlo una vez por combate para anticipar un ataque.",
  ALREADY_UNLOCKED: "Visor GUÍA disponible. Durante un combate, pulsa E o selecciona su botón en el HUD.",
  STORAGE_FAILED: "El Visor funciona esta sesión, pero no se pudo guardar en este navegador.",
});

/**
 * Normaliza la palabra de entrada recortando espacios exteriores,
 * pasando a mayúsculas y equiparando 'Í' con 'I'.
 * @param {string} raw
 * @returns {string}
 */
export function normalizarPalabra(raw) {
  if (typeof raw !== "string") return "";
  return raw
    .trim()
    .toUpperCase()
    .replace(/Í/g, "I");
}

export const VALID_MAINTENANCE_WORD = "GUIA";
