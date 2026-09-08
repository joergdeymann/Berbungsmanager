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

        if (error.code === "ENOENT" || error.code === "EISDIR") {
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
 * Proxy-Endpunkt: ruft eine fremde URL serverseitig ab und gibt das
 * HTML zurück. Notwendig, weil der Browser fremde Domains wegen CORS
 * nicht direkt per fetch() lesen darf - der Server hat dieses
 * Problem nicht.
 */
async function handleFetchUrl(req, res, url) {
    const target = url.searchParams.get("url");

    if (!target || !/^https?:\/\//i.test(target)) {
        res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ error: "Ungültige oder fehlende URL." }));
        return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
        const response = await fetch(target, {
            signal: controller.signal,
            headers: {
                // Manche Seiten liefern ohne "echten" Browser-User-Agent
                // stark eingeschränkte/andere HTML-Varianten aus.
                "User-Agent": "Mozilla/5.0 (compatible; Bewerbungsmanager/1.0)"
            }
        });

        const html = await response.text();

        res.writeHead(response.ok ? 200 : response.status, {
            "Content-Type": "text/plain; charset=utf-8"
        });
        res.end(html);

    } catch (error) {
        const timedOut = error.name === "AbortError";
        const code = error.cause?.code;
        const unreachable = code === "ENOTFOUND" || code === "ECONNREFUSED" || code === "EAI_AGAIN";
        console.error(error);

        let message = "Die URL konnte nicht abgerufen werden.";
        if (timedOut) {
            message = "Zeitüberschreitung beim Abrufen der URL (Ziel-Server antwortet nicht).";
        } else if (unreachable) {
            message = "Der Ziel-Server ist nicht erreichbar (Domain ungültig oder Server down).";
        }

        res.writeHead(timedOut ? 504 : 502, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ error: message }));
    } finally {
        clearTimeout(timeout);
    }
}


/**
 * HTTP-Server
 */
const server = http.createServer(async (req, res) => {

    const requestUrl = new URL(req.url, `http://localhost:${PORT}`);

    // Proxy für externe Seiten (siehe ParseUrl.js)
    if (requestUrl.pathname === "/api/fetch-url") {
        await handleFetchUrl(req, res, requestUrl);
        return;
    }

    // Startseite (auch mit Query-String, z.B. /?importUrl=... vom Bookmarklet)
    if (requestUrl.pathname === "/") {

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
