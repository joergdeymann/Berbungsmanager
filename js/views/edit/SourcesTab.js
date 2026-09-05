import { BaseEditTab } from "./BaseEditTab.js";

export class SourcesTab extends BaseEditTab {
    render() {
        return `
      <section id="section-sources" class="tab-content" style="display:none;">
        <div class="section-header">
          <div><span class="section-icon">🔗</span><h2>Quellen & Links</h2></div>
          <button type="button" id="addSource" class="button primary">+ Link hinzufügen</button>
        </div>
        <div id="sourceList" class="field-grid"></div>
      </section>
    `;
    }

    init(application) {
        const sourceList = this.root.querySelector("#sourceList");

        (application.sources?.importedUrls || []).forEach(source => this.addRow(sourceList, source));

        this.root.querySelector("#addSource").onclick = () => this.addRow(sourceList);
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
