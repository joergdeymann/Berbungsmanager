import { ParseText } from "./parser/ParseText.js";

export class ApplicationParser {
    constructor() {
        this.parseText = new ParseText("");
    }

    add(text) {
        this.parseText.add(text);
    }

    parse() {
        return this.parseText.parse();
    }
}