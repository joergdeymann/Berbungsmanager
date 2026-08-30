import { CompanyTemplate } from "../templates/detail/CompanyTemplate.js";
import { ContactTemplate } from "../templates/detail/ContactTemplate.js";
import { JobTemplate } from "../templates/detail/JobTemplate.js";
import { RequirementsTemplate } from "../templates/detail/RequirementsTemplate.js";
import { BenefitsTemplate } from "../templates/detail/BenefitsTemplate.js";
import { SourcesTemplate } from "../templates/detail/SourcesTemplate.js";
import { ApplicationTemplate } from "../templates/detail/ApplicationTemplate.js";
import { CommunicationTemplate } from "../templates/detail/CommunicationTemplate.js";
import { HtmlUtils } from "../utils/HtmlUtils.js";
import { StatusUtils } from "../utils/StatusUtils.js";


export class DetailView {

    constructor(repository, id) {

        this.repository = repository;
        this.id = id;

        this.templates = {
            company: new CompanyTemplate(),
            contact: new ContactTemplate(),
            job: new JobTemplate(),
            requirements: new RequirementsTemplate(),
            benefits: new BenefitsTemplate(),
            sources: new SourcesTemplate(),
            application: new ApplicationTemplate(),
            communication: new CommunicationTemplate()
        };
    }


    render(root) {

        const application = this.repository.getById(this.id);

        if (!application) {
            location.hash = "#/";
            return;
        }

        const status =
            application.application?.status ||
            "Nicht beworben";

        root.innerHTML = `
            <header class="header header2 pb-0">

                <span class="status-badge ${StatusUtils.getClass(status)}">
                    ${HtmlUtils.escape(status)}
                </span>

                <div class="shrink-to-left">

                    <h1>
                        ${HtmlUtils.escape(
                            application.company?.name ||
                            "Unbenannte Firma"
                        )}
                    </h1>

                    <p>
                        ${HtmlUtils.escape(
                            application.job?.title ||
                            "Keine Stelle angegeben"
                        )}
                    </p>

                </div>

                <nav class="header-detail-view">

                    <button
                        class="primary"
                        data-route="#/edit/${encodeURIComponent(application.id)}">
                        Bearbeiten
                    </button>

                    <button
                        class="danger"
                        data-action="delete">
                        Löschen
                    </button>

                </nav>

            </header>


            <header class="header header2">

                <nav class="detail-navigation">

                    <button
                        type="button"
                        data-section="company">
                        Firma
                    </button>

                    <button
                        type="button"
                        data-section="contact">
                        Ansprechpartner
                    </button>

                    <button
                        type="button"
                        data-section="job">
                        Stelle
                    </button>

                    <button
                        type="button"
                        data-section="requirements">
                        Anforderungen
                    </button>

                    <button
                        type="button"
                        data-section="benefits">
                        Benefits
                    </button>

                    <button
                        type="button"
                        data-section="sources">
                        Quellen
                    </button>

                    <button
                        type="button"
                        data-section="application">
                        Bewerbung & Ausgabe
                    </button>

                    <button
                        type="button"
                        data-section="communication">
                        Telefonate
                    </button>

                </nav>

            </header>


            <main id="detailContent"></main>
        `;


        // Löschen

        const deleteButton =
            root.querySelector('[data-action="delete"]');

        if (deleteButton) {

            deleteButton.onclick = () => {

                if (!confirm("Bewerbung wirklich löschen?")) {
                    return;
                }

                this.repository.delete(application.id);

                location.hash = "#/";
            };
        }


        // Navigation

        const content =
            root.querySelector("#detailContent");

        const buttons =
            root.querySelectorAll("[data-section]");


        buttons.forEach(button => {

            button.addEventListener("click", () => {

                const section =
                    button.dataset.section;

                content.innerHTML =
                    this.getTemplate(
                        section,
                        application
                    );


                // Aktiven Button setzen

                buttons.forEach(btn => {
                    btn.classList.remove("active");
                });

                button.classList.add("active");


                // Events des jeweiligen Templates

                this.bindSectionEvents(
                    root,
                    application,
                    section
                );
            });
        });


        // Standardmäßig Firma anzeigen

        const defaultButton =
            root.querySelector(
                '[data-section="company"]'
            );

        if (defaultButton) {
            defaultButton.click();
        }
    }


    getTemplate(section, application) {

        const template =
            this.templates[section];

        if (!template) {
            return this.templates.company.render(
                application
            );
        }

        return template.render(application);
    }


    bindSectionEvents(root, application, section) {

        if (section !== "communication") {
            return;
        }


        // Telefonat hinzufügen

        const addButton =
            root.querySelector("#addCommunication");

        if (addButton) {

            addButton.onclick = () => {

                const textarea =
                    root.querySelector(
                        "#communicationText"
                    );

                const text =
                    textarea.value.trim();

                if (!text) {
                    return;
                }


                application.communication =
                    application.communication || [];


                application.communication.push({

                    id: crypto.randomUUID(),

                    type: "Telefonat",

                    text: text,

                    date: new Date().toISOString()
                });


                this.repository.save(application);


                root.querySelector(
                    "#detailContent"
                ).innerHTML =
                    this.templates.communication.render(
                        application
                    );


                this.bindSectionEvents(
                    root,
                    application,
                    "communication"
                );
            };
        }


        // Telefonnotiz bearbeiten

        root.querySelectorAll(
            "[data-edit-communication]"
        ).forEach(button => {

            button.onclick = () => {

                const entry =
                    application.communication.find(
                        item =>
                            item.id ===
                            button.dataset.editCommunication
                    );

                if (!entry) {
                    return;
                }


                const value = prompt(
                    "Telefonnotiz bearbeiten:",
                    entry.text
                );

                if (value === null) {
                    return;
                }


                entry.text = value.trim();

                this.repository.save(application);


                root.querySelector(
                    "#detailContent"
                ).innerHTML =
                    this.templates.communication.render(
                        application
                    );


                this.bindSectionEvents(
                    root,
                    application,
                    "communication"
                );
            };
        });
    }
}