import { BaseEditTab } from "./BaseEditTab.js";

export class RequirementsTab extends BaseEditTab {
  render() {
    return `
      <section id="section-requirements" class="tab-content" style="display:none;">
        <div class="section-header"><div><span class="section-icon">📜</span><h2>Anforderungen & Qualifikationen</h2></div></div>
        <div class="field-grid">
          <div class="field field-ultra-wide"><label>Zwingende Qualifikationen (Zeilengetrennt)</label><textarea id="requiredQualifications" rows="4"></textarea></div>
          <div class="field field-ultra-wide"><label>Gewünschte Qualifikationen (Zeilengetrennt)</label><textarea id="preferredQualifications" rows="4"></textarea></div>
          <div class="field field-ultra-wide"><label>Persönliche Stärken (Zeilengetrennt)</label><textarea id="personalQualifications" rows="4"></textarea></div>
          <div class="field field-ultra-wide"><label>Skills / Skills-Liste (Zeilengetrennt)</label><textarea id="skills" rows="4"></textarea></div>
        </div>
      </section>
    `;
  }

  init(application) {
    this.set("requiredQualifications", (application.qualifications?.required || []).join("\n"));
    this.set("preferredQualifications", (application.qualifications?.preferred || []).join("\n"));
    this.set("personalQualifications", (application.qualifications?.personal || []).join("\n"));
    this.set("skills", (application.skills || []).join("\n"));
  }

  applyAnalysis(result) {
    this.set("requiredQualifications", (result.qualifications?.required || []).join("\n"));
    this.set("preferredQualifications", (result.qualifications?.preferred || []).join("\n"));
    this.set("personalQualifications", (result.qualifications?.personal || []).join("\n"));
    this.set("skills", (result.skills || []).join("\n"));
  }

  save(application) {
    application.skills = this.list("skills");
    application.qualifications = {
      required: this.list("requiredQualifications"),
      preferred: this.list("preferredQualifications"),
      personal: this.list("personalQualifications")
    };
  }
}
