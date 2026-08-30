import { DetailBaseTemplate } from "./DetailBaseTemplate.js";
import { HtmlUtils } from "../../utils/HtmlUtils.js";

export class JobTemplate extends DetailBaseTemplate {

    render(application) {

        return `
            <section class="card section">

                <h2>💼 Stelle</h2>

                <p>
                    <strong>Gesuchte Stelle:</strong>
                    ${HtmlUtils.escape(
                        application.job?.title || "—"
                    )}
                </p>

                <p>
                    <strong>Arbeitsort:</strong>
                    ${HtmlUtils.escape(
                        application.job?.location || "—"
                    )}
                </p>

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