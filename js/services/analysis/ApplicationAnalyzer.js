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

        return {
            analysisVersion: "1.1",
            companyName: basic.companyName,
            company: basic.company,
            contact: basic.contact,
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
                description: sections.company || basic.companyInformation.description
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
}