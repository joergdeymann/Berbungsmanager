import { PostboxConstants } from "../../../constants/PostBoxConstants.js";

export class PostboxExtractor {
    constructor(lines) {
        this.lines = lines;
    }

    extractPostbox() {
        const regex = new RegExp(PostboxConstants.POSTBOX_REGEX.source, PostboxConstants.POSTBOX_REGEX.flags);

        for (const line of this.lines) {
            regex.lastIndex = 0; // 'g'-Flag ist stateful, pro Zeile zurücksetzen
            const match = regex.exec(line);
            if (match) {
                return match[1].replace(/\s+/g, ' ').trim();
            }
        }
        return null;
    }

    extractAllPostboxes() {
        const regex = new RegExp(PostboxConstants.POSTBOX_REGEX.source, PostboxConstants.POSTBOX_REGEX.flags);
        const found = [];

        for (const line of this.lines) {
            regex.lastIndex = 0;
            let match;
            while ((match = regex.exec(line)) !== null) {
                found.push(match[1].replace(/\s+/g, ' ').trim());
                if (match[0].length === 0) regex.lastIndex++;
            }
        }

        return [...new Set(found)];
    }
}