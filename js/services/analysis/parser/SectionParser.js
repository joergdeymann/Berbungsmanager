import { LineParser } from "./LineParser.js";
import { SectionPart } from "./SectionPart.js";
export class SectionParser {

    // Überschriften mit mehr Wörtern als das werden nicht mehr als
    // allOf-Kandidat behandelt, damit ein Fließtext-Satz, der zufällig
    // alle Begriffe einer Gruppe enthält, nicht fälschlich als eigene
    // Überschrift erkannt wird.
    static MAX_HEADING_WORDS = 6;

    constructor(sectionDefinitions) {
        this.linecount = 0;

        this.definitions = sectionDefinitions.map(section => ({
            name: section.name,
            titles: section.titles.map(title =>
                title.toLowerCase()
            ),
            allOf: (section.allOf || []).map(group =>
                group.map(term => term.toLowerCase())
            )
        }));

        this.currentSection = "rubbish";
        this.sections = {};
    }

    addLine(line) {
        this.linecount++;
        const foundSection = this.findSection(line);

        if (foundSection) {

            this.currentSection = foundSection;

            if (!this.sections[foundSection]) {
                this.sections[foundSection] =
                    new SectionPart(foundSection);
            }

            this.sections[foundSection].addHeadline(line,this.linecount);

            return;
        }

        if (this.currentSection === "rubbish") {
            return;
        }

        const section = this.sections[this.currentSection];

        const parser = new LineParser(line);

        section.addTags(parser.getTags());
        section.addLine(line);
    }

    findSection(line) {

        const lowerLine = line.toLowerCase();

        const found = this.definitions.find(section =>
            this.matchesTitles(lowerLine, section.titles) ||
            this.matchesAllOf(lowerLine, section.allOf)
        );

        return found?.name ?? null;
    }

    // exakter Treffer oder Überschrift beginnt mit dem Suchbegriff
    matchesTitles(lowerLine, titles) {
        return titles.some(title =>
            lowerLine.startsWith(title)
        );
    }

    // alle Begriffe einer Gruppe müssen in der Überschrift vorkommen
    // (UND-Verknüpfung), z.B. ["erforderlich", "qualifikation"].
    // Nur auf kurze, überschriftenartige Zeilen anwenden.
    matchesAllOf(lowerLine, groups) {
        if (!groups.length) return false;
        if (lowerLine.split(/\s+/).length > SectionParser.MAX_HEADING_WORDS) return false;

        return groups.some(group =>
            group.every(term => lowerLine.includes(term))
        );
    }

    addLines(lines) {           
        for (const line of lines) {
            this.addLine(line);
        }
    }

    parse(lines) {
        this.addLines(lines);
        return this.sections;
    }

    getSections() {
        return this.sections;
    }

}