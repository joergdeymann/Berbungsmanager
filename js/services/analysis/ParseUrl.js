import { detectSourceProfile } from "./SourceProfiles.js";

/*
 * ParseUrl
 * --------
 * Ruft eine Stellenanzeigen-URL ab (über den serverseitigen Proxy,
 * siehe server.js - direktes fetch() im Browser scheitert bei
 * fremden Domains an CORS), schränkt den Inhalt auf den für die
 * jeweilige Quelle bekannten Bereich ein (SourceProfiles.js) und
 * liefert reinen, formatierungsfreien Text zurück - fertig zum
 * Einspeisen in dieselbe Analyse wie manuell eingefügter Text.
 */
export class ParseUrl {

    async getHtml(url) {
        const response = await fetch(`/api/fetch-url?url=${encodeURIComponent(url)}`);
        const contentType = response.headers.get("content-type") || "";

        if (!response.ok) {
            const body = contentType.includes("application/json")
                ? (await response.json()).error
                : `HTTP-Fehler ${response.status}`;
            throw new Error(body || `HTTP-Fehler ${response.status}`);
        }

        return await response.text();
    }

    // Beschränkt den HTML-Inhalt auf die bekannten Bereiche der
    // Quelle und gibt eine Liste von { name, text } zurück - text
    // bereits von HTML-Formatierung befreit (nur reiner Text).
    extractSections(html, profile) {
        const doc = new DOMParser().parseFromString(html, "text/html");
        const sections = [];

        for (const section of profile.sections) {
            for (const selector of section.selectors) {
                const element = doc.querySelector(selector);
                if (element) {
                    const text = this.cleanText(this.blockTextContent(doc, element));
                    if (text) sections.push({ name: section.name, text });
                    break; // erster passender Selektor pro Sektion reicht
                }
            }
        }

        if (!sections.length) {
            const fallback = doc.querySelector("main") || doc.querySelector("article") || doc.body;
            const text = fallback ? this.cleanText(this.blockTextContent(doc, fallback)) : "";
            if (text) sections.push({ name: "Gesamter Inhalt", text });
        }

        return sections;
    }

    // element.textContent allein hängt Block-Elemente (li/p/div/...)
    // ohne Trennzeichen aneinander. Vor dem Auslesen werden deshalb
    // Zeilenumbrüche an den üblichen Block-/Aufzählungs-Grenzen
    // eingefügt, damit Listen und Absätze erhalten bleiben.
    blockTextContent(doc, element) {
        const withBreaks = element.innerHTML
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, "\n");

        const temp = doc.createElement("div");
        temp.innerHTML = withBreaks;
        return temp.textContent;
    }

    cleanText(text) {
        return text
            .replace(/\u00a0/g, " ")
            .split(/\r?\n/)
            .map(line => line.replace(/[ \t]+/g, " ").trim())
            .filter(Boolean)
            .join("\n");
    }

    // Kompletter Ablauf: Quelle anhand der URL erkennen, Seite
    // abrufen, relevante Bereiche extrahieren.
    async fetchAndExtract(url) {
        const profile = detectSourceProfile(url);
        const html = await this.getHtml(url);
        const sections = this.extractSections(html, profile);

        if (!sections.length) {
            throw new Error(
                "Es konnte kein Inhalt aus der Seite gelesen werden " +
                "(evtl. Login erforderlich oder Seitenstruktur unbekannt)."
            );
        }

        return {
            source: profile.name,
            url,
            fetchedAt: new Date().toISOString(),
            sections
        };
    }
}
