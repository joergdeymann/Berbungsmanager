import { ApplicationParser } from "../analysis/ApplicationParser.js";

export class ImportToApplicationDTO {
    static convert(application, parser = new ApplicationParser()) {
        for (const source of application.sources) {
            parser.add(source.sourceCode);
        }

        const result = parser.parse();

        this.applyCompany(application, result.company);
        this.applyJob(application, result.job);
        this.applyContact(application, result.company);
        this.applyJobRawSections(application, result);

        return application;
    }

    static applyCompany(application, company) {
        const hauptsitz = application.companies[0];

        if (company.name) hauptsitz.name = company.name;
        if (company.domain?.name) hauptsitz.website = `https://${company.domain.name}`;

        if (company.street?.name) {
            hauptsitz.address.street = company.street.name;
            hauptsitz.address.houseNumber = company.street.houseNumber;
        }

        if (company.location) {
            hauptsitz.address.zip = company.location.zip ?? hauptsitz.address.zip;
            hauptsitz.address.city = company.location.city ?? hauptsitz.address.city;
            hauptsitz.address.postcodeCountry = company.location.country ?? hauptsitz.address.postcodeCountry;
        }

        if (company.postbox) hauptsitz.address.poBox = company.postbox;

        if (application.job.companyId == null) {
            application.job.companyId = 0;
        }
    }

    static applyJob(application, job) {
        if (job.salary) application.job.salary = job.salary;
        if (job.vacationPay) application.job.vacationPay = job.vacationPay;
        if (job.christmasPay) application.job.christmasPay = job.christmasPay;
    }

    static applyContact(application, company) {
        if (!company.phone && !company.email) return;

        let contact = application.contacts[0];
        if (!contact) {
            contact = { id: 0, role: "Allgemein", name: "", img: "", phone: "", email: "" };
            application.contacts.push(contact);
        }

        if (company.phone) contact.phone = company.phone;
        if (company.email) contact.email = company.email;

        if (application.job.contactId == null) {
            application.job.contactId = contact.id;
        }
    }

    static applyJobRawSections(application, result) {
        const tasks = result.sections["tasks"]?.lines;
        if (tasks?.length) application.job.tasks = tasks;
    }
}