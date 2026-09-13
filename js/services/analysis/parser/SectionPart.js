export class SectionPart {

    constructor(name) {
        this.name = name;

        this.originalHeadlines = [];
        this.tags = [];
        this.lines = [];

        // weitere Ergebnisse
    }

    addHeadline(line,linePosition) {
        this.originalHeadlines.push(line + ` ${linePosition}`);
    }

    addLine(line) {
        this.lines.push(line);
    }

    addTags(tags) {
        this.tags = [...new Set([...this.tags, ...tags])];
    }
}