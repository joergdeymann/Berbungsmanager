import { stripBulletPrefix, uniqueSimilar } from "../TextCleanup.js";

export class BenefitExtractor {

    extract(text) {
        if (!text) return [];

        const lines = text
            .split("\n")
            .map(line => line.trim())
            .filter(Boolean);

        return uniqueSimilar(lines.map(stripBulletPrefix));
    }
}
