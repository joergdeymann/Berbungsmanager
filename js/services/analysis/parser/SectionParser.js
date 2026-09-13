import { LineParser } from "./LineParser.js";
import { SectionPart } from "./SectionPart.js";
export class SectionParser {

    constructor(sectionDefinitions, tags) {
        this.linecount = 0;
        this.TAGS = tags;

        this.definitions = sectionDefinitions.map(section => ({
            name: section.name,
            titles: section.titles.map(title =>
                title.toLowerCase()
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
            section.titles.some(title =>
                lowerLine.startsWith(title)
            )
        );

        return found?.name ?? null;
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