import { DetailBaseTemplate } from "./DetailBaseTemplate.js";
import { HtmlUtils } from "../../utils/HtmlUtils.js";
import { StatusUtils } from "../../utils/StatusUtils.js";

export class ApplicationTemplate extends DetailBaseTemplate {

    render(application) {

        const status =
            application.application?.status ||
            "Nicht beworben";

        return `
            <section class="card section">

                <h2>📤 Bewerbung & Ausgabe</h2>

                <div class="detail-grid">

                    <div>

                        <p>
                            <strong>Status:</strong>

                            <span class="status-badge ${StatusUtils.getClass(status)}">
                                ${HtmlUtils.escape(status)}
                            </span>
                        </p>

                        <p>
                            <strong>Beworben am:</strong>
                            ${HtmlUtils.escape(
                                application.application?.appliedAt ||
                                "—"
                            )}
                        </p>

                        <p>
                            <strong>Bewerbungsweg:</strong>
                            ${HtmlUtils.escape(
                                application.application?.method ||
                                "—"
                            )}
                        </p>

                    </div>

                    <div>

                        <p>
                            <strong>Portal:</strong>
                            ${this.link(
                                application.portal?.url
                            )}
                        </p>

                        <p>
                            <strong>Benutzer:</strong>
                            ${HtmlUtils.escape(
                                application.portal?.username ||
                                "—"
                            )}
                        </p>

                    </div>

                </div>

                <h3>Unterlagen</h3>

                <div class="document-actions">

                    ${this.documentButton(
                        "Anschreiben",
                        application.documents?.coverLetter
                    )}

                    ${this.documentButton(
                        "Lebenslauf",
                        application.documents?.resume
                    )}

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