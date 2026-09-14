import { ParserConstants } from "../../../constants/ParserConstants.js";

export class BenefitExtractor {

    constructor(lines, benefitTags = ParserConstants.BENEFIT_TAGS) {
        this.lines = lines;
        this.benefitTags = benefitTags;
    }

    extractBenefits() {
        const text = this.lines.join(" ").toLowerCase();

        const tags = this.benefitTags
            .filter(benefit => this.containsKeyword(text, benefit.term))
            .map(benefit => benefit.label);

        return {
            tags: [...new Set(tags)],
            content: this.lines
        };
    }

    containsKeyword(text, keyword) {
        const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return new RegExp(`(^|[^a-z0-9+#])${escaped}($|[^a-z0-9+#])`, "i").test(text);
    }
}