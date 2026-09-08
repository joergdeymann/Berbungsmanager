import { SECTION_DEFINITIONS, IGNORE_LINE_MARKERS, INLINE_KEYWORD_RULES } from "./ParserConfig.js";
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
 * Zusätzlich: einzelne Sätze OHNE eigene Überschrift, die per
 * INLINE_KEYWORD_RULES erkannt werden (z.B. ein Satz über die Firma
 * mitten in der Stellenbeschreibung), werden ebenfalls ins passende
 * Zielfeld übernommen.
 * Ignore-Lines (Werbe-/Rausch-Zeilen) werden vor der Zuordnung
 * entfernt, damit sie in keinem Abschnitt landen.
 */
export class SectionParser {

    constructor(definitions = SECTION_DEFINITIONS, ignoreMarkers = IGNORE_LINE_MARKERS, inlineRules = INLINE_KEYWORD_RULES) {
        this.definitions = definitions;
        this.ignoreMarkers = ignoreMarkers;
        this.inlineRules = inlineRules;
    }

    parse(text) {
        const lines = toLines(text).filter(line => !isIgnoredLine(line, this.ignoreMarkers));
        const headings = this.findHeadings(lines);

        const sections = {};
        const consumed = new Set();

        for (let i = 0; i < headings.length; i++) {
            const current = headings[i];
            const next = headings[i + 1];
            const start = current.index + 1;
            const end = next ? next.index : lines.length;

            for (let index = current.index; index < end; index++) consumed.add(index);

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

        this.applyInlineKeywordRules(lines, consumed, sections);

        return sections;
    }

    // Sätze außerhalb jedes Überschriften-Blocks, die auf eine der
    // INLINE_KEYWORD_RULES passen, werden zusätzlich ins Zielfeld
    // übernommen - z.B. ein Satz über ein Familienunternehmen mitten
    // in der Stellenbeschreibung, ohne eigene Überschrift.
    applyInlineKeywordRules(lines, consumed, sections) {
        lines.forEach((line, index) => {
            if (consumed.has(index)) return;

            const lower = line.toLowerCase();
            const rule = this.inlineRules.find(({ anyOf }) =>
                anyOf.some(term => lower.includes(term))
            );
            if (!rule) return;

            sections[rule.target] = sections[rule.target]
                ? `${sections[rule.target]}\n${line}`
                : line;
        });
    }

    findHeadings(lines) {
        const found = [];

        lines.forEach((line, index) => {
            const normalized = this.normalizeHeading(line);
            const match = this.matchDefinition(normalized);

            if (match) {
                found.push({
                    name: match.definition.name,
                    index,
                    title: line,
                    inline: this.extractInlineContent(line, match.matchedGroup)
                });
            }
        });

        return found;
    }

    matchDefinition(normalizedLine) {
        for (const definition of this.definitions) {
            if (this.matchesTitles(normalizedLine, definition.titles)) {
                return { definition, matchedGroup: null };
            }
            const matchedGroup = this.findMatchingGroup(normalizedLine, definition.allOf);
            if (matchedGroup) {
                return { definition, matchedGroup };
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
    findMatchingGroup(normalizedLine, groups = [], maxHeadingWords = 6) {
        if (normalizedLine.split(/\s+/).length > maxHeadingWords) return null;
        return groups.find(group => group.every(term => normalizedLine.includes(term))) || null;
    }

    // c) Inhalt, der in derselben Zeile nach einem Doppelpunkt steht,
    // z.B. "Wofür wir stehen: Nachhaltigkeit - soziale Verantwortung"
    // -> "Nachhaltigkeit - soziale Verantwortung".
    // Ohne Doppelpunkt (z.B. "Deine Ansprechpartnerin Emma Helling" -
    // Überschrift und Name auf derselben Zeile, oft bei <span>-Layouts
    // ohne Block-Trennung): der Rest nach dem letzten erkannten
    // UND-Schlüsselwort wird stattdessen übernommen.
    extractInlineContent(line, matchedGroup) {
        const colonIndex = line.indexOf(":");
        if (colonIndex !== -1) {
            const afterColon = line.slice(colonIndex + 1).trim();
            if (afterColon) return afterColon;
        }

        if (matchedGroup) {
            const lower = line.toLowerCase();
            const cutIndex = Math.max(...matchedGroup.map(term => {
                const at = lower.lastIndexOf(term);
                return at === -1 ? -1 : at + term.length;
            }));

            if (cutIndex > -1) {
                // Rest-Buchstaben einer Geschlechts-Endung (z.B. "...in")
                // und Satzzeichen/Leerraum vor dem eigentlichen Inhalt entfernen.
                const rest = line.slice(cutIndex).replace(/^[a-zäöüß]*[:.,\-–\s]*/i, "").trim();
                if (rest) return rest;
            }
        }

        return "";
    }

    normalizeHeading(value) {
        return value
            .toLowerCase()
            .replace(/[.:!?]/g, "")
            .trim();
    }
}
