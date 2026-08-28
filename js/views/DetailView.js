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

    const renderList = items => items.length
      ? "<ul>" + items.map(item => `<li>${item}</li>`).join("") + "</ul>"
      : "<p class='muted'>Keine Angaben</p>";

    root.innerHTML = `
      <div class="toolbar">
        <button id="back">← Übersicht</button>
        <button class="primary" id="edit">Bearbeiten</button>
        <button class="danger" id="delete">Löschen</button>
      </div>

      <div class="card">
        <h1>${application.company.name || "Unbenannte Firma"}</h1>
         <p>${application.company.street || ""}<br>${application.company.zip || ""} ${application.company.city || ""}<br>${application.company.country || ""}</p>
        <p><strong>Telefon:</strong> ${application.company.phones.join(", ") || "—"}</p>
         <p><strong>E-Mail:</strong> ${application.company.emails.join(", ") || "—"}</p>
        <p><strong>Webseite:</strong> ${application.company.website || "—"}</p>
         <p><strong>Verifizierte Seite:</strong> ${application.company.verifiedAt || "—"}</p>
        <p><span class="badge">${application.remote}</span></p>
      </div>

       <div class="card">
         <h2>🏭 Firmenprofil</h2>
         <p><strong>Branche:</strong> ${application.companyInformation.industry || "—"}</p>
         <p><strong>Größe:</strong> ${application.companyInformation.size || "—"}</p>
         <p><strong>Gegründet:</strong> ${application.companyInformation.founded || "—"}</p>
         <p><strong>Spezialgebiete:</strong> ${(application.companyInformation.specialties || []).join(", ") || "—"}</p>
         <p>${application.companyInformation.description || "Keine Firmenbeschreibung vorhanden."}</p>
       </div>

       <div class="card">
         <h2>💼 Stelle</h2>
         <p><strong>Gesucht wird:</strong> ${application.job.title || "Keine Angabe"}</p>
         <p><strong>Ort:</strong> ${application.job.location || "—"}</p>
         <p><strong>Gehalt:</strong> ${application.job.salary || "Keine Angabe"}</p>
         <p><strong>Kennziffer:</strong> ${application.job.referenceNumber || "—"}</p>
       </div>

       <div class="card">
         <h2>👤 Ansprechpartner</h2>
         <p>${application.contacts[0]?.name || "Keine Angabe"}${application.contacts[0]?.role ? ` · ${application.contacts[0].role}` : ""}</p>
         <p><strong>Quelle:</strong> ${application.application.source || "Keine Angabe"}</p>
       </div>

      <div class="grid">
        <div class="card">
          <h2>📩 Bewerbung</h2>
          <p><strong>Status:</strong> ${application.application.status}</p>
          <p><strong>Datum:</strong> ${application.application.appliedAt || "—"}</p>
          <p><strong>Weg:</strong> ${application.application.method || "—"}</p>
          <p><strong>Quelle:</strong> ${application.application.source || "—"}</p>
        </div>

        <div class="card">
          <h2>🌐 Online-Portal</h2>
          <p><strong>URL:</strong> ${application.portal.url || "—"}</p>
          <p><strong>Benutzer:</strong> ${application.portal.username || "—"}</p>
          <p class="muted">Passwort wird aus Sicherheitsgründen nicht angezeigt.</p>
        </div>
      </div>

      <div class="card section"><h2>🧠 Fähigkeiten</h2>${renderList(application.skills)}</div>
      <div class="card section"><h2>💻 Welche Arbeiten werden gemacht?</h2>${renderList(application.tasks)}</div>
       <div class="card section"><h2>🏭 Was macht die Firma?</h2><p>${application.companyInformation.description || "Keine Angaben"}</p></div>
       <div class="card section"><h2>🎁 Benefits</h2>${renderList(application.benefits)}</div>
       <div class="card section"><h2>🌐 Social – Benefits</h2>${renderList(application.social?.benefits || [])}</div>
       <div class="card section"><h2>🌱 Social Impact</h2>${renderList(application.social?.impact || [])}</div>
       <div class="card section"><h2>🔎 Im Fokus</h2>${renderList(application.social?.focus || [])}</div>
      <div class="card section"><h2>📝 Übriges</h2><p>${application.notes || "Keine Angaben"}</p></div>

      <div class="card section">
        <h2>📄 Original-Stellenanzeige</h2>
        <pre>${application.originalText || "Keine Angaben"}</pre>
      </div>
    `;

    root.querySelector("#back").onclick = () => location.hash = "#/";
    root.querySelector("#edit").onclick = () => location.hash = "#/edit/" + application.id;

    root.querySelector("#delete").onclick = () => {
      if (confirm("Bewerbung wirklich löschen?")) {
        this.repository.delete(application.id);
        location.hash = "#/";
      }
    };
  }
}