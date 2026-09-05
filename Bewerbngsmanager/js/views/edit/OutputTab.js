import { BaseEditTab } from "./BaseEditTab.js";

export class OutputTab extends BaseEditTab {
  render() {
    return `
      <section id="section-output" class="tab-content" style="display:none;">
        <div class="section-header"><div><span class="section-icon">📝</span><h2>Ausgabe & Notizen</h2></div></div>
        <div class="field-grid">
          <div class="field field-ultra-wide"><label>Stellenbeschreibung Komplett-Text</label><textarea id="jobDescription" rows="8"></textarea></div>
          <div class="field field-ultra-wide"><label>Interne Notizen</label><textarea id="notes" rows="6" placeholder="Gesprächsnotizen, To-Dos..."></textarea></div>
        </div>
      </section>
    `;
  }

  init(application) {
    this.set("jobDescription", application.job?.description || (application.tasks || []).join("\n"));
    this.set("notes", application.notes);
  }

  applyAnalysis() {
    // Wird bewusst nicht automatisch überschrieben, da hier oft manuell nachbearbeitet wird.
  }

  save(application) {
    // Läuft als letzter Tab und ergänzt application.job, das JobTab bereits gesetzt hat.
    application.job = {
      ...application.job,
      description: this.get("jobDescription")
    };
    application.notes = this.get("notes");
  }
}
