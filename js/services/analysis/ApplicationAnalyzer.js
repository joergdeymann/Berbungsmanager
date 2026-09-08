import { SectionParser } from "./SectionParser.js";
import { QualificationExtractor } from "./extractors/QualificationExtractor.js";
import { TaskExtractor } from "./extractors/TaskExtractor.js";
import { BenefitExtractor } from "./extractors/BenefitExtractor.js";
import { JobTextAnalyzer } from "../JobTextAnalyzer.js";

/*
 * Facade for all rule-based extraction.  The returned object is deliberately
 * stable so it can be stored, displayed, or passed to a later AI analyzer.
 */
export class ApplicationAnalyzer {
    constructor() {
        this.sectionParser = new SectionParser();
        this.qualificationExtractor = new QualificationExtractor();
        this.taskExtractor = new TaskExtractor();
        this.benefitExtractor = new BenefitExtractor();
        this.basicAnalyzer = new JobTextAnalyzer();
    }

    // Für den Import-Verlauf: welche Plattform/Quelle steckt hinter
    // einem einzelnen Text (LinkedIn, Indeed, ...)?
    detectSource(text) {
        return this.basicAnalyzer.detectSource(typeof text === "string" ? text : "");
    }

    analyze(text) {
        const originalText =
            typeof text === "string" ? text.trim() : "";
        const basic = this.basicAnalyzer.analyze(originalText);
        const sections = this.sectionParser.parse(originalText);
        const qualifications = this.qualificationExtractor.extract(
            sections.qualifications || ""
        );
        const sectionTasks = this.taskExtractor.extract(
            sections.tasks || ""
        );
        const sectionBenefits = this.benefitExtractor.extract(
            sections.benefits || ""
        );
        const hasSectionQualifications =
            qualifications.required.length ||
            qualifications.preferred.length ||
            qualifications.personal.length;
        const finalQualifications = hasSectionQualifications
            ? qualifications
            : basic.qualifications;

        const sectionContact = this.extractContactFromSection(sections.contact);
        const contact = sectionContact?.name ? sectionContact : basic.contact;

        return {
            analysisVersion: "1.1",
            companyName: basic.companyName,
            company: basic.company,
            contact,
            job: basic.job,
            source: basic.source,
            skills: basic.skills,
            benefits: sectionBenefits.length ? sectionBenefits : basic.benefits,
            tasks: sectionTasks.length ? sectionTasks : basic.tasks,
            phones: basic.company.phones,
            emails: basic.company.emails,
            qualifications: finalQualifications,
            companyInformation: {
                ...basic.companyInformation,
                description: sections.companyInformation || basic.companyInformation.description
            },
            social: basic.social,
            sections: {
                ...sections,
                source: basic.sections.source,
                removedNoise: basic.sections.removedNoise
            },
            originalText
        };
    }

    // Die "contact"-Sektion (Überschrift "Ansprechpartner(in)" +
    // folgende Zeilen, meist Name + Adresse) hat den Namen fast immer
    // in der ERSTEN Zeile - im Gegensatz zum Fließtext-Regex in
    // JobTextAnalyzer kommt das auch mit "Name\nAdresse" auf
    // getrennten Zeilen zurecht (statt Name + Satzzeichen in einer
    // Zeile).
    // Die "contact"-Sektion kann mehrere zusammengeführte Vorkommen
    // enthalten (z.B. eine allgemeine "Kontakt:"-Überschrift MIT viel
    // Fließtext, gefolgt vom eigentlichen "Ansprechpartnerin"-Block
    // weiter unten) - deshalb wird jede Zeile geprüft, nicht nur die
    // erste, damit ein langer Vorspann-Satz den echten Namen nicht
    // verdeckt. Eine Zeile zählt als Name, wenn sie NUR aus 2-3
    // großgeschriebenen Wörtern besteht (kein Satz mit Satzzeichen/
    // vielen Wörtern dazwischen).
    extractContactFromSection(block) {
        if (!block) return null;

        const lines = block.split("\n").map(line => line.trim()).filter(Boolean);

        for (const line of lines) {
            const nameMatch = line.match(
                /^(?:herrn?|frau)?\s*([A-ZÄÖÜ][a-zäöüß'-]+(?:\s+[A-ZÄÖÜ][a-zäöüß'-]+){1,2})$/i
            );
            if (nameMatch) {
                return { name: nameMatch[1], role: "Ansprechpartner Bewerbung" };
            }
        }

        return null;
    }
}
