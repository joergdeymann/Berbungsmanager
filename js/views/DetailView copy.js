function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const STATUS_CLASS = {
  "Nicht beworben": "status-draft",
  "Beworben": "status-applied",
  "Eingangsbestätigung": "status-confirmed",
  "Rückruf erhalten": "status-callback",
  "Angenommen": "status-accepted",
  "Abgelehnt": "status-rejected"
};

export class DetailView {
  constructor(repository, id) {
    this.repository = repository;
    this.id = id;
  }

  render(root) {
    const application = this.repository.getById(this.id);
    if (!application) {
      location.hash = "#/";
      return;
    }

    const list = items => items?.length
      ? `<ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
      : `<p class="muted">Keine Angaben</p>`;

    const contact = application.contacts?.[0] || {};
    const status = application.application?.status || "Nicht beworben";
    const communication = application.communication || [];

    root.innerHTML = `
    <header class="header header2 pb-0">
      <span class="status-badge ${STATUS_CLASS[status] || "status-draft"}">${escapeHtml(status)}</span>
      <div class="shrink-to-left">
          <h1>${escapeHtml(application.company?.name || "Unbenannte Firma")}</h1>
          <p>${escapeHtml(application.job?.title || "Keine Stelle angegeben")}</p>
      </div>
      <nav class="header-detail-view">  
        <button class="primary" data-route="#/edit/${encodeURIComponent(application.id)}">Bearbeiten</button>
        <button class="danger" data-route="#/delete/${encodeURIComponent(application.id)}">Löschen</button>
      </nav>
    </header>
    <header class="header header2">
      <nav>
        <button type="button" onclick="location.hash='company'">Firma</button>
        <button type="button" onclick="location.hash='contact'">Ansprechpartner</button>
        <button type="button" onclick="location.hash='job'">Stelle</button>
        <button type="button" onclick="location.hash='requirements'">Anforderungen</button>
        <button type="button" onclick="location.hash='benefits'">Benefits</button>
        <button type="button" onclick="location.hash='sources'">Quellen</button>
        <button type="button" onclick="location.hash='application'">Bewerbung & Ausgabe</button>
        <button type="button" onclick="location.hash='communication'">Telefonate</button>
      </nav>
    </header>
    <div id="detailContent"></div>
    



      <section class="card section" id="company">
        <h2>🏢 Firmeninformation</h2>
        <p><strong>Firma:</strong> ${escapeHtml(application.company?.name || "—")}</p>
        <p><strong>Adresse:</strong><br>${escapeHtml(application.company?.street || "")}<br>${escapeHtml(application.company?.zip || "")} ${escapeHtml(application.company?.city || "")}<br>${escapeHtml(application.company?.country || "")}</p>
        <p><strong>Webseite:</strong> ${this.link(application.company?.website)}</p>
        <p><strong>Branche:</strong> ${escapeHtml(application.companyInformation?.industry || "—")}</p>
        <p><strong>Größe:</strong> ${escapeHtml(application.companyInformation?.size || "—")}</p>
        <p><strong>Gegründet:</strong> ${escapeHtml(application.companyInformation?.founded || "—")}</p>
        <p><strong>Spezialisierungen:</strong> ${escapeHtml((application.companyInformation?.specialties || []).join(", ") || "—")}</p>
        <p>${escapeHtml(application.companyInformation?.description || "Keine Firmenbeschreibung vorhanden.")}</p>
      </section>

      <section class="card section" id="contact">
        <h2>👤 Ansprechpartner</h2>
        <p><strong>Name:</strong> ${escapeHtml(contact.name || "—")}</p>
        <p><strong>Position:</strong> ${escapeHtml(contact.role || "—")}</p>
        <p><strong>E-Mail:</strong> ${escapeHtml(contact.email || application.company?.emails?.[0] || "—")}</p>
        <p><strong>Telefon:</strong> ${escapeHtml(contact.phone || application.company?.phones?.[0] || "—")}</p>
      </section>

      <section class="card section" id="job">
        <h2>💼 Stelle</h2>
        <p><strong>Gesuchte Stelle:</strong> ${escapeHtml(application.job?.title || "—")}</p>
        <p><strong>Arbeitsort:</strong> ${escapeHtml(application.job?.location || "—")}</p>
        <p><strong>Beschäftigungsart:</strong> ${escapeHtml(application.job?.employmentType || "—")}</p>
        <p><strong>Arbeitsmodell:</strong> ${escapeHtml(application.job?.workModel || "—")}</p>
        <p><strong>Gehalt:</strong> ${escapeHtml(application.job?.salary || "—")}</p>
        <p><strong>Kennziffer:</strong> ${escapeHtml(application.job?.referenceNumber || "—")}</p>
        <p><strong>Beschreibung:</strong></p>
        ${list(application.tasks)}
      </section>

      <section class="card section" id="requirements">
        <h2>🎯 Anforderungen</h2>
        <h3>Muss-Anforderungen</h3>${list(application.qualifications?.required)}
        <h3>Fachliche Fähigkeiten / Technologien</h3>${list(application.skills)}
        <h3>Persönliche Anforderungen</h3>${list(application.qualifications?.personal)}
        <h3>Wünschenswerte Kenntnisse</h3>${list(application.qualifications?.preferred)}
      </section>

      <section class="card section" id="benefits">
        <h2>🎁 Benefits</h2>${list(application.benefits)}
      </section>

      <section class="card section" id="sources">
        <h2>🌐 Quellen</h2>
        <p><strong>Stellenanzeige:</strong> ${this.link(application.sources?.jobPosting || application.application?.jobUrl)}</p>
        <p><strong>Unternehmensseite:</strong> ${this.link(application.sources?.companyWebsite || application.company?.website)}</p>
        ${application.sources?.importedUrls?.length ? list(application.sources.importedUrls) : ""}
        <p><strong>Quelle:</strong> ${escapeHtml(application.application?.source || "—")}</p>
      </section>

      <section class="card section" id="application">
        <h2>📤 Bewerbung & Ausgabe</h2>
        <div class="detail-grid">
          <div>
            <p><strong>Status:</strong> <span class="status-badge ${STATUS_CLASS[status] || "status-draft"}">${escapeHtml(status)}</span></p>
            <p><strong>Beworben am:</strong> ${escapeHtml(application.application?.appliedAt || "—")}</p>
            <p><strong>Bewerbungsweg:</strong> ${escapeHtml(application.application?.method || "—")}</p>
          </div>
          <div>
            <p><strong>Portal:</strong> ${this.link(application.portal?.url)}</p>
            <p><strong>Benutzer:</strong> ${escapeHtml(application.portal?.username || "—")}</p>
          </div>
        </div>
        <h3>Unterlagen</h3>
        <div class="document-actions">
          ${this.documentButton("Anschreiben", application.documents?.coverLetter)}
          ${this.documentButton("Lebenslauf", application.documents?.resume)}
        </div>
        <p class="muted">Die Unterlagen werden über den hinterlegten Pfad bzw. die URL geöffnet. Das automatische Öffnen des Windows-Explorers ist aus einer normalen Browser-Anwendung nicht zuverlässig möglich.</p>
      </section>

      <section class="card section" id="communication">
        <h2>📞 Telefonate / Kommunikation</h2>
        <div id="communicationList">
          ${communication.length ? communication.map(item => this.communicationItem(item)).join("") : `<p class="muted">Noch keine Telefonnotizen vorhanden.</p>`}
        </div>
        <div class="communication-add">
          <textarea id="communicationText" rows="4" placeholder="Informationen zum Telefonat eingeben ..."></textarea>
          <button class="primary" id="addCommunication">Telefonat speichern</button>
        </div>
      </section>

      <section class="card section">
        <h2>📝 Notizen</h2>
        <p>${escapeHtml(application.notes || "Keine Angaben")}</p>
      </section>

      <section class="card section">
        <h2>📄 Original-Stellenanzeige</h2>
        <pre>${escapeHtml(application.originalText || "Keine Angaben")}</pre>
      </section>
    `;

    root.querySelector("#back").onclick = () => location.hash = "#/";
    root.querySelector("#edit").onclick = () => location.hash = "#/edit/" + encodeURIComponent(application.id);
    root.querySelector("#delete").onclick = () => {
      if (confirm("Bewerbung wirklich löschen?")) {
        this.repository.delete(application.id);
        location.hash = "#/";
      }
    };

    root.querySelector("#addCommunication").onclick = () => {
      const textarea = root.querySelector("#communicationText");
      const text = textarea.value.trim();
      if (!text) return;
      application.communication = application.communication || [];
      application.communication.push({
        id: crypto.randomUUID(),
        type: "Telefonat",
        text,
        date: new Date().toISOString()
      });
      this.repository.save(application);
      this.render(root);
    };

    root.querySelectorAll("[data-edit-communication]").forEach(button => {
      button.onclick = () => {
        const entry = application.communication.find(item => item.id === button.dataset.editCommunication);
        if (!entry) return;
        const value = prompt("Telefonnotiz bearbeiten:", entry.text);
        if (value === null) return;
        entry.text = value.trim();
        this.repository.save(application);
        this.render(root);
      };
    });
  }

  communicationItem(item) {
    const date = item.date ? new Date(item.date).toLocaleString("de-DE") : "";
    return `<div class="communication-item"><div><strong>${escapeHtml(item.type || "Notiz")}</strong><small>${escapeHtml(date)}</small></div><p>${escapeHtml(item.text)}</p><button data-edit-communication="${escapeHtml(item.id)}">Ändern</button></div>`;
  }

  link(url) {
    if (!url) return "—";
    const safe = escapeHtml(url);
    return `<a href="${safe}" target="_blank" rel="noopener">${safe}</a>`;
  }

  documentButton(label, url) {
    if (!url) return `<span class="muted">${label}: nicht hinterlegt</span>`;
    const safe = escapeHtml(url);
    return `<a class="output-action" href="${safe}" target="_blank" rel="noopener">📄 ${label} öffnen</a>`;
  }
}
