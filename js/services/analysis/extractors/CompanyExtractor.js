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
            name: new CompanyNameExtractor(this.lines).extractCompanyName(), //name
            phone: new PhoneExtractor(this.lines).extractFirstPhoneNumber(), //phone
            email: new EmailExtractor(this.lines).extractFirstEmail(),       //email
            street: new StreetExtractor(this.lines).extractStreet(),         //street.name, street.houseNumber
            location: new LocationExtractor(this.lines).extractLocation(),   //location.zip, location.country
            domain: new DomainExtractor(this.lines).extractDomain(),         //domain.name, domain.confidence
            postbox: new PostBoxExtractor(this.lines).extractPostbox(),      //postbox
        }
    }
}
