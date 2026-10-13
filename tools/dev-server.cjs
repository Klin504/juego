/** Sirve el proyecto localmente para que el navegador cargue los módulos ES. */
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 8000);
const mimeTypes = Object.freeze({
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
});

http.createServer((request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  } catch {
    response.writeHead(400).end("Ruta inválida");
    return;
  }

  // Resuelve la ruta y rechaza solicitudes que intenten salir del proyecto.
  const candidate = path.resolve(root, `.${pathname}`);
  if (candidate !== root && !candidate.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403).end("Acceso denegado");
    return;
  }

  // Sirve index.html para carpetas y asigna el tipo MIME según la extensión.
  fs.stat(candidate, (statError, stat) => {
    const file = !statError && stat.isDirectory() ? path.join(candidate, "index.html") : candidate;
    fs.readFile(file, (readError, contents) => {
      if (readError) {
        response.writeHead(404).end("Archivo no encontrado");
        return;
      }
      response.writeHead(200, {
        "Content-Type": mimeTypes[path.extname(file)] ?? "application/octet-stream",
        "Cache-Control": "no-store",
      });
      response.end(contents);
    });
  });
}).listen(port, "127.0.0.1", () => {
  console.log(`Chilos Fighters: http://localhost:${port}/`);
  console.log(`Pruebas: http://localhost:${port}/tests/tests.html`);
});
