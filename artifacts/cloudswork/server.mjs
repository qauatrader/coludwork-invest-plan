// Simple static file server for CloudsWork frontend (used on Railway)
import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { join, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DIST = resolve(__dirname, "dist");
const PORT = parseInt(process.env.PORT || "4173", 10);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".mjs":  "application/javascript; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".json": "application/json",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2":"font/woff2",
  ".ttf":  "font/ttf",
  ".txt":  "text/plain",
  ".webmanifest": "application/manifest+json",
};

createServer((req, res) => {
  let pathname = decodeURIComponent(req.url.split("?")[0]);
  let filePath = join(DIST, pathname);

  // Try exact file first
  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    // SPA fallback → serve index.html
    filePath = join(DIST, "index.html");
  }

  const ext = extname(filePath).toLowerCase();
  const contentType = MIME[ext] || "application/octet-stream";

  // Cache static assets (not index.html)
  const isIndex = filePath.endsWith("index.html");
  res.setHeader("Cache-Control", isIndex ? "no-cache" : "public, max-age=31536000, immutable");
  res.setHeader("Content-Type", contentType);

  createReadStream(filePath)
    .on("error", () => {
      res.writeHead(404);
      res.end("Not Found");
    })
    .pipe(res);
}).listen(PORT, "0.0.0.0", () => {
  console.log(`CloudsWork frontend running on port ${PORT}`);
});
