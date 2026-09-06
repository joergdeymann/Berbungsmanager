import { QUALIFICATION_SUBFILTERS } from "../ParserConfig.js";
import { stripBulletPrefix, uniqueSimilar } from "../TextCleanup.js";

/*
 * QualificationExtractor
 * -----------------------
 * Sortiert den rohen "qualifications"-Block zeilenweise anhand von
 * ParserConfig.QUALIFICATION_SUBFILTERS ein (g: Zwischenüberschrift/
 * Inhalt wird weiter gefiltert). Ausgabefelder bleiben bewusst
 * required/preferred/personal, da RequirementsTab.js diese Namen
 * erwartet - fachlich entspricht das expectedQualification /
 * wishedQualification / personalQualification.
 */
export class QualificationExtractor {

    constructor(subFilters = QUALIFICATION_SUBFILTERS) {
        this.subFilters = subFilters;
    }

    extract(text) {
        const lines = (text || "")
            .split("\n")
            .map(line => line.trim())
            .filter(Boolean);

        const result = { required: [], preferred: [], personal: [] };

        for (const line of lines) {
            const value = stripBulletPrefix(line).replace(/^\?\s*/, "");
            if (!value) continue;

            const target = this.matchTarget(value.toLowerCase());
            result[target].push(value);
        }

        return {
            required: uniqueSimilar(result.required),
            preferred: uniqueSimilar(result.preferred),
            personal: uniqueSimilar(result.personal)
        };
    }

    matchTarget(lowerLine) {
        const rule = this.subFilters.find(({ anyOf }) =>
            anyOf.some(term => lowerLine.includes(term))
        );
        return rule ? rule.target : "required";
    }
}
