import { LineParser } from "./LineParser.js";
import { SectionPart } from "./SectionPart.js";

export class SectionParser {

    // Überschriften mit mehr Wörtern als das werden nicht mehr als
    // allOf-Kandidat behandelt.
    static MAX_HEADING_WORDS = 6;

    constructor(sectionHeaders) {
        this.linecount = 0;
        this.currentSectionName = "rubbish";
        this.sections = {};

        this.sectionDefinitions = sectionHeaders.map(section => ({
            name: section.name,
            titles: section.titles.map(title =>
                title.toLowerCase()
            ),
            allOf: (section.allOf || []).map(group =>
                group.map(term => term.toLowerCase())
            )
        }));
    }

    addLine(line) {
        this.linecount++;

        const sectionName = this.findSection(line);

        if (sectionName) {
            this.startSection(sectionName, line);
            return;
        }

        this.addContentLine(line);
    }

    startSection(sectionName, line) {
        this.currentSectionName = sectionName;

        if (!this.sections[sectionName]) {
            this.sections[sectionName] =
                new SectionPart(sectionName);
        }

        this.sections[sectionName].addHeadline(
            line,
            this.linecount
        );
    }

    addContentLine(line) {
        if (this.currentSectionName === "rubbish") {
            return;
        }

        const section = this.sections[this.currentSectionName];
        const parser = new LineParser(line);

        section.addTags(parser.getTags());
        section.addLine(line);
    }

    findSection(line) {
        const lowerLine = line.toLowerCase();

        for (const sectionDefinition of this.sectionDefinitions) {
            if (
                this.matchesTitles(
                    lowerLine,
                    sectionDefinition.titles
                ) ||
                this.matchesAllOf(
                    lowerLine,
                    sectionDefinition.allOf
                )
            ) {
                return sectionDefinition.name;
            }
        }

        return null;
    }

    // Exakter Treffer oder Überschrift beginnt mit dem Suchbegriff.
    matchesTitles(lowerLine, titles) {
        return titles.some(title =>
            lowerLine.startsWith(title)
        );
    }

    // Alle Begriffe einer Gruppe müssen vorkommen.
    matchesAllOf(lowerLine, groups) {
        if (!groups.length) {
            return false;
        }

        const wordCount = lowerLine.split(/\s+/).length;

        if (wordCount > SectionParser.MAX_HEADING_WORDS) {
            return false;
        }

        return groups.some(group =>
            group.every(term =>
                lowerLine.includes(term)
            )
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