import { BaseEditTab } from "./BaseEditTab.js";
import { ImageGallery } from "./ImageGallery.js";

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

        <div class="subsection">
          <div class="subsection-header">
            <h3>Bilder zum Ansprechpartner</h3>
            <span>Das Hauptbild (★) gehört zur oben eingetragenen Person und wird zuerst angezeigt. Klick auf ein anderes Bild macht es zum Hauptbild.</span>
          </div>
          <div id="contactImages"></div>
        </div>
      </section>
    `;
  }

  init(application) {
    const contact = application.contacts?.[0] || {};
    this.set("contactName", contact.name);
    this.set("contactRole", contact.role);
    this.set("contactEmail", contact.email || application.company?.emails?.[0]);
    this.set("contactPhone", contact.phone || application.company?.phones?.[0]);
    this.set("phones", (application.company?.phones || []).join("\n"));
    this.set("emails", (application.company?.emails || []).join("\n"));

    this.imageGallery = new ImageGallery(this.root.querySelector("#contactImages"), { showNames: true });
    this.imageGallery.setImages(contact.images || []);
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

    // Der wichtige Ansprechpartner (Name stimmt mit dem oben
    // eingetragenen überein) steht oben und wird als Hauptbild
    // markiert; andere gefundene Personen bleiben als Vorschläge
    // in der Galerie.
    const contactName = (result.contact?.name || "").toLowerCase();
    (result.companyInformation?.peopleImages || result.contact?.images || []).forEach(person => {
      const isMatch = contactName && person.name && (
        contactName.includes(person.name.toLowerCase()) ||
        person.name.toLowerCase().includes(contactName)
      );
      this.imageGallery.addImage(person.url, person.name);
      if (isMatch) this.imageGallery.selectMain(person.url);
    });
  }

  save(application) {
    const name = this.get("contactName");
    const role = this.get("contactRole");
    const email = this.get("contactEmail");
    const phone = this.get("contactPhone");

    application.contacts = (name || role || email || phone)
      ? [{ name, role, email, phone, images: this.imageGallery.getImages() }]
      : [];

    // phones/emails gehören inhaltlich zur Firma, werden aber hier im Ansprechpartner-Tab erfasst.
    application.company = {
      ...application.company,
      phones: this.list("phones"),
      emails: this.list("emails")
    };
  }
}
