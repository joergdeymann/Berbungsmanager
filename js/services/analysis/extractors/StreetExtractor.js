import { CompanyConstants } from "../../../constants/CompanyConstants.js";
import { AddressConstants } from "../../../constants/AddressConstants.js";

export class StreetExtractor {
    constructor(lines) {
        this.lines = lines;
    }

    extractStreet() {
        const anchorIndex = this.findAnchorIndex();

        return (
            this.searchWithinRadius(anchorIndex, 5) ??
            this.searchWithinRadius(anchorIndex, 10) ??
            this.searchAllLines() ?? 
            this.emptyData()
        );
    }

    emptyData() {
        return { name: "", houseNumber: "" };
    }

    // findet die erste Zeile mit E-Mail, Telefonnummer oder Firmen-Überschrift
    findAnchorIndex() {
        for (let i = 0; i < this.lines.length; i++) {
            const line = this.lines[i];
            if (
                CompanyConstants.EMAIL_PATTERN.test(line) ||
                CompanyConstants.PHONE_PATTERN.test(line) ||
                CompanyConstants.COMPANY_HEADER_REGEX.test(line)
            ) {
                return i;
            }
        }
        return null;
    }

    searchWithinRadius(anchorIndex, radius) {
        if (anchorIndex === null) return null;

        const start = Math.max(0, anchorIndex - radius);
        const end = Math.min(this.lines.length, anchorIndex + radius + 1);

        return this.searchLines(this.lines.slice(start, end));
    }

    searchAllLines() {
        return this.searchLines(this.lines);
    }

    searchLines(lines) {
        const regex = new RegExp(AddressConstants.STREET_REGEX.source, AddressConstants.STREET_REGEX.flags);

        for (const line of lines) {
            regex.lastIndex = 0; // stateful 'g'-Flag zurücksetzen
            const match = regex.exec(line);
            if (match) {
                // match[1] = Suffix-Variante ("Bahnhofstraße"), match[2] = Präpositions-Variante ("Am Bahnhof")
                const street = match[1] ?? match[2];
                const houseNumber = match[3];
                return {name: street, houseNumber: houseNumber};
            }
        }
        return null;
    }
}