import { BaseEditTab } from "./BaseEditTab.js";
import { ImageGallery } from "./ImageGallery.js";

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

        <div class="subsection">
          <div class="subsection-header">
            <h3>Bilder zur Firma</h3>
            <span>Klick auf ein Bild macht es zum Hauptbild. Weitere Bilder können per URL ergänzt werden.</span>
          </div>
          <div id="companyImages"></div>
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

    this.imageGallery = new ImageGallery(this.root.querySelector("#companyImages"));
    this.imageGallery.setImages(
      (application.companyInformation?.foundImages || []).map(url => ({ url }))
    );
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

    if (result.companyInformation?.foundImages?.length) {
      const existing = this.imageGallery.getImages().map(image => image.url);
      result.companyInformation.foundImages
        .filter(url => !existing.includes(url))
        .forEach(url => this.imageGallery.addImage(url));
    }
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
      specialties: this.list("specialties"),
      foundImages: this.imageGallery.getImages().map(image => image.url)
    };
  }
}
