import { SECTION_DEFINITIONS, IGNORE_LINE_MARKERS } from "./ParserConfig.js";
import { toLines, isIgnoredLine } from "./TextCleanup.js";

/*
 * SectionParser
 * -------------
 * Schneidet den Bewerbungstext anhand von Überschriften in Blöcke
 * (siehe ParserConfig.SECTION_DEFINITIONS). Eine Überschrift matched,
 * wenn sie...
 *   b) exakt einem bekannten Titel entspricht oder mit ihm beginnt, ODER
 *   a) alle Begriffe einer "allOf"-Gruppe enthält (UND-Verknüpfung)
 *
 * c) Trägt die Überschriften-Zeile selbst schon Inhalt (z.B.
 *    "Wofür wir stehen: Nachhaltigkeit - soziale Verantwortung"),
 *    wird der Teil nach dem Doppelpunkt als erste Inhaltszeile
 *    mit übernommen statt verworfen zu werden.
 * d) Kommt derselbe Abschnittsname mehrfach vor, werden alle
 *    Vorkommen zusammengehängt statt sich zu überschreiben.
 * e) Ähnliche/enthaltene Inhalte werden nicht doppelt übernommen
 *    (siehe TextCleanup.uniqueSimilar, von den Extractoren genutzt).
 * Ignore-Lines (Werbe-/Rausch-Zeilen) werden vor der Zuordnung
 * entfernt, damit sie in keinem Abschnitt landen.
 */
export class SectionParser {

    constructor(definitions = SECTION_DEFINITIONS, ignoreMarkers = IGNORE_LINE_MARKERS) {
        this.definitions = definitions;
        this.ignoreMarkers = ignoreMarkers;
    }

    parse(text) {
        const lines = toLines(text).filter(line => !isIgnoredLine(line, this.ignoreMarkers));
        const headings = this.findHeadings(lines);

        const sections = {};

        for (let i = 0; i < headings.length; i++) {
            const current = headings[i];
            const next = headings[i + 1];
            const start = current.index + 1;
            const end = next ? next.index : lines.length;

            // c) Inline-Inhalt der Überschriftenzeile (falls vorhanden)
            //    kommt vor den restlichen Zeilen des Blocks.
            const block = [current.inline, ...lines.slice(start, end)]
                .filter(Boolean)
                .join("\n")
                .trim();

            if (!block) continue;

            // d) mehrere Vorkommen desselben Ziels werden zusammengehängt
            sections[current.name] = sections[current.name]
                ? `${sections[current.name]}\n${block}`
                : block;
        }

        return sections;
    }

    findHeadings(lines) {
        const found = [];

        lines.forEach((line, index) => {
            const normalized = this.normalizeHeading(line);
            const definition = this.matchDefinition(normalized);

            if (definition) {
                found.push({
                    name: definition.name,
                    index,
                    title: line,
                    inline: this.extractInlineContent(line)
                });
            }
        });

        return found;
    }

    matchDefinition(normalizedLine) {
        for (const definition of this.definitions) {
            if (this.matchesTitles(normalizedLine, definition.titles)) {
                return definition;
            }
            if (this.matchesAllOf(normalizedLine, definition.allOf)) {
                return definition;
            }
        }
        return null;
    }

    // b) exakter Treffer oder Überschrift startet mit dem Suchbegriff
    matchesTitles(normalizedLine, titles = []) {
        return titles.some(title =>
            normalizedLine === title || normalizedLine.startsWith(title)
        );
    }

    // a) alle Begriffe einer Gruppe müssen in der Überschrift vorkommen.
    // Nur auf kurze, überschriftenartige Zeilen anwenden - sonst matcht
    // z.B. ein Fließtext-Satz wie "Passt zu 5 der 6 erforderlichen
    // Qualifikationen:" fälschlich als eigene Überschrift.
    matchesAllOf(normalizedLine, groups = [], maxHeadingWords = 6) {
        if (normalizedLine.split(/\s+/).length > maxHeadingWords) return false;
        return groups.some(group =>
            group.every(term => normalizedLine.includes(term))
        );
    }

    // c) Inhalt, der in derselben Zeile nach einem Doppelpunkt steht,
    // z.B. "Wofür wir stehen: Nachhaltigkeit - soziale Verantwortung"
    // -> "Nachhaltigkeit - soziale Verantwortung"
    extractInlineContent(line) {
        const colonIndex = line.indexOf(":");
        if (colonIndex === -1) return "";
        return line.slice(colonIndex + 1).trim();
    }

    normalizeHeading(value) {
        return value
            .toLowerCase()
            .replace(/[.:!?]/g, "")
            .trim();
    }
}
