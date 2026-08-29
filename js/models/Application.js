export class Application {
    constructor(data = {}) {
        this.id = data.id || crypto.randomUUID();

        /*
         * Firma
         */
        this.company = {
            name: data.company?.name || "",

            street: data.company?.street || "",
            zip: data.company?.zip || "",
            city: data.company?.city || "",
            country: data.company?.country || "",

            website: data.company?.website || "",
            verifiedAt: data.company?.verifiedAt || "",

            phones: data.company?.phones || [],

            emails: data.company?.emails || []
        };

        /*
         * Stelleninformationen
         */
        this.job = {
            title: data.job?.title || "",

            location: data.job?.location || "",

            employmentType:
                data.job?.employmentType || "",

            salary:
                data.job?.salary || "",

            referenceNumber:
                data.job?.referenceNumber || "",

            description:
                data.job?.description || "",

            workModel:
                data.job?.workModel ||
                data.remote ||
                "Unbekannt"
        };

        /*
         * Kontakte
         */
        this.contacts = data.contacts || [];

        /*
         * Bewerbung
         */
        this.application = {
            status:
                ({
                    Entwurf: "Nicht beworben",
                    "Nicht beworben": "Nicht beworben",
                    Beworben: "Beworben",
                    "Eingangsbestätigung": "Eingangsbestätigung",
                    "Rückruf erhalten": "Rückruf erhalten",
                    Angenommen: "Angenommen",
                    Abgelehnt: "Abgelehnt"
                })[data.application?.status] || "Nicht beworben",

            appliedAt:
                data.application?.appliedAt || "",

            method:
                data.application?.method || "",

            source:
                data.application?.source || "",

            jobUrl:
                data.application?.jobUrl || "",

            rejectionAt:
                data.application?.rejectionAt || ""
        };

        /*
         * Bewerbungsportal
         */
        this.portal = {
            url:
                data.portal?.url || "",

            username:
                data.portal?.username || "",

            password:
                data.portal?.password || ""
        };

        /*
         * Kommunikation
         */
        this.communication =
            data.communication || [];

        /*
         * Bewerbungsunterlagen
         */
        this.documents = {
            coverLetter: data.documents?.coverLetter || "",
            resume: data.documents?.resume || ""
        };

        /*
         * Anforderungen
         */
        this.qualifications = {
            required:
                data.qualifications?.required || [],

            preferred:
                data.qualifications?.preferred || [],

            personal:
                data.qualifications?.personal || []
        };

        /*
         * Technische Fähigkeiten
         */
        this.skills =
            data.skills || [];

        /*
         * Aufgaben
         */
        this.tasks =
            data.tasks || [];

        /*
         * Benefits
         */
        this.benefits =
            data.benefits || [];

        this.social = {
            benefits: data.social?.benefits || this.benefits,
            impact: data.social?.impact || [],
            focus: data.social?.focus || []
        };

        /*
         * Unternehmensinformationen
         *
         * Übernahme des alten Feldes
         * companyDescription
         */
        this.companyInformation = {
            description:
                data.companyInformation?.description ||
                data.companyDescription ||
                "",

            industry:
                data.companyInformation?.industry || "",

            size:
                data.companyInformation?.size || "",

            founded:
                data.companyInformation?.founded || "",

            verifiedAt:
                data.companyInformation?.verifiedAt ||
                data.company?.verifiedAt ||
                "",

            specialties:
                data.companyInformation?.specialties || []
        };

        /*
         * Quellen
         */
        this.sources = {
            jobPosting:
                data.sources?.jobPosting ||
                data.application?.jobUrl ||
                "",

            companyWebsite:
                data.sources?.companyWebsite ||
                data.company?.website ||
                "",

            importedUrls:
                data.sources?.importedUrls || []
        };

        /*
         * Sonstige Notizen
         */
        this.notes =
            data.notes || "";

        /*
         * Originaldaten
         */
        this.originalText =
            data.originalText || "";

        /*
         * Zeitstempel
         */
        this.createdAt =
            data.createdAt ||
            new Date().toISOString();

        this.updatedAt =
            data.updatedAt ||
            new Date().toISOString();
    }

    get remote() {
        return this.job.workModel;
    }

    set remote(value) {
        this.job.workModel = value;
    }

    // Backwards-compatible alias for older saved records and views.
    get companyDescription() {
        return this.companyInformation.description;
    }

    set companyDescription(value) {
        this.companyInformation.description = value || "";
    }
}