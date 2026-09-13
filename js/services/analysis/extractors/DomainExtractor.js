import { WebConstants } from "../../../constants/WebConstants.js";
import { EmailExtractor } from "./EmailExtractor.js";
export class DomainExtractor {
    constructor(lines) {
        this.lines = lines;
    }

    extractDomain() {
        const emailDomain = this.extractRawEmailDomain();       // ungefiltert
        const frequencyDomain = this.extractByFrequency(!emailDomain); // Ignore-Liste nur ohne E-Mail-Treffer

        // beide gefunden und identisch -> höchste Sicherheit
        if (emailDomain && frequencyDomain && emailDomain === frequencyDomain) {
            return { domain: emailDomain, confidence: 'high' };
        }

        // E-Mail-Domain hat Priorität, wenn vorhanden
        if (emailDomain) {
            return { domain: emailDomain, confidence: 'medium' };
        }

        // sonst Häufigkeits-Fallback (hier greift die Ignore-Liste)
        if (frequencyDomain) {
            return { domain: frequencyDomain, confidence: 'medium' };
        }

        return null;
    }

    // liefert die rohe Domain aus der E-Mail, OHNE Ignore-Liste zu prüfen
    extractRawEmailDomain() {
        const emailExtractor = new EmailExtractor(this.lines);
        const email = emailExtractor.extractFirstEmail();
        if (!email) return null;

        return email.split('@')[1]?.toLowerCase() ?? null;
    }

    // applyIgnoreList: nur filtern, wenn keine E-Mail-Domain als Referenz existiert
    extractByFrequency(applyIgnoreList) {
        const regex = new RegExp(WebConstants.DOMAIN_REGEX.source, WebConstants.DOMAIN_REGEX.flags);
        const counts = new Map();

        for (const line of this.lines) {
            regex.lastIndex = 0;
            let match;
            while ((match = regex.exec(line)) !== null) {
                const domain = match[1].toLowerCase();
                if (applyIgnoreList && WebConstants.DOMAIN_IGNORE_LIST.has(domain)) continue;

                counts.set(domain, (counts.get(domain) ?? 0) + 1);
                if (match[0].length === 0) regex.lastIndex++;
            }
        }

        let best = null;
        let bestCount = 0;
        for (const [domain, count] of counts) {
            if (count > bestCount) {
                best = domain;
                bestCount = count;
            }
        }

        return best;
    }
}