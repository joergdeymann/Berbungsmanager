import { DetailBaseTemplate } from "./DetailBaseTemplate.js";
import { HtmlUtils } from "../../utils/HtmlUtils.js";

export class CommunicationTemplate extends DetailBaseTemplate {

    render(application) {


        return `
            <section class="subsection-display">
                <section class="section-header">
                    <div>
                        <span class="section-icon">📞</span>
                        <div>
                            <h2>Telefonate / Kommunikation</h2>
                            <p>Email, Telefonate oder Live Korrespondenz</p>
                        </div>
                    </div>
                </section>
                <section class="section-body">
                    <div class="communication-add">

                        <textarea
                            id="communicationText"
                            rows="10"
                            placeholder="Informationen zum Telefonat eingeben ..."
                        ></textarea>

                        <span><button
                            class="primary"
                            id="addCommunication">
                            Telefonat speichern
                        </button></span>

                    </div>
                </section>
                
                <section id="communicationList" class="section-body">${this.communicationList(application)}</section>
            </section>  
        `;
    }

    communicationList(application) {
        const communication =
            application.communication || [];
        return communication.length
            ? communication.sort((a, b) => b.date.localeCompare(a.date))
                .map(item =>
                    this.communicationItem(item)
                )
                .join("")
            : `
                <span class="muted">
                    Noch keine Telefonnotizen vorhanden.
                </span>
            `;
    }

    communicationItem(item) {

        const date = item.date
            ? new Date(item.date).toLocaleString("de-DE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            })
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

                <span class="text-content">${HtmlUtils.escape(item.text)}</span>

                <span>
                    <button
                        class="danger"
                        data-delete-communication="${HtmlUtils.escape(item.id)}">
                        Löschen
                    </button>

                    <button
                        data-edit-communication="${HtmlUtils.escape(item.id)}">
                        Ändern
                    </button> 
                </span>
            </div>
        `;
}
}