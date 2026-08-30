import { DetailBaseTemplate } from "./DetailBaseTemplate.js";
import { HtmlUtils } from "../../utils/HtmlUtils.js";

export class CompanyTemplate extends DetailBaseTemplate {

    render(application) {

        return `
            <section class="card section">

                <h2>🏢 Firmeninformation</h2>

                <p>
                    <strong>Firma:</strong>
                    ${HtmlUtils.escape(
                        application.company?.name || "—"
                    )}
                </p>

                <p>
                    <strong>Adresse:</strong><br>
                    ${HtmlUtils.escape(
                        application.company?.street || ""
                    )}<br>

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

                <p>
                    <strong>Webseite:</strong>
                    ${this.link(
                        application.company?.website
                    )}
                </p>

                <p>
                    <strong>Branche:</strong>
                    ${HtmlUtils.escape(
                        application.companyInformation?.industry || "—"
                    )}
                </p>

                <p>
                    <strong>Größe:</strong>
                    ${HtmlUtils.escape(
                        application.companyInformation?.size || "—"
                    )}
                </p>

                <p>
                    <strong>Gegründet:</strong>
                    ${HtmlUtils.escape(
                        application.companyInformation?.founded || "—"
                    )}
                </p>

                <p>
                    <strong>Spezialisierungen:</strong>
                    ${HtmlUtils.escape(
                        (
                            application.companyInformation
                                ?.specialties || []
                        ).join(", ") || "—"
                    )}
                </p>

                <p>
                    ${HtmlUtils.escape(
                        application.companyInformation?.description ||
                        "Keine Firmenbeschreibung vorhanden."
                    )}
                </p>

            </section>
        `;
    }
}