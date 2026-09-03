import { DetailBaseTemplate } from "./DetailBaseTemplate.js";
import { HtmlUtils } from "../../utils/HtmlUtils.js";

export class CompanyTemplate extends DetailBaseTemplate {

    render(application) {

        return `
            <section class="application-card subsection-display">
                <section class="section-header">
                    <div>
                        <span class="section-icon">🏢</span>
                        <div>
                            <h2>Firmeninformation</h2>
                            <p>Alle Informationen über das Unternehmen.</p>
                        </div
                    </div>
                </section>
                
                <section class="section-body">
                    <div class="field">
                        <label>Firmenname</label>
                        <p>${HtmlUtils.escape(application.company?.name || "—")}</p>
                    </div>
 
                    <div class="field">
                        <label>Adresse</label>
                        <p>
                            ${HtmlUtils.escape(application.company?.street || "")}<br>

                            ${HtmlUtils.escape(
                                application.company?.zip || ""
                            )}
                            ${HtmlUtils.escape(
                                application.company?.city || ""
                            )}<br>

                            ${HtmlUtils.escape(
                                application.company?.country || ""
                            )}
                        </p>
                    </div>
                    <div class="field">
                        <label>Webseite</label>
                        <p>${this.link(application.company?.website)}</p>
                    </div>
                    <div class="field">
                        <label>Branche</label>
                        <p>${HtmlUtils.escape(application.companyInformation?.industry || "—")}</p>
                    </div>
                    <div class="field">
                        <label>Größe</label>
                        <p>${HtmlUtils.escape(application.companyInformation?.size || "—")}</p>
                    </div>
                    <div class="field">
                        <label>Gegründet</label>
                        <p>${HtmlUtils.escape(application.companyInformation?.founded || "—")}</p>
                    </div>
                    <div class="field">
                        <label>Spezialisierungen</label>
                        ${this.list(application.companyInformation?.specialties || "—")}
                    </div>
                    <div class="field">
                        <label>Selbstbeschreibung</label>
                        <p>${HtmlUtils.escape(application.companyInformation?.description || "—")}</p>
                    </div>
                    <div class="field">
                        <label>Tätigkeitsbeschreibung der Firma(ACHTUNG FALLSCHER INHALT)</label>
                        ${this.list(application.tasks || "—")}

                    </div>
                </section>
            </section>
        `;
    }
}