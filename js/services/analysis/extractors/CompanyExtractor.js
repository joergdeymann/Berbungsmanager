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
            name: new CompanyNameExtractor(addressContent).extractCompanyName(), //name
            phone: new PhoneExtractor(addressContent).extractFirstPhoneNumber(), //phone
            email: new EmailExtractor(addressContent).extractFirstEmail(),       //email
            street: new StreetExtractor(addressContent).extractStreet(),         //street.name, street.houseNumber
            location: new LocationExtractor(addressContent).extractLocation(),   //location.zip, location.country
            domain: new DomainExtractor(addressContent).extractDomain(),         //domain.name, domain.confidence
            postbox: new PostBoxExtractor(addressContent).extractPostbox(),      //postbox
        }
    }
}
