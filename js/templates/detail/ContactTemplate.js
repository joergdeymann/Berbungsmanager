import { DetailBaseTemplate } from "./DetailBaseTemplate.js";
import { HtmlUtils } from "../../utils/HtmlUtils.js";

export class ContactTemplate extends DetailBaseTemplate {

    render(application) {

        const contact = application.contacts?.[0] || {};

        return `
            <section class="application-card subsection-display">
                <section class="section-header">
                    <div>
                        <span class="section-icon">👤</span>
                        <div>
                            <h2>Ansprechpartner</h2>
                            <p>Hier können die Daten des / der Ansprechpartner eingesehen werden</p>
                        </div
                    </div>
                </section>
                
                <section class="section-body">
                    <div class="field">
                        <label>Name</label>
                        <p>${HtmlUtils.escape(contact.name || "—")}</p>
                    </div>

                    <div class="field">
                        <label>Position:</label>
                        <p>${HtmlUtils.escape(contact.role || "—")}</p>
                    </div>
                    <div class="field">
                        <label>Telefon:</label>
                        <p>${HtmlUtils.escape(contact.phone || application.company?.phones?.[0] || "—")}</p>
                    </div>
                    <div class="field">
                        <label>E-Mail:</label>
                        <p>${HtmlUtils.escape(contact.email || application.company?.emails?.[0] || "—")}</p>
                    </div>

                </section>

                <section class="section-body">
                    <div class="subsection important-section">

                        <div class="subsection-header">

                            <div>
                                <h3>👤 Ansprechpartner für Bewerbung</h3>
                                <span>
                                    Wichtige Informationen für die spätere Bewerbung
                                </span>
                            </div>

                            <span class="important-badge">
                                Für Bewerbung verwenden
                            </span>

                        </div>


                        <div class="field-grid">

                            <div class="field">
                                <label>Name</label>
                                <input id="contactName">
                            </div>

                            <div class="field">
                                <label>Position</label>
                                <input id="contactRole">
                            </div>

                            <div class="field">
                                <label>E-Mail</label>
                                <input id="contactEmail">
                            </div>

                            <div class="field">
                                <label>Telefon</label>
                                <input id="contactPhone">
                            </div>

                        </div>


                        <div class="contact-actions">

                            <button class="action-button secondary">
                                📧 Bewerbung an Ansprechpartner vorbereiten
                            </button>

                            <button class="action-button secondary">
                                📋 Kontaktdaten kopieren
                            </button>

                        </div>

                    </div>
                </section>
            </section>
        `;
         
    }
}