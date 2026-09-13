import { LocationConstants } from "../../../constants/LocationConstants.js";
export class LocationExtractor {
    constructor(lines) {
        this.lines = lines;
    }

    extractLocation() {
        return this.extractByZipCity() ?? this.extractByKeyword();
    }

    // Stufe 1: PLZ + Ort (härtestes, eindeutigstes Muster)
    extractByZipCity() {
        const regex = new RegExp(LocationConstants.ZIP_CITY_REGEX.source, LocationConstants.ZIP_CITY_REGEX.flags);

        for (const line of this.lines) {
            regex.lastIndex = 0;
            const match = regex.exec(line);
            if (match) {
                const rawCountry = match[1];
                const country = rawCountry && LocationConstants.COUNTRY_CODES.has(rawCountry)
                    ? rawCountry
                    : LocationConstants.DEFAULT_COUNTRY;

                return { country:country, zip: match[2], city: match[3].trim() };
            }
        }
        return null;
    }

    // Stufe 2: Fallback über Signalwörter, ohne PLZ
    extractByKeyword() {
        for (const line of this.lines) {
            const keywordMatch = line.match(LocationConstants.LOCATION_KEYWORDS_REGEX);
            if (!keywordMatch) continue;

            const rest = line.slice(keywordMatch.index + keywordMatch[0].length);
            const cityMatch = rest.match(LocationConstants.CITY_NAME_REGEX);
            if (cityMatch) {
                return { country:LocationConstants.DEFAULT_COUNTRY,zip: null, city: cityMatch[0].trim() };
            }
        }
        return null;
    }
    

}