import { WebConstants } from "../../../constants/WebConstants.js";
import { CompanyConstants } from "../../../constants/CompanyConstants.js";

export class CompanyExtractor {
    constructor(lines) {
        this.lines = lines;
        // this.suffixRegex = /\b(gmbh|ohg|kg|ag|ug|gbr|ltd|inc|ek)\b/i;
    }

    // extractCompany() {
    //     return {
    //         CompanyName: this.extractCompanyName(),
    //         Adressse: this.extractAddress(),
    //         Email: this.extractEmail(),
    //         Telefon: this.extractPhone(),
    //         Website: this.extractWebsite(),
    //     }
    // }

    extractCompanyName() {
        return this.extractBySuffix() ?? this.extractByContextPattern() ?? this.extractByHeader() ?? this.extractByFrequency() ;
    }

    extrtactPhoner() {
        const email = this.text.match(/[\w.+-]+@([\w-]+)\.[a-z]{2,}/i);
        const domainName = email?.[1];
        if (!domainName) return "";

    }

    extractDomain() {
        const domains = (text.match(WebConstants.DOMAIN_REGEX) ?? [])
        .map(domain =>
            domain
                .replace(/^https?:\/\//i, "")
                .replace(/^www\./i, "")
        );
        // try to match nearest to company name later
        this.data.domain = domains[0];
    }




    extractBySuffix() {
        for (const line of this.lines) {
            const match = line.match(CompanyConstants.COMPANY_TYPE_PATTERN);
            if (match) {
                const name = this.extractNameBeforeSuffix(line, match);
                if (name) return name;
            }
        }
        return null;
    }

    extractByHeader() {
        for (let i = 0; i < this.lines.length; i++) {
            const headerMatch = this.lines[i].match(CompanyConstants.COMPANY_HEADER_REGEX);
            if (!headerMatch) continue;

            const inline = headerMatch[2].trim();
            if (inline && !this.isPhoneOrEmail(inline)) {
                return inline;
            }

            const rangeEnd = Math.min(this.lines.length, i + 1 + 5);
            for (let j = i + 1; j < rangeEnd; j++) {
                const candidate = this.lines[j].trim();
                if (!candidate || this.isPhoneOrEmail(candidate)) continue;
                return candidate;
            }
        }
        return null;
    }

    extractByFrequency() {
        const counts = new Map();

        for (const line of this.lines) {
            const words = line.match(CompanyConstants.WORD_TOKEN_REGEX) || [];

            for (const word of words) {
                const lower = word.toLowerCase();
                if (CompanyConstants.COMMON_WORDS.has(lower)) continue;
                if (word === word.toUpperCase()) continue;

                const entry = counts.get(lower);
                if (entry) {
                    entry.count++;
                } else {
                    counts.set(lower, { count: 1, original: word });
                }
            }
        }

        let best = null;
        for (const entry of counts.values()) {
            if (entry.count < 2) continue;
            if (!best || entry.count > best.count) {
                best = entry;
            }
        }

        return best ? best.original : null;
    }

    isPhoneOrEmail(text) {
        return CompanyConstants.PHONE_PATTERN.test(text) || CompanyConstants.EMAIL_PATTERN.test(text);
    }

    extractNameBeforeSuffix(line, suffixMatch) {
        const before = line.slice(0, suffixMatch.index).trim();
        const tokens = before.split(/\s+/);
        const nameTokens = [];

        for (let k = tokens.length - 1; k >= 0; k--) {
            const token = tokens[k];
            const isCapitalized = CompanyConstants.NAME_TOKEN_REGEX.test(token);
            const isConnector = CompanyConstants.NAME_CONNECTOR_WORDS.has(token.toLowerCase());

            if (isCapitalized || isConnector) {
                nameTokens.unshift(token);
            } else {
                break;
            }
        }

        if (nameTokens.length === 0) return null;
        return `${nameTokens.join(' ')} ${suffixMatch[0]}`.trim();
    }

    extractByContextPattern() {
        const MAX_GAP = 5;

        for (const line of this.lines) {
            const words = line.match(CompanyConstants.WORD_TOKEN_REGEX) || [];

            for (let i = 0; i < words.length; i++) {
                const candidate = words[i];
                const lowerCandidate = candidate.toLowerCase();
                if (CompanyConstants.COMMON_WORDS.has(lowerCandidate)) continue;
                if (CompanyConstants.ARTICLE_WORDS.has(lowerCandidate)) continue;

                let articleFound = false;
                const windowEnd = Math.min(i + MAX_GAP, words.length - 1);

                for (let j = i + 1; j <= windowEnd; j++) {
                    const w = words[j].toLowerCase();

                    if (!articleFound && CompanyConstants.ARTICLE_WORDS.has(w)) {
                        articleFound = true;
                        continue;
                    }

                    if (articleFound) {
                        const isCompanyKeyword = CompanyConstants.COMPANY_TYPE_KEYWORDS
                            .some(keyword => w.includes(keyword));
                        if (isCompanyKeyword) {
                            return candidate;
                        }
                    }
                }
            }
        }
        return null;
    }    
}