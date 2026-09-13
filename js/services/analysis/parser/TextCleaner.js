import { ParserConstants } from "../../../constants/ParserConstants.js";
export class TextCleaner {
    constructor(text) {
        this.text = text;
        const lines  = this
            .removeInvisibleCharacters()
            .split(/\r?\n/);
        this.lines = this.removeSimilar(lines)
            .map(line => line.trim())
            .filter(Boolean)
            .filter(e => !(
                ParserConstants.IGNORE_LINE_MARKERS.anyOf.some(marker => e.includes(marker)) ||
                ParserConstants.IGNORE_LINE_MARKERS.allOf.some(markers => markers.every(marker => e.includes(marker)))    
            ));
            
    }
    removeInvisibleCharacters() {
        return this.text.replace(ParserConstants.INVISIBLE_CHARS_REGEX, "");
    }

    toLines() {
        return this.text.split(/\r?\n/);
    }

    clean() {
        return this.text
            .replace(/[\p{Cc}\p{Cf}]/gu, "")
            .replace(/\u00a0/g, " ")
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(Boolean)
            .filter(e => !(
                ParserConstants.IGNORE_LINE_MARKERS.anyOf.some(marker => e.includes(marker)) ||
                ParserConstants.IGNORE_LINE_MARKERS.allOf.some(markers => markers.every(marker => e.includes(marker)))
            ));
    }

    /*
    * Gemeinsame Text-Helfer für den Parser. Ersetzt die früher pro
    * Extractor kopierten Bullet-Regex und unique()-Implementierungen.
    */


    stripBulletPrefix(line) {
        return line.replace(ParserConstants.BULLET_PREFIX_REGEX, "").trim();
    }

    unique(values) {
        return [...new Set(values.map(value => value.trim()).filter(Boolean))];
    }

    /*
    * e) Ähnliche (nicht nur exakt gleiche) Inhalte nicht doppelt
    * übernehmen. Zwei Zeilen gelten als "ähnlich", wenn eine davon -
    * normalisiert (klein geschrieben, ohne Satzzeichen, ohne doppelte
    * Leerzeichen) - vollständig in der anderen enthalten ist. Von zwei
    * ähnlichen Zeilen wird die längere/vollständigere behalten.
    */
    removeSimilar(values) {
        const normalize = value => value
            .toLowerCase()
            .replace(/[.,;:!?()"'„“]/g, "")
            .replace(/\s+/g, " ")
            .trim();

        // Schritt 1: O(n) – exakte Duplikate (gleicher normalisierter Text)
        // zusammenfassen, dabei jeweils die längste Rohzeile behalten
        const best = new Map(); // normalizedKey -> { value, index }
        values.forEach((value, index) => {
            const key = normalize(value);
            const existing = best.get(key);
            if (!existing || value.length > existing.value.length) {
                best.set(key, { value, index });
            }
        });

        const deduped = [...best.values()].sort((a, b) => a.index - b.index);

        // Schritt 2: O(m²) mit m << n – Teilstring-Ähnlichkeit
        // (kürzere Zeile steckt komplett in einer längeren) entfernen
        const normDeduped = deduped.map(entry => normalize(entry.value));
        const remove = new Set();

        for (let i = 0; i < deduped.length; i++) {
            for (let j = 0; j < deduped.length; j++) {
                if (i === j) continue;
                if (
                    normDeduped[j].length > normDeduped[i].length &&
                    normDeduped[j].includes(normDeduped[i])
                ) {
                    remove.add(i);
                    break;
                }
            }
        }

        return deduped
            .filter((_, index) => !remove.has(index))
            .map(entry => entry.value);
    }

    toLines(text) {
        return (text || "")
            .split(/\r?\n/)
            .map(line => line.replace(/\s+/g, " ").trim())
            .filter(Boolean);
    }

    isIgnoredLine(line, ignoreMarkers) {
        const value = line.toLowerCase();
        return line === "----" || ignoreMarkers.some(marker => value.includes(marker));
    }

}