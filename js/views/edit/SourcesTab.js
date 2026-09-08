import { BaseEditTab } from "./BaseEditTab.js";

export class SourcesTab extends BaseEditTab {
    render() {
        return `
      <section id="section-sources" class="tab-content" style="display:none;">
        <div class="section-header">
          <div><span class="section-icon">🔗</span><h2>Quellen & Links</h2></div>
          <button type="button" id="addSource" class="primary">+ Link hinzufügen</button>
        </div>
        <div id="sourceList" class="field-grid"></div>

        <div class="subsection">
          <div class="subsection-header">
            <h3>Importierte Texte</h3>
            <span>Herkunft der übernommenen Analyse-Texte (aus dem Import-Tab)</span>
          </div>
          <p class="muted" id="importedSourcesEmpty">Noch keine Texte importiert.</p>
          <div id="importedSourcesList" class="import-history-list"></div>
        </div>
      </section>
    `;
    }

    init(application) {
        const sourceList = this.root.querySelector("#sourceList");

        (application.sources?.importedUrls || []).forEach(source => this.addRow(sourceList, source));

        this.root.querySelector("#addSource").onclick = () => this.addRow(sourceList);

        this.renderImportedSources(application.importHistory || []);
    }

    // Schreibgeschützte Übersicht: woher stammt jeder importierte
    // Text (Quelle, betroffene Sektionen, Datum, Link) - wird im
    // Import-Tab gepflegt, hier nur angezeigt.
    renderImportedSources(history) {
        const list = this.root.querySelector("#importedSourcesList");
        const empty = this.root.querySelector("#importedSourcesEmpty");
        if (!list) return;

        empty.style.display = history.length ? "none" : "";

        list.innerHTML = history.map(entry => `
            <div class="import-history-row">
              <div class="import-history-meta">
                <strong>${this.escapeAttribute(entry.source || "Unbekannt")}</strong>
                <small>${this.escapeAttribute(this.formatDate(entry.importedAt))}</small>
                ${entry.link ? `<a href="${this.escapeAttribute(entry.link)}" target="_blank" rel="noopener">Quelle öffnen ↗</a>` : ""}
              </div>
              ${entry.applicationLink ? `<small class="import-history-sections">Möglicher Bewerbungslink (bitte prüfen): <a href="${this.escapeAttribute(entry.applicationLink)}" target="_blank" rel="noopener">${this.escapeAttribute(entry.applicationLink)}</a></small>` : ""}
              ${entry.sections?.length ? `<small class="import-history-sections">Sektion(en): ${entry.sections.map(name => this.escapeAttribute(name)).join(", ")}</small>` : ""}
            </div>
        `).join("");
    }

    formatDate(value) {
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return "";
        return parsed.toLocaleString("de-DE", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit"
        });
    }

    addRow(sourceList, source = {}) {
        if (!sourceList) return;
        const row = document.createElement("div");
        row.className = "source-row";
        row.innerHTML = `
      <div class="field"><label>Quelle</label><input class="source-name" value="${this.escapeAttribute(source.name || "")}"></div>
      <div class="field source-url-field"><label>Adresse</label><input class="source-url" value="${this.escapeAttribute(source.url || "")}" placeholder="https://..."></div>
      <label></label><button type="button" class="icon-button remove-source">×</button>
    `;
        row.querySelector(".remove-source").onclick = () => row.remove();
        sourceList.appendChild(row);
    }

    applyAnalysis() {
        // Quellen werden nicht automatisch aus der Analyse befüllt.
    }

    save(application) {
        application.sources = {
            jobPosting: this.get("jobUrl"),
            companyWebsite: this.get("website"),
            importedUrls: [...this.root.querySelectorAll("#sourceList .source-row")].map(row => ({
                name: row.querySelector(".source-name")?.value.trim() || "",
                url: row.querySelector(".source-url")?.value.trim() || ""
            })).filter(source => source.name || source.url)
        };
    }
}
