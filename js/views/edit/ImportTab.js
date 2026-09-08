import { BaseEditTab } from "./BaseEditTab.js";
import { Toast } from "../Toast.js";
import { UrlPrompt } from "../UrlPrompt.js";
import { ParseUrl } from "../../services/analysis/ParseUrl.js";

export class ImportTab extends BaseEditTab {
    fetchUrlButtonText = "Webadresse der Stellenanzeige";

    render() {
        return `
      <section id="section-import" class="tab-content tab-section">
        <div class="section-header">
          <div><span class="section-icon import-adjust">📥</span><h2>Import / Originaltext</h2></div>
          <span>
                <button type="button" id="clearOriginalText" class="danger">Text löschen</button>
                <button type="button" id="fetchUrl" class="success">${this.fetchUrlButtonText}</button>
          </span>
        </div>

        <p class="muted bookmarklet-hint">
          Tipp: Ziehe diesen Link in deine Lesezeichen-Leiste – auf der Stellenanzeige
          angeklickt, springt er direkt hierher und ruft die Seite automatisch ab:
          <a href="${this.bookmarkletHref()}" class="bookmarklet-link" onclick="return false;">📌 Stelle importieren</a>
        </p>
        <textarea id="originalText" placeholder="Füge hier den Ausschreibungstext oder Notizen ein... (wird beim Verlassen des Feldes automatisch übernommen)"></textarea>

        <div class="import-history" id="importHistory">
          <h3>Übernommene Texte</h3>
          <p class="muted" id="importHistoryEmpty">Noch keine Texte übernommen.</p>
          <div id="importHistoryList" class="import-history-list"></div>
        </div>
      </section>
    `;
    }

    init(application, analyzer, applyAnalysis, autoSave) {
        this.analyzer = analyzer;
        this.applyAnalysis = applyAnalysis;
        this.autoSave = autoSave;
        this.urlPrompt = new UrlPrompt();
        this.parseUrl = new ParseUrl();

        // Zusätzliche Funde von der (zweiten) Bewerbungs-/Karriereseite
        // hinter einem "Bewerben"-Link (Telefonnummern, Firmentext,
        // Bilder) - werden bei jeder Analyse mit eingemischt.
        this.pageExtras = { phones: [], companyInfoBlocks: [], images: [], peopleImages: [] };

        // Eigener, veränderbarer Verlauf für diese Editier-Session -
        // wird in save() zurück ins Application-Objekt geschrieben.
        this.history = (application.importHistory || []).map(entry => ({ ...entry }));

        // Welcher Verlaufs-Eintrag gerade im Textfeld zum Bearbeiten
        // geladen ist (null = neuer, noch nicht übernommener Text).
        this.selectedEntryId = null;
        this.lastCommittedText = application.originalText || "";

        this.set("originalText", application.originalText);

        const input = this.root.querySelector("#originalText");

        this.root.querySelector("#clearOriginalText").onclick = () => {
            this.set("originalText", "");
            this.selectedEntryId = null;
            this.lastCommittedText = "";
            this.renderHistory();
        };

        // Kein "Übernehmen"-Button mehr nötig: beim Verlassen des
        // Feldes wird automatisch übernommen, analysiert und
        // gespeichert, sofern sich der Text geändert hat.
        input.onblur = () => this.commitIfChanged();

        this.root.querySelector("#fetchUrl").onclick = () => this.fetchFromUrl();

        this.renderHistory();

        // Kommt der Aufruf vom Bookmarklet mit einer mitgegebenen URL
        // (siehe app.js), direkt automatisch abrufen statt das
        // Eingabefenster zu zeigen.
        const pendingUrl = sessionStorage.getItem("pendingImportUrl");
        if (pendingUrl) {
            sessionStorage.removeItem("pendingImportUrl");
            this.fetchFromUrl(pendingUrl);
        }
    }

    // Erzeugt den "javascript:"-Link fürs Lesezeichen: merkt sich die
    // aktuelle Seiten-URL und springt zu unserer App zurück - siehe
    // app.js für die Gegenseite.
    bookmarkletHref() {
        const appOrigin = location.origin + location.pathname;
        const code = `(function(){window.location.href=${JSON.stringify(appOrigin)}+"?importUrl="+encodeURIComponent(window.location.href);})();`;
        return "javascript:" + encodeURIComponent(code);
    }

    commitIfChanged() {
        const text = this.get("originalText").trim();
        if (!text || text === this.lastCommittedText) return;

        const source = this.analyzer.detectSource(text) || "Manuell eingefügt";

        if (this.selectedEntryId) {
            // Vorhandenen (gerade bearbeiteten) Eintrag aktualisieren,
            // statt einen neuen anzulegen.
            const entry = this.history.find(item => item.id === this.selectedEntryId);
            if (entry) {
                entry.text = text;
                entry.source = source;
            }
            this.lastCommittedText = text;
            this.renderHistory();
            this.runCombinedAnalysis();
            this.autoSave?.();
            Toast.show("Änderung automatisch übernommen und gespeichert.");
            return;
        }

        this.addHistoryEntry({ text, source, sections: [], link: null });
        this.set("originalText", "");
        this.lastCommittedText = "";

        Toast.show(`Text automatisch übernommen und gespeichert (${this.history.length} Einträge insgesamt).`);
    }

    // Öffnet das URL-Eingabefenster, ruft die Seite über den
    // serverseitigen Proxy ab, beschränkt auf die bekannten
    // Bereiche der Quelle und übernimmt das Ergebnis direkt in
    // den Verlauf (kein Zwischenschritt über das Textfeld nötig).
    async fetchFromUrl(presetUrl = null) {
        const url = presetUrl || await this.urlPrompt.show();
        if (!url) return;

        const button = this.root.querySelector("#fetchUrl");
        button.disabled = true;
        button.textContent = "Wird abgerufen...";

        try {
            const result = await this.parseUrl.fetchAndExtract(url);
            const text = result.sections
                .map(section => `${section.name}\n${section.text}`)
                .join("\n\n");

            this.addHistoryEntry({
                text,
                source: result.source,
                sections: result.sections.map(section => section.name),
                link: result.url,
                applicationLink: result.applicationLink
            });

            let linkHint = "";
            if (result.applicationLink) {
                linkHint = ` Möglicher Bewerbungslink gefunden (bitte prüfen, siehe "Quellen"-Tab).`;
                linkHint += await this.searchApplicationPage(result.applicationLink);
            }
            Toast.show(`"${result.source}" abgerufen, übernommen und gespeichert (${result.sections.length} Bereich(e)).${linkHint}`, 5000);

        } catch (error) {
            console.error(error);
            Toast.show(`Fehler beim Abrufen der URL: ${error.message}`, 4000);
        } finally {
            button.disabled = false;
            button.textContent = this.fetchUrlButtonText;
        }
    }

    // Durchsucht die aufgelöste Bewerbungs-/Karriereseite zusätzlich
    // nach Kontaktdaten, Firmeninformationen und Bildern (siehe
    // PageSearcher.js) und mischt die Funde in die nächste Analyse
    // ein. Schlägt best-effort fehl, ohne den Haupt-Import zu stören.
    async searchApplicationPage(applicationLink) {
        try {
            const found = await this.parseUrl.searchPage(applicationLink);

            this.pageExtras.phones.push(...found.contact.phones);
            this.pageExtras.companyInfoBlocks.push(...found.companyInfo);
            this.pageExtras.images.push(...found.images);
            this.pageExtras.peopleImages.push(...found.people);

            this.runCombinedAnalysis();

            const bits = [];
            if (found.contact.phones.length) bits.push(`${found.contact.phones.length} Telefonnummer(n)`);
            if (found.people.length) bits.push(`${found.people.length} Person(en) mit Bild`);
            if (found.images.length) bits.push(`${found.images.length} weitere(s) Bild(er)`);
            return bits.length ? ` Zusätzlich auf der Bewerbungsseite gefunden: ${bits.join(", ")}.` : "";

        } catch (error) {
            console.error("Bewerbungsseite konnte nicht durchsucht werden:", error);
            return "";
        }
    }

    addHistoryEntry({ text, source, sections, link, applicationLink = null }) {
        this.history.push({
            id: crypto.randomUUID(),
            text,
            source,
            sections,
            link,
            applicationLink,
            importedAt: new Date().toISOString()
        });

        this.renderHistory();
        this.runCombinedAnalysis();
        this.autoSave?.();
    }

    // f) Alle Verlaufs-Einträge werden zu einem Text zusammengefasst
    // und gemeinsam analysiert, damit mehrere Quellen sich ergänzen.
    // Zusätzlich werden Funde von der Bewerbungsseite (pageExtras)
    // eingemischt, die nicht aus reinem Text stammen (Telefonnummern,
    // Firmentext-Schnipsel, Bild-URLs).
    runCombinedAnalysis() {
        if (!this.history.length) return;

        const combinedText = this.history.map(entry => entry.text).join("\n\n----\n\n");
        const result = this.analyzer.analyze(combinedText);

        if (this.pageExtras.phones.length) {
            result.phones = [...new Set([...(result.phones || []), ...this.pageExtras.phones])];
        }
        if (this.pageExtras.companyInfoBlocks.length) {
            const extra = this.pageExtras.companyInfoBlocks.join("\n\n");
            result.companyInformation.description = result.companyInformation.description
                ? `${result.companyInformation.description}\n\n${extra}`
                : extra;
        }
        if (this.pageExtras.images.length) {
            result.companyInformation.foundImages = [...new Set(this.pageExtras.images)];
        }
        if (this.pageExtras.peopleImages.length) {
            result.companyInformation.peopleImages = this.pageExtras.peopleImages;
        }

        this.applyAnalysis(result);
    }

    // Verlaufs-Eintrag zum Bearbeiten ins Textfeld laden ("switchen").
    // C) Der Eintrag bleibt dabei in der Liste stehen (wird nicht
    // entfernt) und wird nur visuell als ausgewählt markiert - erst
    // beim nächsten Verlassen des Feldes wird die Änderung
    // übernommen (und ersetzt dann den bestehenden Eintrag, statt
    // einen doppelten anzulegen).
    editEntry(id) {
        const entry = this.history.find(item => item.id === id);
        if (!entry) return;

        this.selectedEntryId = id;
        this.lastCommittedText = entry.text;
        this.set("originalText", entry.text);
        this.renderHistory();
        this.root.querySelector("#originalText").focus();
    }

    removeEntry(id) {
        this.history = this.history.filter(entry => entry.id !== id);
        if (this.selectedEntryId === id) {
            this.selectedEntryId = null;
            this.set("originalText", "");
            this.lastCommittedText = "";
        }
        this.renderHistory();
        this.runCombinedAnalysis();
        this.autoSave?.();
    }

    renderHistory() {
        const list = this.root.querySelector("#importHistoryList");
        const empty = this.root.querySelector("#importHistoryEmpty");
        if (!list) return;

        empty.style.display = this.history.length ? "none" : "";
        list.innerHTML = "";

        this.history.forEach(entry => {
            const row = document.createElement("div");
            row.className = "import-history-row" + (entry.id === this.selectedEntryId ? " selected" : "");
            row.innerHTML = `
              <div class="import-history-meta">
                <strong>${this.escapeAttribute(entry.source)}</strong>
                <small>${this.formatDate(entry.importedAt)}</small>
                ${entry.link ? `<a href="${this.escapeAttribute(entry.link)}" target="_blank" rel="noopener">Quelle öffnen ↗</a>` : ""}
              </div>
              ${entry.applicationLink ? `<small class="import-history-sections">Möglicher Bewerbungslink (bitte prüfen): <a href="${this.escapeAttribute(entry.applicationLink)}" target="_blank" rel="noopener">${this.escapeAttribute(entry.applicationLink)}</a></small>` : ""}
              ${entry.sections?.length ? `<small class="import-history-sections">Bereiche: ${entry.sections.map(name => this.escapeAttribute(name)).join(", ")}</small>` : ""}
              <p class="import-history-preview">${this.escapeAttribute(this.preview(entry.text))}</p>
              <div class="import-history-actions">
                <button type="button" class="secondary switch-entry">${entry.id === this.selectedEntryId ? "Wird bearbeitet" : "Bearbeiten"}</button>
                <button type="button" class="icon-button remove-entry">×</button>
              </div>
            `;
            row.querySelector(".switch-entry").onclick = () => this.editEntry(entry.id);
            row.querySelector(".remove-entry").onclick = () => this.removeEntry(entry.id);
            list.appendChild(row);
        });
    }

    preview(text) {
        const flat = text.replace(/\s+/g, " ").trim();
        return flat.length > 140 ? flat.slice(0, 140) + "…" : flat;
    }

    formatDate(value) {
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return "";
        return parsed.toLocaleString("de-DE", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit"
        });
    }

    applyAnalysis() {
        // Der Import-Verlauf selbst wird durch spätere Analysen nicht verändert.
    }

    save(application) {
        // Ein noch nicht übernommener Text im Feld geht beim Speichern
        // nicht verloren, sondern bleibt als Entwurf erhalten.
        application.originalText = this.get("originalText");
        // C) Der Verlauf wird dauerhaft mitgespeichert (landet über
        // repository.save() im localStorage).
        application.importHistory = this.history;

        // Auf der Bewerbungsseite gefundene Bilder sichern (noch kein
        // eigenes Formularfeld/Anzeige dafür - siehe Notiz zur
        // Bildersammlung).
        if (this.pageExtras.images.length) {
            application.companyInformation = application.companyInformation || {};
            application.companyInformation.foundImages = [...new Set([
                ...(application.companyInformation.foundImages || []),
                ...this.pageExtras.images
            ])];
        }
    }
}
