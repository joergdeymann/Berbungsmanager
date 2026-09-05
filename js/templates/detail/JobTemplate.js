import { DetailBaseTemplate } from "./DetailBaseTemplate.js";
import { HtmlUtils } from "../../utils/HtmlUtils.js";

export class JobTemplate extends DetailBaseTemplate {

    render(application) {

        return `
            <section class="subsection-display">
                <section class="section-header">
                    <div>
                        <span class="section-icon">💼</span>
                        <div>
                            <h2>Stelle</h2>
                            <p>Arbeitsstelle, die das Unternehmen anbietet</p>
                        </div
                    </div>
                </section>
                
                <section class="section-body">
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
                </section>
            </section>
        `;

    }
}