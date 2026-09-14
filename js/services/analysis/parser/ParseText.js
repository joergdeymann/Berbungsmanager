import { ParserConstants } from "../../../constants/ParserConstants.js"
import { SectionParser } from "./SectionParser.js"
import { TextCleaner } from "./TextCleaner.js"
import { CompanyExtractor } from "../extractors/CompanyExtractor.js"
import { JobExtractor } from "../extractors/JobExtractor.js"
import { QualificationExtractor } from "../extractors/QualificationExtractor.js"
import { BenefitExtractor } from "../extractors/BenefitExtractor.js"

export class ParseText {
    constructor(text) {
        this.lines = [];
        this.text = '';

        this.add(text);
    }

    add(text) {
        if (!text) return;
        this.lines.push(...new TextCleaner(text).lines);
        this.text += text;
    }

    parse() {
        const sectionParser = new SectionParser(ParserConstants.SECTION_HEADLINES);
        const sections = sectionParser.parse(this.lines);

        const companyContent = sections["companyInformation"]?.lines??[];
        const contactContent = sections["contact"]?.lines??[];
        const closingContent = sections["signature"]?.lines??[];
        const addressContent = [...contactContent, ...closingContent, ...companyContent];

        return {
            sections: sections,
            company: new CompanyExtractor(addressContent).extractCompany(),
            job: new JobExtractor(addressContent).extractJob(),
            qualifications: new QualificationExtractor(sections["qualifications"]?.lines??[]).extractQualifications(),
            benefits: new BenefitExtractor(sections["benefits"]?.lines??[]).extractBenefits(),
        };
    }
}