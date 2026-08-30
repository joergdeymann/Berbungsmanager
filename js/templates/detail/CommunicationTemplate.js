import { DetailBaseTemplate } from "./DetailBaseTemplate.js";
import { HtmlUtils } from "../../utils/HtmlUtils.js";

export class CommunicationTemplate extends DetailBaseTemplate {

    render(application) {

        const communication =
            application.communication || [];

        return `
            <section class="card section">

                <h2>📞 Telefonate / Kommunikation</h2>

                <div id="communicationList">

                    ${
                        communication.length
                            ? communication
                                .map(item =>
                                    this.communicationItem(item)
                                )
                                .join("")
                            : `
                                <p class="muted">
                                    Noch keine Telefonnotizen vorhanden.
                                </p>
                            `
                    }

                </div>

                <div class="communication-add">

                    <textarea
                        id="communicationText"
                        rows="4"
                        placeholder="Informationen zum Telefonat eingeben ..."
                    ></textarea>

                    <button
                        class="primary"
                        id="addCommunication">
                        Telefonat speichern
                    </button>

                </div>

            </section>
        `;
    }

    communicationItem(item) {

        const date = item.date
            ? new Date(item.date).toLocaleString("de-DE")
            : "";

        return `
            <div class="communication-item">

                <div>

                    <strong>
                        ${HtmlUtils.escape(
                            item.type || "Notiz"
                        )}
                    </strong>

                    <small>
                        ${HtmlUtils.escape(date)}
                    </small>

                </div>

                <p>
                    ${HtmlUtils.escape(item.text)}
                </p>

                <button
                    data-edit-communication="${HtmlUtils.escape(item.id)}">
                    Ändern
                </button>

            </div>
        `;
    }
}