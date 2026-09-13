import { ParserConstants } from "../../../constants/ParserConstants.js";
import { CompanyConstants } from "../../../constants/CompanyConstants.js";
export class LineParser {
    // Patterns bleiben statisch: teuer zu bauen, ändern sich nie pro Zeile
    static TAG_PATTERNS = (() => {
        const escapeRegExp = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        return Object.values(ParserConstants.TAGS)
            .flatMap(tags => tags.map(tag => tag.toLowerCase()))
            .map(tag => [
                tag,
                new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(tag)}(?![\\p{L}\\p{N}])`, 'u')
            ]);
    })();


    constructor(line) {
        this.line = line;
        this.lineLower = line.toLowerCase(); // einmal berechnet, mehrfach genutzt
    }

    getTags() {
        return [...new Set(
            LineParser.TAG_PATTERNS
                .filter(([, pattern]) => pattern.test(this.lineLower))
                .map(([tag]) => tag)
        )];
    }

    getPhoneNumbers() {
        return [...this.line.matchAll(CompanyConstants.PHONE_PATTERN_G)].map(m => m[0].trim());
    }

    getEmails() {
        return [...this.line.matchAll(CompanyConstants.EMAIL_PATTERN_G)].map(m => m[0].trim());
    }
}