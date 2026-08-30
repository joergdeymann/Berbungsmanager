import { DetailBaseTemplate } from "./DetailBaseTemplate.js";
import { HtmlUtils } from "../../utils/HtmlUtils.js";

export class ContactTemplate extends DetailBaseTemplate {

    render(application) {

        const contact = application.contacts?.[0] || {};

        return `
            <section class="card section">

                <h2>👤 Ansprechpartner</h2>

                <p>
                    <strong>Name:</strong>
                    ${HtmlUtils.escape(
                        contact.name || "—"
                    )}
                </p>

                <p>
                    <strong>Position:</strong>
                    ${HtmlUtils.escape(
                        contact.role || "—"
                    )}
                </p>

                <p>
                    <strong>E-Mail:</strong>
                    ${HtmlUtils.escape(
                        contact.email ||
                        application.company?.emails?.[0] ||
                        "—"
                    )}
                </p>

                <p>
                    <strong>Telefon:</strong>
                    ${HtmlUtils.escape(
                        contact.phone ||
                        application.company?.phones?.[0] ||
                        "—"
                    )}
                </p>

            </section>
        `;
    }
}