import { DetailBaseTemplate } from "./DetailBaseTemplate.js";
import { HtmlUtils } from "../../utils/HtmlUtils.js";

export class JobTemplate extends DetailBaseTemplate {

    render(application) {

        return `
            <section class="application-card subsection-display">
                <section class="section-header section">
                    <div>
                        <span class="section-icon">💼</span>
                        <div>
                            <h2>Stelle</h2>
                            <p>Arbeitsstelle, die das Unternehmen anbietet</p>
                        </div
                    </div>
                </section>
                
                <div class="subsection">
                    <div class="field">
                        <label>Gesuchte Stelle</label>
                        <p>${HtmlUtils.escape(application.job?.title || "—")}</p>
                    </div>
                    <div class="field">
                        <label>Arbeitsort</label>
                        <p>${HtmlUtils.escape(application.job?.location || "—")}</p>
                    </div>
                    <div class="field">
                        <label>Beschäftigungsart</label>
                        <p>${HtmlUtils.escape(application.job?.employmentType || "—")}</p>
                    </div>
                    <div class="field">
                        <label>Arbeitsmodell</label>
                        <p>${HtmlUtils.escape(application.job?.workModel || "—")}</p>                    
                    </div>
                    <div class="field">
                        <label>Gehalt</label>
                        <p>${HtmlUtils.escape(application.job?.salary || "—")}</p>
                    </div>
                    <div class="field">
                        <label>Kennziffer</label>
                        <p>${HtmlUtils.escape(application.job?.referenceNumber || "—")}</p>
                    </div>
                    <div class="field">
                        <label>Aufgaben</label>
                        ${this.list(application.tasks|| "—")}
                    </div>                    
                </div>
            </section>
        `;

        return `
            <section class="card section">


                <p>
                    <strong>Beschäftigungsart:</strong>
                    ${HtmlUtils.escape(
                        application.job?.employmentType || "—"
                    )}
                </p>

                <p>
                    <strong>Arbeitsmodell:</strong>
                    ${HtmlUtils.escape(
                        application.job?.workModel || "—"
                    )}
                </p>

                <p>
                    <strong>Gehalt:</strong>
                    ${HtmlUtils.escape(
                        application.job?.salary || "—"
                    )}
                </p>

                <p>
                    <strong>Kennziffer:</strong>
                    ${HtmlUtils.escape(
                        application.job?.referenceNumber || "—"
                    )}
                </p>

                <h3>Aufgaben</h3>

                ${this.list(application.tasks)}

            </section>
        `;
    }
}