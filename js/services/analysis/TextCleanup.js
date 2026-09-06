/*
 * Gemeinsame Text-Helfer für den Parser. Ersetzt die früher pro
 * Extractor kopierten Bullet-Regex und unique()-Implementierungen.
 */

const BULLET_PREFIX = /^[•●✓✔\-–—]\s*/;

export function stripBulletPrefix(line) {
    return line.replace(BULLET_PREFIX, "").trim();
}

export function unique(values) {
    return [...new Set(values.map(value => value.trim()).filter(Boolean))];
}

/*
 * e) Ähnliche (nicht nur exakt gleiche) Inhalte nicht doppelt
 * übernehmen. Zwei Zeilen gelten als "ähnlich", wenn eine davon -
 * normalisiert (klein geschrieben, ohne Satzzeichen, ohne doppelte
 * Leerzeichen) - vollständig in der anderen enthalten ist. Von zwei
 * ähnlichen Zeilen wird die längere/vollständigere behalten.
 */
export function uniqueSimilar(values) {
    const trimmed = values.map(value => value.trim()).filter(Boolean);
    const normalize = value => value
        .toLowerCase()
        .replace(/[.,;:!?()"'„“]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const kept = [];

    for (const value of trimmed) {
        const normalizedValue = normalize(value);
        let replaced = false;
        let isDuplicate = false;

        for (let i = 0; i < kept.length; i++) {
            const normalizedKept = normalize(kept[i]);

            if (normalizedKept === normalizedValue) {
                isDuplicate = true;
                break;
            }
            if (normalizedKept.includes(normalizedValue)) {
                // neue Zeile steckt schon vollständig in einer vorhandenen
                isDuplicate = true;
                break;
            }
            if (normalizedValue.includes(normalizedKept)) {
                // neue Zeile ist die vollständigere Version -> alte ersetzen
                kept[i] = value;
                replaced = true;
                break;
            }
        }

        if (!isDuplicate && !replaced) {
            kept.push(value);
        }
    }

    return kept;
}

export function toLines(text) {
    return (text || "")
        .split(/\r?\n/)
        .map(line => line.replace(/\s+/g, " ").trim())
        .filter(Boolean);
}

export function isIgnoredLine(line, ignoreMarkers) {
    const value = line.toLowerCase();
    return line === "----" || ignoreMarkers.some(marker => value.includes(marker));
}
