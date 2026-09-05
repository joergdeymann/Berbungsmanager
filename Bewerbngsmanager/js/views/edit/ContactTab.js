import { BaseEditTab } from "./BaseEditTab.js";

export class ContactTab extends BaseEditTab {
  render() {
    return `
      <section id="section-contact" class="tab-content" style="display:none;">
        <div class="section-header"><div><span class="section-icon">👤</span><h2>Ansprechpartner & Erreichbarkeit</h2></div></div>
        <div class="field-grid">
          <div class="field"><label>Name</label><input id="contactName"></div>
          <div class="field"><label>Rolle / Position</label><input id="contactRole"></div>
          <div class="field"><label>Direkte E-Mail</label><input id="contactEmail"></div>
          <div class="field"><label>Direkte Telefonnummer</label><input id="contactPhone"></div>
          <div class="field"><label>Zentrale Telefonnummern (Zeilengetrennt)</label><textarea id="phones" rows="3"></textarea></div>
          <div class="field"><label>Zentrale E-Mails (Zeilengetrennt)</label><textarea id="emails" rows="3"></textarea></div>
        </div>
      </section>
    `;
  }

  init(application) {
    this.set("contactName", application.contacts?.[0]?.name);
    this.set("contactRole", application.contacts?.[0]?.role);
    this.set("contactEmail", application.contacts?.[0]?.email || application.company?.emails?.[0]);
    this.set("contactPhone", application.contacts?.[0]?.phone || application.company?.phones?.[0]);
    this.set("phones", (application.company?.phones || []).join("\n"));
    this.set("emails", (application.company?.emails || []).join("\n"));
  }

  applyAnalysis(result) {
    this.set("contactName", result.contact?.name);
    this.set("contactRole", result.contact?.role);
    this.set("phones", (result.phones || []).join("\n"));
    this.set("emails", (result.emails || []).join("\n"));

    if (!this.root.querySelector("#contactEmail")?.value && result.emails?.length) {
      this.set("contactEmail", result.emails[0]);
    }
    if (!this.root.querySelector("#contactPhone")?.value && result.phones?.length) {
      this.set("contactPhone", result.phones[0]);
    }
  }

  save(application) {
    application.contacts = this.get("contactName") || this.get("contactRole") || this.get("contactEmail") || this.get("contactPhone")
      ? [{
          name: this.get("contactName"),
          role: this.get("contactRole"),
          email: this.get("contactEmail"),
          phone: this.get("contactPhone")
        }]
      : [];

    // phones/emails gehören inhaltlich zur Firma, werden aber hier im Ansprechpartner-Tab erfasst.
    application.company = {
      ...application.company,
      phones: this.list("phones"),
      emails: this.list("emails")
    };
  }
}
