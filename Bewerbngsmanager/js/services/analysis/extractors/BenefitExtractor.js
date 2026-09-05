export class BenefitExtractor {

    extract(text) {

        if (!text) {
            return [];
        }

        const lines = text
            .split("\n")
            .map(line => line.trim())
            .filter(Boolean);

        return [
            ...new Set(
                lines
                    .map(line =>
                        line
                            .replace(/^[•●✓✔\-–—]\s*/g, "")
                            .trim()
                    )
                    .filter(Boolean)
            )
        ];
    }
}