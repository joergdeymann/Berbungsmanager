import { BaseEditTab } from "./BaseEditTab.js";

export class CompanyTab extends BaseEditTab {
  render() {
    return `
      <section id="section-company" class="tab-content" style="display:none;">
        <div class="section-header"><div><span class="section-icon">🏢</span><h2>Unternehmensdaten</h2></div></div>
        <div class="field-grid">
          <div class="field"><label>Firmenname</label><input id="companyName"></div>
          <div class="field"><label>Branche</label><input id="industry"></div>
          <div class="field"><label>Größe</label><input id="companySize"></div>
          <div class="field"><label>Gegründet</label><input id="founded"></div>
          <div class="field field-wide"><label>Website</label><input id="website"></div>
          <div class="field"><label>Straße</label><input id="street"></div>
          <div class="field"><label>PLZ</label><input id="zip"></div>
          <div class="field"><label>Stadt</label><input id="city"></div>
          <div class="field"><label>Land</label><input id="country"></div>
          <div class="field"><label>Verifiziert am</label><input type="date" id="verifiedAt"></div>
          <div class="field field-wide"><label>Firmenbeschreibung</label><textarea id="companyDescription" rows="4"></textarea></div>
          <div class="field"><label>Spezialgebiete</label><textarea id="specialties" rows="4"></textarea></div>
        </div>
      </section>
    `;
  }

  init(application) {
    this.set("companyName", application.company?.name);
    this.set("industry", application.companyInformation?.industry);
    this.set("companySize", application.companyInformation?.size);
    this.set("founded", application.companyInformation?.founded);
    this.set("website", application.company?.website);
    this.set("street", application.company?.street);
    this.set("zip", application.company?.zip);
    this.set("city", application.company?.city);
    this.set("country", application.company?.country);
    this.set("verifiedAt", application.company?.verifiedAt || application.companyInformation?.verifiedAt);
    this.set("companyDescription", application.companyInformation?.description);
    this.set("specialties", (application.companyInformation?.specialties || []).join("\n"));
  }

  applyAnalysis(result, formatDateFn) {
    this.set("companyName", result.companyName);
    this.set("street", result.company?.street);
    this.set("zip", result.company?.zip);
    this.set("city", result.company?.city);
    this.set("country", result.company?.country);
    this.set("website", result.company?.website);
    this.set("verifiedAt", formatDateFn(result.company?.verifiedAt));
    this.set("industry", result.companyInformation?.industry);
    this.set("companySize", result.companyInformation?.size);
    this.set("founded", result.companyInformation?.founded);
    this.set("specialties", (result.companyInformation?.specialties || []).join("\n"));
    this.set("companyDescription", result.companyInformation?.description);
  }

  save(application) {
    application.company = {
      ...application.company,
      name: this.get("companyName"),
      street: this.get("street"),
      zip: this.get("zip"),
      city: this.get("city"),
      country: this.get("country"),
      website: this.get("website"),
      verifiedAt: this.get("verifiedAt")
    };
    application.companyInformation = {
      ...application.companyInformation,
      description: this.get("companyDescription"),
      industry: this.get("industry"),
      size: this.get("companySize"),
      founded: this.get("founded"),
      verifiedAt: this.get("verifiedAt"),
      specialties: this.list("specialties")
    };
  }
}
