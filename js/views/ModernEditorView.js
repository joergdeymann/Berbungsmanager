import { Application } from "../models/Application.js";
import { ApplicationAnalyzer } from "../services/analysis/ApplicationAnalyzer.js";

const STATUSES = [
  "Nicht beworben",
  "Beworben",
  "Eingangsbestätigung",
  "Rückruf erhalten",
  "Angenommen",
  "Abgelehnt"
];

export class EditorView {
  constructor(repository, id = null) {
    this.repository = repository;
    this.id = id;
    this.analyzer = new ApplicationAnalyzer();
  }

  formatDate(date) {
    if (!date) return "";
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? date : parsed.toISOString().split("T")[0];
  }

  async render(root) {
    const application = this.id ? this.repository.getById(this.id) : new Application();
    if (!application) {
      location.hash = "#/";
      return;
    }

    const templateUrl = new URL("../templates/ModernEditorView.html", import.meta.url);
    const response = await fetch(templateUrl);
    if (!response.ok) {
      console.error(`HTML-Template konnte nicht geladen werden: ${response.statusText}`);
      return;
    }

    const htmlText = await response.text();
    const doc = new DOMParser().parseFromString(htmlText, "text/html");
    const templateContent = doc.body;

    const editorContainer = document.createElement("div");
    editorContainer.className = "editor-tab-container";
    editorContainer.innerHTML = `
      <header class="header header2">
        <nav class="detail-navigation editor-navigation">
          <button type="button" class="tab-button active" data-target="section-import">Import</button>
          <button type="button" class="tab-button" data-target="section-company">Firma</button>
          <button type="button" class="tab-button" data-target="section-contact">Ansprechpartner</button>
          <button type="button" class="tab-button" data-target="section-job">Stelle</button>
          <button type="button" class="tab-button" data-target="section-requirements">Anforderungen</button>
          <button type="button" class="tab-button" data-target="section-benefits">Benefits</button>
          <button type="button" class="tab-button" data-target="section-sources">Quellen</button>
          <button type="button" class="tab-button" data-target="section-application">Bewerbung</button>
          <button type="button" class="tab-button" data-target="section-output">Ausgabe</button>
        </nav>
      </header>

      <main id="editorTabContent">
        <!-- IMPORT -->
        <section id="section-import" class="tab-content active-content">
          <div class="section-header">
            <div><span class="section-icon">📥</span><h2>Import / Originaltext</h2></div>
            <button type="button" id="clearOriginalText" class="button button-secondary">Text löschen</button>
            <button type="button" id="analyze" class="button button-primary">Analyse starten</button>
          </div>
          <textarea id="originalText" rows="15" placeholder="Füge hier den Ausschreibungstext oder Notizen ein..."></textarea>
        </section>

        <!-- FIRMA -->
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

        <!-- ANSPRECHPARTNER -->
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

        <!-- STELLE -->
        <section id="section-job" class="tab-content" style="display:none;">
          <div class="section-header"><div><span class="section-icon">💼</span><h2>Stellendetails</h2></div></div>
          <div class="field-grid">
            <div class="field"><label>Jobtitel</label><input id="jobTitle"></div>
            <div class="field"><label>Arbeitsort</label><input id="jobLocation"></div>
            <div class="field"><label>Anstellungsart</label><input id="employmentType"></div>
            <div class="field"><label>Arbeitsmodell</label><select id="remote"></select></div>
            <div class="field"><label>Gehalt</label><input id="salary"></div>
            <div class="field"><label>Referenznummer</label><input id="referenceNumber"></div>
            <div class="field field-wide"><label>Aufgaben (Zeilengetrennt)</label><textarea id="tasks" rows="6"></textarea></div>
          </div>
        </section>

        <!-- ANFORDERUNGEN -->
        <section id="section-requirements" class="tab-content" style="display:none;">
          <div class="section-header"><div><span class="section-icon">📜</span><h2>Anforderungen & Qualifikationen</h2></div></div>
          <div class="field-grid">
            <div class="field field-wide"><label>Zwingende Qualifikationen (Zeilengetrennt)</label><textarea id="requiredQualifications" rows="4"></textarea></div>
            <div class="field field-wide"><label>Gewünschte Qualifikationen (Zeilengetrennt)</label><textarea id="preferredQualifications" rows="4"></textarea></div>
            <div class="field field-wide"><label>Persönliche Stärken (Zeilengetrennt)</label><textarea id="personalQualifications" rows="4"></textarea></div>
            <div class="field field-wide"><label>Skills / Skills-Liste (Zeilengetrennt)</label><textarea id="skills" rows="4"></textarea></div>
          </div>
        </section>

        <!-- BENEFITS -->
        <section id="section-benefits" class="tab-content" style="display:none;">
          <div class="section-header">
            <div><span class="section-icon">🎁</span><h2>Benefits / Zusatzleistungen</h2></div>
            <button type="button" class="button add-benefit">+ Benefit hinzufügen</button>
          </div>
          <div class="field-grid">
            <div class="field field-wide"><label>Benefits Freitext (Zeilengetrennt)</label><textarea id="benefits" rows="6"></textarea></div>
          </div>
          <div id="benefitsContainer" class="subsection-grid"></div>
        </section>

        <!-- QUELLEN -->
        <section id="section-sources" class="tab-content" style="display:none;">
          <div class="section-header">
            <div><span class="section-icon">🔗</span><h2>Quellen & Links</h2></div>
            <button type="button" id="addSource" class="button">+ Link hinzufügen</button>
          </div>
          <div id="sourceList" class="field-grid"></div>
        </section>

        <!-- BEWERBUNG -->
        <section id="section-application" class="tab-content" style="display:none;">
          <div class="section-header"><div><span class="section-icon">📤</span><h2>Bewerbungsstatus & Unterlagen</h2></div></div>
          <div class="field-grid">
            <div class="field"><label>Status</label><select id="status">${STATUSES.map(status => `<option value="${status}">${status}</option>`).join("")}</select></div>
            <div class="field"><label>Beworben am</label><input type="date" id="appliedAt"></div>
            <div class="field"><label>Bewerbungsweg</label><input id="method" placeholder="E-Mail, Portal, persönlich ..."></div>
            <div class="field"><label>Quelle</label><input id="source" placeholder="LinkedIn, Indeed..."></div>
            <div class="field field-wide"><label>Link zur Stellenanzeige</label><input id="jobUrl" placeholder="https://..."></div>
            <div class="field field-wide"><label>Portal-Adresse</label><input id="portalUrl" placeholder="https://..."></div>
            <div class="field"><label>Portal Benutzername</label><input id="portalUser"></div>
            <div class="field"><label>Portal Passwort</label><input type="password" id="portalPassword"></div>
            <div class="field field-wide"><label>Anschreiben – URL oder Dateipfad</label><input id="coverLetter" placeholder="file:///... oder https://..."></div>
            <div class="field field-wide"><label>Lebenslauf – URL oder Dateipfad</label><input id="resume" placeholder="file:///... oder https://..."></div>
          </div>
        </section>

        <!-- AUSGABE / NOTIZEN -->
        <section id="section-output" class="tab-content" style="display:none;">
          <div class="section-header"><div><span class="section-icon">📝</span><h2>Ausgabe & Notizen</h2></div></div>
          <div class="field-grid">
            <div class="field field-wide"><label>Stellenbeschreibung Komplett-Text</label><textarea id="jobDescription" rows="8"></textarea></div>
            <div class="field field-wide"><label>Interne Notizen</label><textarea id="notes" rows="6" placeholder="Gesprächsnotizen, To-Dos..."></textarea></div>
          </div>
        </section>
      </main>

      <footer class="editor-footer">
        <button type="button" id="back" class="button button-secondary">Zurück</button>
        <button type="button" id="save" class="button button-success">Speichern</button>
      </footer>
    `;

    root.innerHTML = "";
    root.appendChild(editorContainer);

    const get = id => root.querySelector("#" + id)?.value || "";
    const set = (id, value) => {
      const element = root.querySelector("#" + id);
      if (element) element.value = value ?? "";
    };
    const list = id => get(id).split("\n").map(x => x.trim()).filter(Boolean);

    const remote = root.querySelector("#remote");
    if (remote) {
      remote.innerHTML = ["Unbekannt", "Vor Ort", "Hybrid", "Remote"].map(v => `<option value="\${v}">\${v}</option>`).join("");
    }

    set("originalText", application.originalText);
    set("companyName", application.company?.name);
    set("industry", application.companyInformation?.industry);
    set("companySize", application.companyInformation?.size);
    set("founded", application.companyInformation?.founded);
    set("website", application.company?.website);
    set("street", application.company?.street);
    set("zip", application.company?.zip);
    set("city", application.company?.city);
    set("country", application.company?.country);
    set("phones", (application.company?.phones || []).join("\n"));
    set("emails", (application.company?.emails || []).join("\n"));
    set("verifiedAt", application.company?.verifiedAt || application.companyInformation?.verifiedAt);
    set("companyDescription", application.companyInformation?.description);
    set("tasks", (application.tasks || []).join("\n"));
    set("specialties", (application.companyInformation?.specialties || []).join("\n"));
    set("contactName", application.contacts?.[0]?.name);
    set("contactRole", application.contacts?.[0]?.role);
    set("contactEmail", application.contacts?.[0]?.email || application.company?.emails?.[0]);
    set("contactPhone", application.contacts?.[0]?.phone || application.company?.phones?.[0]);
    set("jobTitle", application.job?.title);
    set("jobLocation", application.job?.location);
    set("employmentType", application.job?.employmentType);
    if (remote) remote.value = application.job?.workModel || "Unbekannt";
    set("salary", application.job?.salary);
    set("referenceNumber", application.job?.referenceNumber);
    set("jobDescription", (application.job?.description || application.tasks || []).join?.("\n") || application.job?.description || "");
    set("requiredQualifications", (application.qualifications?.required || []).join("\n"));
    set("skills", (application.skills || []).join("\n"));
    set("personalQualifications", (application.qualifications?.personal || []).join("\n"));
    set("preferredQualifications", (application.qualifications?.preferred || []).join("\n"));
    set("benefits", (application.benefits || []).join("\n"));
    set("notes", application.notes);
    set("status", application.application?.status || "Nicht beworben");
    set("appliedAt", application.application?.appliedAt);
    set("method", application.application?.method);
    set("source", application.application?.source);
    set("jobUrl", application.application?.jobUrl);
    set("portalUrl", application.portal?.url);
    set("portalUser", application.portal?.username);
    set("portalPassword", application.portal?.password);
    set("coverLetter", application.documents?.coverLetter);
    set("resume", application.documents?.resume);

    const sourceList = root.querySelector("#sourceList");
    if (sourceList && application.sources?.importedUrls?.length) {
      sourceList.innerHTML = application.sources.importedUrls.map(source => `
        <div class="source-row">
          <div class="field"><label>Quelle</label><input class="source-name" value="\${this.escapeAttribute(source.name || "")}"></div>
          <div class="field source-url-field"><label>Adresse</label><input class="source-url" value="\${this.escapeAttribute(source.url || "")}" placeholder="https://..."></div>
          <label></label><button type="button" class="icon-button remove-source">×</button>
        </div>`).join("");
    }

    this.bindTabNavigation(root);
    this.bindDynamicFields(root);

    root.querySelector("#back").onclick = () => location.hash = "#/";
    root.querySelector("#clearOriginalText").onclick = () => set("originalText", "");
    root.querySelector("#analyze").onclick = () => this.applyAnalysis(root, get("originalText"));
    root.querySelector("#save").onclick = () => this.save(root, application, get, list);
  }

  bindTabNavigation(root) {
    const buttons = root.querySelectorAll(".editor-navigation .tab-button");
    const contents = root.querySelectorAll("#editorTabContent .tab-content");

    buttons.forEach(button => {
      button.onclick = () => {
        const targetId = button.getAttribute("data-target");

        buttons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        contents.forEach(content => {
          if (content.id === targetId) {
            content.style.display = "";
            content.classList.add("active-content");
          } else {
            content.style.display = "none";
            content.classList.remove("active-content");
          }
        });
      };
    });
  }

  applyAnalysis(root, text) {
    const result = this.analyzer.analyze(text);
    const set = (id, value) => {
      const element = root.querySelector("#" + id);
      if (element) element.value = value ?? "";
    };
    const join = value => (value || []).join("\n");

    set("companyName", result.companyName);
    set("street", result.company?.street);
    set("zip", result.company?.zip);
    set("city", result.company?.city);
    set("country", result.company?.country);
    set("website", result.company?.website);
    set("verifiedAt", this.formatDate(result.company?.verifiedAt));
    set("industry", result.companyInformation?.industry);
    set("companySize", result.companyInformation?.size);
    set("founded", result.companyInformation?.founded);
    set("specialties", join(result.companyInformation?.specialties));
    set("jobTitle", result.job?.title);
    set("jobLocation", result.job?.location);
    set("employmentType", result.job?.employmentType);
    set("salary", result.job?.salary);
    set("referenceNumber", result.job?.referenceNumber);
    set("contactName", result.contact?.name);
    set("contactRole", result.contact?.role);
    set("phones", join(result.phones));
    set("emails", join(result.emails));
    set("tasks", join(result.tasks));
    set("skills", join(result.skills));
    set("requiredQualifications", join(result.qualifications?.required));
    set("preferredQualifications", join(result.qualifications?.preferred));
    set("personalQualifications", join(result.qualifications?.personal));
    set("companyDescription", result.companyInformation?.description);
    set("benefits", join(result.benefits));
    if (!root.querySelector("#source")?.value) set("source", result.source);
    if (!root.querySelector("#contactEmail")?.value && result.emails?.length) set("contactEmail", result.emails[0]);
    if (!root.querySelector("#contactPhone")?.value && result.phones?.length) set("contactPhone", result.phones[0]);
    if (result.job?.workModel && result.job.workModel !== "Unbekannt") set("remote", result.job.workModel);
  }

  save(root, application, get, list) {
    application.originalText = get("originalText");
    application.company = {
      name: get("companyName"), street: get("street"), zip: get("zip"), city: get("city"), country: get("country"),
      website: get("website"), verifiedAt: get("verifiedAt"), phones: list("phones"), emails: list("emails")
    };
    application.companyInformation = {
      ...application.companyInformation,
      description: get("companyDescription"), industry: get("industry"), size: get("companySize"),
      founded: get("founded"), verifiedAt: get("verifiedAt"), specialties: list("specialties")
    };
    application.job = {
      ...application.job,
      title: get("jobTitle"), location: get("jobLocation"), employmentType: get("employmentType"),
      workModel: get("remote"), salary: get("salary"), referenceNumber: get("referenceNumber"), description: get("jobDescription")
    };
    application.contacts = get("contactName") || get("contactRole") || get("contactEmail") || get("contactPhone")
      ? [{ name: get("contactName"), role: get("contactRole"), email: get("contactEmail"), phone: get("contactPhone") }]
      : [];
    application.application = {
      ...application.application,
      status: get("status") || "Nicht beworben",
      appliedAt: get("appliedAt"), method: get("method"), source: get("source"), jobUrl: get("jobUrl")
    };
    application.portal = { url: get("portalUrl"), username: get("portalUser"), password: get("portalPassword") };
    application.documents = { coverLetter: get("coverLetter"), resume: get("resume") };

    application.sources = {
      jobPosting: get("jobUrl"),
      companyWebsite: get("website"),
      importedUrls: [...root.querySelectorAll("#sourceList .source-row")].map(row => ({
        name: row.querySelector(".source-name")?.value.trim() || "",
        url: row.querySelector(".source-url")?.value.trim() || ""
      })).filter(source => source.name || source.url)
    };
    application.skills = list("skills");
    application.tasks = list("tasks");
    application.qualifications = {
      required: list("requiredQualifications"), preferred: list("preferredQualifications"), personal: list("personalQualifications")
    };
    application.benefits = list("benefits");
    application.social = application.social || { benefits: [], impact: [], focus: [] };
    application.social.benefits = application.social.benefits?.length ? application.social.benefits : application.benefits;
    application.notes = get("notes");

    this.repository.save(application);
    location.hash = "#/detail/" + encodeURIComponent(application.id);
  }

  escapeAttribute(value) {
    return String(value ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  bindDynamicFields(root) {
    root.querySelectorAll(".remove-source").forEach(button => button.onclick = () => button.closest(".source-row")?.remove());
    root.querySelector("#addSource")?.addEventListener("click", () => {
      const list = root.querySelector("#sourceList");
      if (!list) return;
      const row = document.createElement("div");
      row.className = "source-row";
      row.innerHTML = `<div class="field"><label>Quelle</label><input class="source-name"></div><div class="field source-url-field"><label>Adresse</label><input class="source-url" placeholder="https://..."></div><label></label><button type="button" class="icon-button remove-source">×</button>`;
      row.querySelector(".remove-source").onclick = () => row.remove();
      list.appendChild(row);
    });

    root.querySelectorAll(".add-benefit").forEach(button => {
      button.onclick = () => {
        const container = root.querySelector("#benefitsContainer");
        if (!container) return;
        const item = document.createElement("div");
        item.className = "benefit-item";
        item.innerHTML = `<div class="benefit-icon">🎁</div><div class="benefit-content"><input class="benefit-title" placeholder="Benefit"><textarea rows="3" placeholder="Beschreibung des Benefits"></textarea></div><button type="button" class="icon-button remove-benefit">×</button>`;
        item.querySelector(".remove-benefit").onclick = () => item.remove();
        container.appendChild(item);
      };
    });
  }
}
