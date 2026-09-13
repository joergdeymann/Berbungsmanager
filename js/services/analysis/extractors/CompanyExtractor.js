import { CompanyNameExtractor } from "./CompanyNameExtractor.js"
import { PhoneExtractor } from "./PhoneExtractor.js"
import { EmailExtractor } from "./EmailExtractor.js"
import { StreetExtractor } from "./StreetExtractor.js"
import { LocationExtractor } from "./LocationExtractor.js"
import { DomainExtractor } from "./DomainExtractor.js"
import { PostBoxExtractor } from "./PostBoxExtractor.js"    

export class CompanyExtractor {
    constructor(lines) {
        this.lines = lines;
    }

    extractCompany() {
        return {
            name: new CompanyNameExtractor(this.lines).extractCompanyName(),
            phone: new PhoneExtractor(this.lines).extractFirstPhoneNumber(),
            email: new EmailExtractor(this.lines).extractFirstEmail(),
            street: new StreetExtractor(this.lines).extractStreet(),
            location: new LocationExtractor(this.lines).extractLocation(),
            domain: new DomainExtractor(this.lines).extractDomain(),
            postbox: new PostBoxExtractor(this.lines).extractPostbox(),
        }
    }
}