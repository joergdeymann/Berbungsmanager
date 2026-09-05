import { BaseEditTab } from "./BaseEditTab.js";

export class ImportTab extends BaseEditTab {
    render() {
        return `
      <section id="section-import" class="tab-content tab-section">
        <div class="section-header">
          <div><span class="section-icon import-adjust">📥</span><h2>Import / Originaltext</h2></div>
          <span>
                <button type="button" id="clearOriginalText" class="button danger">Text löschen</button>
                <button type="button" id="analyze" class="button primary">Analyse starten</button>
          </span>
        </div>
        <textarea id="originalText" placeholder="Füge hier den Ausschreibungstext oder Notizen ein...""></textarea>
      </section>
    `;
    }

    init(application, analyzer, applyAnalysis) {
        this.set("originalText", application.originalText);

        this.root.querySelector("#clearOriginalText").onclick = () => this.set("originalText", "");

        this.root.querySelector("#analyze").onclick = () => {
            const result = analyzer.analyze(this.get("originalText"));
            applyAnalysis(result);
        };
    }

    applyAnalysis() {
        // Der Originaltext selbst wird durch die Analyse nicht verändert.
    }

    save(application) {
        application.originalText = this.get("originalText");
    }
}
