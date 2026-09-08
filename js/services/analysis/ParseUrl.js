import { detectSourceProfile } from "./SourceProfiles.js";
import { PageSearcher } from "./PageSearcher.js";

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

    constructor(pageSearcher = new PageSearcher()) {
        this.pageSearcher = pageSearcher;
    }

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
    extractSections(doc, profile) {
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

    // LinkedIn verpackt ausgehende Links oft in eine eigene
    // "Sicherheitsseite" (linkedin.com/safety/go/?url=<Ziel>) statt
    // direkt zu verlinken. Für unsere Zwecke (Bewerbungslink der
    // Firma) wollen wir das eigentliche Ziel, nicht den Umweg.
    resolveRedirect(url) {
        try {
            const parsed = new URL(url);
            if (parsed.hostname.includes("linkedin.com") && parsed.pathname.includes("/safety/go/")) {
                const target = parsed.searchParams.get("url");
                if (target) return decodeURIComponent(target);
            }
        } catch { /* ignore, dann bleibt es die ursprüngliche URL */ }
        return url;
    }

    // Sucht im rohen HTML (VOR jeder Text-Bereinigung/Ignore-Line-
    // Filterung, die "Bewerben" als Rausch-Zeile entfernen würde)
    // nach einem Link in der Nähe von "bewerben"/"jetzt bewerben"/
    // "apply", der nicht auf die Quelle selbst zurückführt - das ist
    // meist der eigentliche Bewerbungslink des Unternehmens.
    // Best-effort: LinkedIn "Easy Apply" & Co. sind oft JS-Buttons
    // ohne echten href, dann liefert das hier nichts - unbedingt vor
    // Übernahme prüfen.
    findApplicationLink(doc, sourceUrl) {
        let sourceHost = "";
        try { sourceHost = new URL(sourceUrl).hostname; } catch { /* ignore */ }

        const candidates = [...doc.querySelectorAll("a[href]")].filter(anchor => {
            const label = `${anchor.textContent} ${anchor.getAttribute("aria-label") || ""}`.toLowerCase();
            return /bewerben|apply|jetzt bewerben/.test(label);
        });

        const external = candidates.find(anchor => {
            try {
                const href = new URL(anchor.href, sourceUrl);
                return href.hostname && !href.hostname.includes(sourceHost);
            } catch {
                return false;
            }
        });

        if (!external) return null;

        try {
            const absolute = new URL(external.href, sourceUrl).href;
            return this.resolveRedirect(absolute);
        } catch {
            return null;
        }
    }

    // Ruft eine (zweite) Seite ab - z.B. die tatsächliche
    // Bewerbungs-/Karriereseite hinter dem "Bewerben"-Link - und
    // durchsucht sie per PageSearcher nach Kontaktdaten,
    // Firmeninformationen und Bildern (Suchehilfen statt fixer
    // Selektoren, da wir die Seite vorher nicht kennen).
    async searchPage(url) {
        const html = await this.getHtml(url);
        const doc = new DOMParser().parseFromString(html, "text/html");
        return this.pageSearcher.search(doc, url);
    }
    // Kompletter Ablauf: Quelle anhand der URL erkennen, Seite
    // abrufen, relevante Bereiche extrahieren.
    async fetchAndExtract(url) {
        const profile = detectSourceProfile(url);
        const html = await this.getHtml(url);
        const doc = new DOMParser().parseFromString(html, "text/html");
        const sections = this.extractSections(doc, profile);
        const applicationLink = this.findApplicationLink(doc, url);

        if (!sections.length) {
            throw new Error(
                "Es konnte kein Inhalt aus der Seite gelesen werden " +
                "(evtl. Login erforderlich oder Seitenstruktur unbekannt)."
            );
        }

        return {
            source: profile.name,
            url,
            applicationLink,
            fetchedAt: new Date().toISOString(),
            sections
        };
    }
}
