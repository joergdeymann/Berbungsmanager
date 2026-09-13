import { ParserConstants } from "../../../constants/ParserConstants.js"
import { SectionParser } from "./SectionParser.js"
import { TextCleaner } from "./TextCleaner.js"
import { CompanyExtractor } from "../extractors/CompanyExtractor.js"
import { PhoneExtractor } from "../extractors/PhoneExtractor.js"
import { EmailExtractor } from "../extractors/EmailExtractor.js"
import { AddressExtractor } from "../extractors/AddressExtractor.js"
import { LocationExtractor } from "../extractors/LocationExtractor.js"
import { DomainExtractor } from "../extractors/DomainExtractor.js"
import { PostBoxExtractor } from "../extractors/PostBoxExtractor.js"    

export class ParseText {
    constructor(text) {
        this.sectionParser = new SectionParser(ParserConstants.SECTION_HEADLINES, ParserConstants.TAGS);
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
        const sections = this.sectionParser.parse(this.lines);
        const companyContent = sections["companyInformation"]?.lines??[];
        const contactContent = sections["contact"]?.lines??[];
        const addressContent = [...companyContent, ...contactContent];

        return {
            sections: sections,
            companyName: new CompanyExtractor(addressContent).extractCompanyName(),
            phone: new PhoneExtractor(addressContent).extractFirstPhoneNumber(),
            email: new EmailExtractor(addressContent).extractFirstEmail(),
            address: new AddressExtractor(addressContent).extractAddress(),
            location: new LocationExtractor(addressContent).extractLocation(),
            domain: new DomainExtractor(addressContent).extractDomain(),
            postbox: new PostBoxExtractor(addressContent).extractPostbox(),
        };
    }
}