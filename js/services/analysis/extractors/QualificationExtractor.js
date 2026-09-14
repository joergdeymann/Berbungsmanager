import { ParserConstants } from "../../../constants/ParserConstants.js";
import { LineParser } from "../parser/LineParser.js";

export class QualificationExtractor {

    constructor(lines, subFilters = ParserConstants.QUALIFICATION_SUBFILTERS) {
        this.lines = lines;
        this.subFilters = subFilters;
    }

    extractQualifications() {
        const result = {
            required: { tags: [], content: [] },
            preferred: { tags: [], content: [] },
            personal: { tags: [], content: [] }
        };

        for (const line of this.lines) {
            const target = this.matchTarget(line.toLowerCase());
            result[target].content.push(line);

            const tags = new LineParser(line).getTags();
            result[target].tags = [...new Set([...result[target].tags, ...tags])];
        }

        return result;
    }

    matchTarget(lowerLine) {
        const rule = this.subFilters.find(({ anyOf }) =>
            anyOf.some(term => lowerLine.includes(term))
        );
        return rule ? rule.target : "required";
    }
}