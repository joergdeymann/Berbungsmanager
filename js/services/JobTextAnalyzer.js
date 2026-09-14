import { ParseText } from "./analysis/parser/ParseText.js";
export class JobTextAnalyzer {
  constructor() {
  }

  analyze(text) {
    const parseText = new ParseText(text);
    const sections = parseText.parse();
    // const dataset = DTO_Import.toDataset(sections);
    // DTO_Application.FromDataset(dataset);
  }
}
