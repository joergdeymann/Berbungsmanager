import { BaseEditTab } from "./BaseEditTab.js";

export class ApplicationTab extends BaseEditTab {
  constructor(root, statuses) {
    super(root);
    this.statuses = statuses;
  }

  render() {
    return `
      <section id="section-application" class="tab-content" style="display:none;">
        <div class="section-header"><div><span class="section-icon import-adjust">📤</span><h2>Bewerbungsstatus & Unterlagen</h2></div></div>
        <div class="field-grid">
          <div class="field"><label>Status</label><select id="status">${this.statuses.map(status => `<option value="${status}">${status}</option>`).join("")}</select></div>
          <div class="field"><label>Beworben am</label><input type="date" id="appliedAt"></div>
          <div class="field"><label>Bewerbungsweg</label><input id="method" placeholder="E-Mail, Portal, persönlich ..."></div>
          <div class="field"><label>Quelle</label><input id="source" placeholder="LinkedIn, Indeed..."></div>
          <div class="field field-wide"><label>Link zur Stellenanzeige</label><input id="jobUrl" placeholder="https://..."></div>
          <div class="field"><label>Portal Benutzername</label><input id="portalUser"></div>
          <div class="field field-wide"><label>Portal-Adresse</label><input id="portalUrl" placeholder="https://..."></div>
          <div class="field"><label>Portal Passwort</label><input type="password" id="portalPassword"></div>
          <div class="field field-wide"><label>Anschreiben – URL oder Dateipfad</label><input id="coverLetter" placeholder="file:///... oder https://..."></div>
          <div class="field"></div>
          <div class="field field-wide"><label>Lebenslauf – URL oder Dateipfad</label><input id="resume" placeholder="file:///... oder https://..."></div>
        </div>
      </section>
    `;
  }

  init(application) {
    this.set("status", application.application?.status || "Nicht beworben");
    this.set("appliedAt", application.application?.appliedAt);
    this.set("method", application.application?.method);
    this.set("source", application.application?.source);
    this.set("jobUrl", application.application?.jobUrl);
    this.set("portalUrl", application.portal?.url);
    this.set("portalUser", application.portal?.username);
    this.set("portalPassword", application.portal?.password);
    this.set("coverLetter", application.documents?.coverLetter);
    this.set("resume", application.documents?.resume);
  }

  applyAnalysis(result) {
    if (!this.root.querySelector("#source")?.value) this.set("source", result.source);
  }

  save(application) {
    application.application = {
      ...application.application,
      status: this.get("status") || "Nicht beworben",
      appliedAt: this.get("appliedAt"),
      method: this.get("method"),
      source: this.get("source"),
      jobUrl: this.get("jobUrl")
    };
    application.portal = {
      url: this.get("portalUrl"),
      username: this.get("portalUser"),
      password: this.get("portalPassword")
    };
    application.documents = {
      coverLetter: this.get("coverLetter"),
      resume: this.get("resume")
    };
  }
}
