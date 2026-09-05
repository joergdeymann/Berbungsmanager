export class QualificationExtractor {

    extract(text) {

        const lines =
            text
                .split("\n")
                .map(line => line.trim())
                .filter(Boolean);

        const result = {

            required: [],

            preferred: [],

            personal: []
        };

        for (const line of lines) {

            const value =
                this.clean(line);

            const lower =
                value.toLowerCase();

            if (!value) {
                continue;
            }


            /*
             * Wunsch-Anforderungen
             */

            if (
                lower.includes("idealerweise") ||
                lower.includes("wünschenswert") ||
                lower.includes("von vorteil") ||
                lower.includes("nice to have")
            ) {

                result.preferred.push(value);

                continue;
            }


            /*
             * Persönliche Eigenschaften
             */

            if (
                lower.includes("zuverlässig") ||
                lower.includes("strukturiert") ||
                lower.includes("teamfähig") ||
                lower.includes("kommunikations") ||
                lower.includes("interesse") ||
                lower.includes("eigenständig") ||
                lower.includes("motiviert")
            ) {

                result.personal.push(value);

                continue;
            }


            /*
             * Standardmäßig
             * → fachliche Anforderung
             */

            result.required.push(value);
        }


        return {

            required:
                this.unique(result.required),

            preferred:
                this.unique(result.preferred),

            personal:
                this.unique(result.personal)
        };
    }


    clean(value) {

        return value
            .replace(/^[✓✔•●\-–—]\s*/g, "")
            .replace(/^\?\s*/g, "")
            .trim();
    }


    unique(values) {

        return [
            ...new Set(values)
        ];
    }
}