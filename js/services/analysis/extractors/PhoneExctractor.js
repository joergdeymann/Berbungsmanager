import { CompanyConstants } from "../../../constants/CompanyConstants.js";
export class PhoneExtractor {
    constructor(lines) {
        this.lines = lines;
    }

    extractPhoneNumbers() {
        const regex = new RegExp(CompanyConstants.PHONE_PATTERN.source, 'g');

        const found = this.lines.flatMap(line =>
            [...line.matchAll(regex)].map(m => m[0].trim())
        );

        return [...new Set(found)];
    }

    extractFirstPhoneNumber() {
        return this.extractPhoneNumbers()[0] ?? null;
    }
}