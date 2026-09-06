import { BaseEditTab } from "./BaseEditTab.js";
import { Toast } from "../Toast.js";
import { UrlPrompt } from "../UrlPrompt.js";
import { ParseUrl } from "../../services/analysis/ParseUrl.js";

export class ImportTab extends BaseEditTab {
    render() {
        return `
      <section id="section-import" class="tab-content tab-section">
        <div class="section-header">
          <div><span class="section-icon import-adjust">📥</span><h2>Import / Originaltext</h2></div>
          <span>
                <button type="button" id="clearOriginalText" class="danger">Text löschen</button>
                <button type="button" id="fetchUrl" class="secondary">URL durchsuchen</button>
                <button type="button" id="analyze" class="primary">Übernehmen &amp; Analysieren</button>
          </span>
        </div>
        <textarea id="originalText" placeholder="Füge hier den Ausschreibungstext oder Notizen ein..."></textarea>

        <div class="import-history" id="importHistory">
          <h3>Übernommene Texte</h3>
          <p class="muted" id="importHistoryEmpty">Noch keine Texte übernommen.</p>
          <div id="importHistoryList" class="import-history-list"></div>
        </div>
      </section>
    `;
    }

    init(application, analyzer, applyAnalysis) {
        this.analyzer = analyzer;
        this.applyAnalysis = applyAnalysis;
        this.urlPrompt = new UrlPrompt();
        this.parseUrl = new ParseUrl();

        // Eigener, veränderbarer Verlauf für diese Editier-Session -
        // wird in save() zurück ins Application-Objekt geschrieben.
        this.history = (application.importHistory || []).map(entry => ({ ...entry }));

        this.set("originalText", application.originalText);

        this.root.querySelector("#clearOriginalText").onclick = () => this.set("originalText", "");
        this.root.querySelector("#analyze").onclick = () => this.transferCurrentText();
        this.root.querySelector("#fetchUrl").onclick = () => this.fetchFromUrl();

        this.renderHistory();
    }

    // Übernimmt den aktuellen Textarea-Inhalt in den Verlauf, leert
    // das Feld, zeigt eine Bestätigung und analysiert danach ALLE
    // Verlaufs-Einträge gemeinsam.
    transferCurrentText() {
        const text = this.get("originalText").trim();
        if (!text) {
            this.runCombinedAnalysis();
            return;
        }

        const source = this.analyzer.detectSource(text) || "Manuell eingefügt";
        this.addHistoryEntry({ text, source, sections: [], link: null });
        this.set("originalText", "");

        Toast.show(`Text übernommen (Quelle erkannt: ${source}). ${this.history.length} Einträge insgesamt.`);
    }

    // Öffnet das URL-Eingabefenster, ruft die Seite über den
    // serverseitigen Proxy ab, beschränkt auf die bekannten
    // Bereiche der Quelle und übernimmt das Ergebnis direkt in
    // den Verlauf (kein Zwischenschritt über das Textfeld nötig).
    async fetchFromUrl() {
        const url = await this.urlPrompt.show();
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
                link: result.url
            });

            Toast.show(`"${result.source}" abgerufen und übernommen (${result.sections.length} Bereich(e)).`);

        } catch (error) {
            console.error(error);
            Toast.show(`Fehler beim Abrufen der URL: ${error.message}`, 4000);
        } finally {
            button.disabled = false;
            button.textContent = "URL durchsuchen";
        }
    }

    addHistoryEntry({ text, source, sections, link }) {
        this.history.push({
            id: crypto.randomUUID(),
            text,
            source,
            sections,
            link,
            importedAt: new Date().toISOString()
        });

        this.renderHistory();
        this.runCombinedAnalysis();
    }

    // f) Alle Verlaufs-Einträge werden zu einem Text zusammengefasst
    // und gemeinsam analysiert, damit mehrere Quellen sich ergänzen.
    runCombinedAnalysis() {
        if (!this.history.length) return;

        const combinedText = this.history.map(entry => entry.text).join("\n\n----\n\n");
        const result = this.analyzer.analyze(combinedText);
        this.applyAnalysis(result);
    }

    // Verlaufs-Eintrag zum Weiterbearbeiten zurück ins Eingabefeld
    // holen ("switchen") - er wird dabei aus dem Verlauf entfernt,
    // damit er beim erneuten Übernehmen nicht doppelt landet.
    editEntry(id) {
        const index = this.history.findIndex(entry => entry.id === id);
        if (index < 0) return;

        const [entry] = this.history.splice(index, 1);
        this.set("originalText", entry.text);
        this.renderHistory();
        this.runCombinedAnalysis();
    }

    removeEntry(id) {
        this.history = this.history.filter(entry => entry.id !== id);
        this.renderHistory();
        this.runCombinedAnalysis();
    }

    renderHistory() {
        const list = this.root.querySelector("#importHistoryList");
        const empty = this.root.querySelector("#importHistoryEmpty");
        if (!list) return;

        empty.style.display = this.history.length ? "none" : "";
        list.innerHTML = "";

        this.history.forEach(entry => {
            const row = document.createElement("div");
            row.className = "import-history-row";
            row.innerHTML = `
              <div class="import-history-meta">
                <strong>${this.escapeAttribute(entry.source)}</strong>
                <small>${this.formatDate(entry.importedAt)}</small>
                ${entry.link ? `<a href="${this.escapeAttribute(entry.link)}" target="_blank" rel="noopener">Quelle öffnen ↗</a>` : ""}
              </div>
              ${entry.sections?.length ? `<small class="import-history-sections">Bereiche: ${entry.sections.map(name => this.escapeAttribute(name)).join(", ")}</small>` : ""}
              <p class="import-history-preview">${this.escapeAttribute(this.preview(entry.text))}</p>
              <div class="import-history-actions">
                <button type="button" class="secondary switch-entry">Bearbeiten</button>
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
        application.importHistory = this.history;
    }
}
