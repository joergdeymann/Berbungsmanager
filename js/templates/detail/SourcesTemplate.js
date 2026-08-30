import { DetailBaseTemplate } from "./DetailBaseTemplate.js";
import { HtmlUtils } from "../../utils/HtmlUtils.js";

export class SourcesTemplate extends DetailBaseTemplate {

    render(application) {

        const importedUrls =
            application.sources?.importedUrls || [];

        return `
            <section class="card section">

                <h2>🌐 Quellen</h2>

                <p>
                    <strong>Stellenanzeige:</strong>
                    ${this.link(
                        application.sources?.jobPosting ||
                        application.application?.jobUrl
                    )}
                </p>

                <p>
                    <strong>Unternehmensseite:</strong>
                    ${this.link(
                        application.sources?.companyWebsite ||
                        application.company?.website
                    )}
                </p>

                ${
                    importedUrls.length
                        ? `
                            <h3>Weitere Quellen</h3>

                            <ul>
                                ${importedUrls.map(url => `
                                    <li>
                                        ${this.link(url)}
                                    </li>
                                `).join("")}
                            </ul>
                        `
                        : ""
                }

                <p>
                    <strong>Quelle:</strong>
                    ${HtmlUtils.escape(
                        application.application?.source || "—"
                    )}
                </p>

            </section>
        `;
    }
}