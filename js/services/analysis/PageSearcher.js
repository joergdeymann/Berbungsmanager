import { SEARCH_HELPERS } from "./SearchHelpers.js";
import { uniqueSimilar } from "./TextCleanup.js";

/*
 * PageSearcher
 * ------------
 * Durchsucht eine bereits geladene Seite (DOM) nach bestimmten
 * Begriffen (siehe SearchHelpers.js) statt nach festen CSS-
 * Selektoren - funktioniert dadurch auch auf Seiten, die wir vorher
 * nie gesehen haben (z.B. die tatsächliche Bewerbungs-/Karriereseite
 * einer Firma, zu der der "Bewerben"-Link führt).
 */
export class PageSearcher {

    constructor(helpers = SEARCH_HELPERS) {
        this.helpers = helpers;
    }

    search(doc, baseUrl) {
        const people = this.findPeopleImages(doc, baseUrl);
        const usedUrls = new Set(people.map(person => person.url));

        return {
            contact: this.findContact(doc),
            companyInfo: this.findCompanyInfo(doc),
            images: this.findImages(doc, baseUrl).filter(url => !usedUrls.has(url)),
            people,
            logo: this.findLogo(doc, baseUrl),
            careerLinks: this.findCareerLinks(doc, baseUrl)
        };
    }

    // Sucht ein <img>, dessen src/alt/class/id auf "logo" hindeutet -
    // das ist praktisch immer das Firmenlogo.
    findLogo(doc, baseUrl) {
        for (const img of doc.querySelectorAll("img")) {
            const hint = [
                img.getAttribute("src"),
                img.getAttribute("alt"),
                img.getAttribute("class"),
                img.getAttribute("id")
            ].join(" ").toLowerCase();

            if (!hint.includes("logo")) continue;

            try {
                return new URL(img.getAttribute("src"), baseUrl).href;
            } catch { /* ungültige Bild-URL überspringen */ }
        }
        return null;
    }

    // Findet Links, die zu einem Karriere-/Jobs-Bereich führen
    // könnten (siehe SearchHelpers.Karriere) - für die spätere
    // gezielte Suche auf genau dieser Unterseite.
    findCareerLinks(doc, baseUrl, limit = 5) {
        const hints = this.helpers.Karriere || [];
        const found = [];

        for (const anchor of doc.querySelectorAll("a[href]")) {
            const label = anchor.textContent.trim().toLowerCase();
            if (!hints.some(hint => label.includes(hint))) continue;

            try {
                const url = new URL(anchor.href, baseUrl).href;
                if (!found.includes(url)) found.push(url);
            } catch { /* ungültige URL überspringen */ }

            if (found.length >= limit) break;
        }

        return found;
    }

    // Versucht, Bilder mit Personennamen zu verknüpfen (z.B. auf
    // einer Team-/Ansprechpartner-Seite): schaut je Bild in alt-Text
    // oder Bildunterschrift nach einem Namensmuster ("Vorname
    // Nachname"). Best-effort und mit Vorsicht zu genießen: im
    // Deutschen sind alle Substantive großgeschrieben ("Unser Büro"
    // sieht rein mustermäßig aus wie ein Name) - deshalb werden
    // gängige Nicht-Namen-Wörter ausgeschlossen und der unscharfe
    // Fließtext-Fallback nur bei kurzen, bildunterschriftartigen
    // Texten benutzt.
    findPeopleImages(doc, baseUrl, limit = 10) {
        const namePattern = /\b([A-ZÄÖÜ][a-zäöüß'-]+\s+[A-ZÄÖÜ][a-zäöüß'-]+)\b/;
        const NOT_A_NAME = new Set([
            "unser", "unsere", "unseren", "unserem", "unseres",
            "das", "der", "die", "unser büro", "modernes", "neues", "neue",
            "büro", "team", "gebäude", "firma", "unternehmen", "mitarbeiter",
            "karriere", "kontakt", "bild", "foto", "header", "logo", "titel"
        ]);
        const looksLikeRealName = candidate => {
            const words = candidate.toLowerCase().split(/\s+/);
            return !words.some(word => NOT_A_NAME.has(word));
        };

        const found = [];

        for (const img of doc.querySelectorAll("img[src]")) {
            const alt = img.getAttribute("alt") || "";
            const figcaption = img.closest("figure")?.querySelector("figcaption")?.textContent || "";
            const parentText = (img.parentElement?.textContent || "").trim();

            // alt/figcaption sind deutlich zuverlässiger als beliebiger
            // umgebender Text - der wird nur genutzt, wenn er kurz und
            // damit bildunterschriftartig ist.
            const shortParentText = parentText.length <= 60 ? parentText : "";
            const nameSource = alt || figcaption || shortParentText;

            const match = nameSource.match(namePattern);
            if (!match || !looksLikeRealName(match[1])) continue;

            try {
                const url = new URL(img.getAttribute("src"), baseUrl).href;
                if (!found.some(person => person.url === url)) {
                    found.push({ name: match[1].trim(), url });
                }
            } catch { /* ungültige Bild-URL überspringen */ }

            if (found.length >= limit) break;
        }

        return found;
    }

    // Sucht die Umgebung eines Kontakt-Hinweises (z.B. "Wie können
    // wir helfen?", oft ein Popup) und extrahiert Telefonnummern
    // daraus.
    findContact(doc) {
        const text = doc.body?.textContent || "";
        const lower = text.toLowerCase();

        const hint = this.helpers.Kontaktdaten.find(term => lower.includes(term));
        if (!hint) return { phones: [], raw: "" };

        const index = lower.indexOf(hint);
        const surrounding = text.slice(Math.max(0, index - 50), index + 400);
        const phones = [...surrounding.matchAll(/(\+49[\s\-/]?\(?0?\)?[\d\s\-/]{6,})/g)]
            .map(match => match[1].replace(/\s+/g, " ").trim());

        return {
            phones: [...new Set(phones)],
            raw: surrounding.replace(/\s+/g, " ").trim()
        };
    }

    // Sucht Textabschnitte rund um "Über uns"-artige Begriffe.
    findCompanyInfo(doc) {
        const text = doc.body?.textContent || "";
        const lower = text.toLowerCase();
        const blocks = [];

        for (const hint of this.helpers.Firmeninformationen) {
            const index = lower.indexOf(hint);
            if (index === -1) continue;

            const block = text.slice(index, index + 400).replace(/\s+/g, " ").trim();
            if (block) blocks.push(block);
        }

        return uniqueSimilar(blocks);
    }

    // Sammelt Bild-URLs der Seite (für die spätere Bildersammlung
    // zur Firma) - grobe Filterung offensichtlicher Icons/Tracking-
    // Pixel, keine Bildanalyse.
    findImages(doc, baseUrl, limit = 20) {
        return [...doc.querySelectorAll("img[src]")]
            .map(img => {
                try {
                    return new URL(img.getAttribute("src"), baseUrl).href;
                } catch {
                    return null;
                }
            })
            .filter(Boolean)
            .filter(src => !/sprite|pixel|1x1|tracking|icon-/i.test(src))
            .filter((src, index, all) => all.indexOf(src) === index)
            .slice(0, limit);
    }
}
