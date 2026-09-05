import { DetailBaseTemplate } from "./DetailBaseTemplate.js";
import { HtmlUtils } from "../../utils/HtmlUtils.js";
import { StatusUtils } from "../../utils/StatusUtils.js";

export class ApplicationTemplate extends DetailBaseTemplate {

    render(application) {

        const status =
            application.application?.status ||
            "Nicht beworben";
        
            return `
            <section class="subsection-display ">
                <section class="section-header">
                    <div>
                        <span class="section-icon">📤</span>
                        <div>
                            <h2>Bewerbung & Ausgabe</h2>
                            <p>Histroy der Bewerbungsschritte , Möglichkeiten Bewerbung zu versenden</p>
                        </div>
                    </div>
                </section>
                
                <div class="field-grid">
                    <div class="field">
                        <label>Beworben am</label>
                        <p>${HtmlUtils.escape(application.application?.appliedAt || "—")}</p>
                    </div>

                    <div class="field">
                        <label>Bewerbungsweg</label>
                        <p>${HtmlUtils.escape(application.application?.method ||"—")}</p>
                    </div>

                    <div class="field">
                        <label>Portal</label>
                        <p>${this.link(application.portal?.url)}</p> 
                    </div>
                    <div class="field"> 
                        <label>Benutzer</label>
                        <p>${HtmlUtils.escape(application.portal?.username || "—")}</p>
                    </div>
                    <div class="field"> 
                        <label>Kennziffer</label>
                        <p>${HtmlUtils.escape(application.job?.referenceNumber || "—")}</p>
                    </div>
                </div>
                <div class="section-body">
                    <div class="field"> 
                        <label>Lebenslauf</label>
                        <div class="field-with-button">
                            ${this.documentButton("Lebenslauf", application.documents?.resume)}
                            <button>+</button>
                        </div>
                    </div>          

                    <div class="field">
                        <label>Anschreiben</label>
                        <div class="field-with-button">
                            ${this.documentButton("Anschreiben", application.documents?.coverLetter)}
                            <button>+</button>
                        </div>
                    </div>
                </div>

                <section class="application-card output-card">

                    <div class="output-actions">
                        <button class="output-action flex-column">
                            <div>
                                <span>📧</span>
                                <strong>E-Mail erstellen</strong>
                            </div>
                            <small>
                                Ansprechpartner und Stelleninformationen übernehmen
                            </small>
                        </button>

                        <button class="output-action">
                            <div>
                                <span>🌐</span>
                                <strong>Portal vorbereiten</strong>
                            </div>
                            <small>
                                Felder für ein Bewerbungsportal bereitstellen
                            </small>
                        </button>

                        <button class="output-action">
                            <div>
                                <span>📋</span>
                                <strong>Felder kopieren</strong>
                            </div>

                            <small>
                                Einzelne Informationen schnell übernehmen
                            </small>
                        </button>
                    </div>
                </section>

                <div class="section-header">
                    <div>
                        <span class="section-icon">📝</span>

                        <div>
                            <h2>Notizen</h2>
                            <p>
                                Freie Informationen zur Bewerbung.
                            </p>
                        </div>
                    </div>
                </div>
                <textarea id="notes" class="large-input" rows="7" placeholder="Weitere Notizen ..."></textarea>
            </section>

            <section class="subsection-display">
                <section class="section-header">
                    <div>
                        <span class="section-icon">📤</span>
                        <div>
                            <h2>Legende/ History</h2>
                            <p>Zeigt auf was du bereits alle getan hast</p>
                        </div
                    </div>
                </section>

                <div class="flex-row left-side compact">
                    <span class="status-badge compact status-rejected">Abgelehnt<br>29.08.2026</span>

                    <div class="application-main">
                        <strong>via Mail</strong>
                    </div>

                    <div class="application-main">
                        <strong>BUTTON Details</strong>
                    </div>
                </div>

                <div class="flex-row left-side compact">
                    <span class="status-badge compact status-rejected">Abgelehnt<br>29.08.2026</span>

                    <div class="application-main">
                        <strong>via Mail</strong>
                    </div>

                    <div class="application-main">
                        <strong>BUTTON Details</strong>
                    </div>
                </div>
                <div class="flex-row left-side compact">
                    <span class="status-badge compact status-rejected">Abgelehnt<br>29.08.2026</span>

                    <div class="application-main">
                        <strong>via Mail</strong>
                    </div>

                    <div class="application-main">
                        <strong>BUTTON Details</strong>
                    </div>
                </div>
            </section>
        `;

    }

    documentButton(label, url) {

        if (!url) {
            return `
                <span class="muted">
                    ${HtmlUtils.escape(label)}: nicht hinterlegt
                </span>
            `;
        }

        const safe = HtmlUtils.escape(url);

        return `
            <a class="output-action"
               href="${safe}"
               target="_blank"
               rel="noopener">
                📄 ${HtmlUtils.escape(label)} öffnen
            </a>
        `;
    }
}