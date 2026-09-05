import { DetailBaseTemplate } from "./DetailBaseTemplate.js";
import { HtmlUtils } from "../../utils/HtmlUtils.js";

export class SourcesTemplate extends DetailBaseTemplate {

    render(application) {

        const importedUrls = application.sources?.importedUrls || [];

        return `
            <section class="subsection-display">
                <section class="section-header">
                    <div>
                        <span class="section-icon">🌐</span>
                        <div>
                            <h2>Quellen</h2>
                            <p>Information wo die Daten herkommen</p>
                        </div
                    </div>
                </section>
                
                <section class="section-body">
                    <div class="field">
                        <label>Gesuchte Stelle</label>
                        <p>${HtmlUtils.escape(application.job?.title || "—")}</p>
                    </div>

                    
                    <div class="field">
                        <label>Stellenanzeige</label>
                        ${this.link([application.sources?.jobPosting, application.application?.jobUrl])}
                    </div>

                    <div class="field">
                        <label>Unternehmensseite</label>
                        ${this.link([application.sources?.companyWebsite, application.company?.website])}
                    </div>

                    <div class="field">
                        <label>Quelle</label>
                        <p>${this.link(application.application?.source)}</p>
                    </div>

                    <div class="field">
                        <label>Weitere Quellen</label>
                        ${this.link(importedUrls)}
                    </div>
                </section>
            </section>
        `;

    }
}