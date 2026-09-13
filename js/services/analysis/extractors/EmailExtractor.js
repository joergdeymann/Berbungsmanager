import { CompanyConstants } from "../../../constants/CompanyConstants.js";
export class EmailExtractor {
    constructor(lines) {
        this.lines = lines;
    }

    extractEmails() {
        // frisches Regex-Objekt mit 'g'-Flag pro Aufruf,
        // um Statefulness durch lastIndex zu vermeiden (siehe COMPANY_TYPE_REGEX-Problem)
        const regex = new RegExp(CompanyConstants.EMAIL_PATTERN.source, 'gi');

        const found = this.lines.flatMap(line =>
            [...line.matchAll(regex)].map(m => m[0])
        );

        return [...new Set(found)];
    }

    extractFirstEmail() {
        return this.extractEmails()[0] ?? "";
    }
}