import { ApplicationParser } from "../analysis/ApplicationParser.js";

/*
 * Rohdaten (application.sources[]) -> Application-JSON.
 * Führt alle sources[].sourceCode zusammen, lässt sie gemeinsam vom
 * ApplicationParser analysieren und merged das Ergebnis in die
 * bestehende Application-Struktur (überschreibt nicht alles).
 *
 * Aktuell werden nur die firmen-/kontaktbezogenen Felder befüllt
 * (companyName/Adresse/Domain/Telefon/E-Mail) - tasks/qualifications
 * kommen vorerst nur als Rohzeilen mit, weil TaskExtractor/
 * QualificationExtractor/BenefitExtractor noch nicht an die neue
 * parser/-Pipeline angebunden sind (siehe ApplicationAnalyzer alt).
 */
export class ImportToApplicationDTO {
    static convert(application, parser = new ApplicationParser()) {
        for (const source of application.sources) {
            parser.add(source.sourceCode);
        }

        const result = parser.parse();

        this.applyCompany(application, result);
        this.applyContact(application, result);
        this.applyJobRawSections(application, result);

        return application;
    }

    // companies[0] ist per Konvention immer der Hauptsitz. Ohne
    // erkannte Zuordnung landen alle gefundenen Firmendaten dort.
    static applyCompany(application, result) {
        const hauptsitz = application.job.companies[0];

        if (result.companyName) hauptsitz.name = result.companyName;

        if (result.domain?.domain) {
            hauptsitz.website = `https://${result.domain.domain}`;
        }

        if (result.address?.street) {
            hauptsitz.address.street = result.address.street;
            hauptsitz.address.houseNumber = result.address.houseNumber;
        }

        if (result.location) {
            hauptsitz.address.postcode = result.location.zip ?? hauptsitz.address.postcode;
            hauptsitz.address.postcodeCountry = result.location.country ?? hauptsitz.address.postcodeCountry;
        }

        if (result.postbox) {
            hauptsitz.address.poBox = result.postbox;
        }

        // Arbeitsort ohne eigene Adresse = automatisch Hauptsitz
        if (application.job.workAddressId == null) {
            application.job.workAddressId = 0;
        }
    }

    // Noch keine Namens-Erkennung in der neuen Pipeline (die alte
    // ApplicationAnalyzer.extractContactFromSection() ist nicht
    // portiert) - Telefon/E-Mail landen deshalb vorerst auf einem
    // generischen "Allgemein"-Kontakt statt auf einer Person.
    static applyContact(application, result) {
        if (!result.phone && !result.email) return;

        let contact = application.contacts[0];
        if (!contact) {
            contact = { id: 0, relation: "Allgemein", name: "", img: "", phone: "", email: "" };
            application.contacts.push(contact);
        }

        if (result.phone) contact.phone = result.phone;
        if (result.email) contact.email = result.email;
    }

    // Platzhalter, bis TaskExtractor/QualificationExtractor/BenefitExtractor
    // an die neue Pipeline angebunden sind - Rohzeilen statt Struktur.
    static applyJobRawSections(application, result) {
        const tasks = result.sections["tasks"]?.lines;
        if (tasks?.length) application.job.tasks = tasks;
    }
}