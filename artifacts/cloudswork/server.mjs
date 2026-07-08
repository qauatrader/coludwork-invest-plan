// Static file server + /api proxy for CloudsWork frontend (Render / Railway)
import { createServer, request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { createReadStream, existsSync, statSync } from "node:fs";
import { join, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DIST = resolve(__dirname, "dist");
const PORT = parseInt(process.env.PORT || "4173", 10);

// API_URL: where to forward /api/* requests (e.g. https://cloudswork-api.onrender.com)
const API_URL = process.env.API_URL ? process.env.API_URL.replace(/\/+$/, "") : null;

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
  // Proxy /api/* to the API server
  if (API_URL && req.url.startsWith("/api")) {
    const target = new URL(API_URL);
    const isHttps = target.protocol === "https:";
    const options = {
      hostname: target.hostname,
      port: target.port || (isHttps ? 443 : 80),
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: target.hostname },
    };
    const proxy = (isHttps ? httpsRequest : httpRequest)(options, (apiRes) => {
      res.writeHead(apiRes.statusCode, apiRes.headers);
      apiRes.pipe(res);
    });
    proxy.on("error", (err) => {
      res.writeHead(502);
      res.end(`API proxy error: ${err.message}`);
    });
    req.pipe(proxy);
    return;
  }

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
