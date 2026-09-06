import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


/**
 * Liefert eine statische Datei aus dem Projekt aus.
 */
async function serveStaticFile(req, res) {

    try {
        const url = new URL(req.url, `http://localhost:${PORT}`);
        const requestedPath = decodeURIComponent(url.pathname);

        // Führende "/" entfernen
        const relativePath = requestedPath.replace(/^\/+/, "");

        // Dateipfad erzeugen
        const filePath = path.resolve(__dirname, relativePath);

        // Sicherheit:
        // Datei muss innerhalb des Projektverzeichnisses liegen
        if (!filePath.startsWith(__dirname)) {
            res.writeHead(403);
            res.end("403 - Zugriff verweigert");
            return true;
        }

        const file = await fs.readFile(filePath);

        const contentType = getContentType(filePath);

        res.writeHead(200, {
            "Content-Type": contentType
        });

        res.end(file);

        return true;

    } catch (error) {

        if (error.code === "ENOENT") {
            return false;
        }

        console.error(error);

        res.writeHead(500);
        res.end("500 - Interner Serverfehler");

        return true;
    }
}


/**
 * Ermittelt den MIME-Type anhand der Dateiendung.
 */
function getContentType(filePath) {

    const extension = path.extname(filePath).toLowerCase();

    const types = {
        ".html": "text/html; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".svg": "image/svg+xml",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".ico": "image/x-icon",
        ".webp": "image/webp"
    };

    return types[extension] ?? "application/octet-stream";
}


/**
 * HTTP-Server
 */
const server = http.createServer(async (req, res) => {

    // Startseite
    if (req.url === "/") {

        const filePath = path.join(__dirname, "index.html");

        try {

            const html = await fs.readFile(filePath, "utf8");

            res.writeHead(200, {
                "Content-Type": "text/html; charset=utf-8"
            });

            res.end(html);

        } catch (error) {

            console.error(error);

            res.writeHead(500, {
                "Content-Type": "text/plain; charset=utf-8"
            });

            res.end("Fehler beim Laden der index.html");
        }

        return;
    }


    // Statische Dateien
    const served = await serveStaticFile(req, res);

    if (served) {
        return;
    }


    // Nicht gefunden
    res.writeHead(404, {
        "Content-Type": "text/plain; charset=utf-8"
    });

    res.end("404 - Nicht gefunden");
});


server.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});
