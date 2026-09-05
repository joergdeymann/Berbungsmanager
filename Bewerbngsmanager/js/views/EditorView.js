import { Application } from "../models/Application.js";
import { ApplicationAnalyzer } from "../services/analysis/ApplicationAnalyzer.js";

import { ImportTab } from "./edit/ImportTab.js";
import { CompanyTab } from "./edit/CompanyTab.js";
import { ContactTab } from "./edit/ContactTab.js";
import { JobTab } from "./edit/JobTab.js";
import { RequirementsTab } from "./edit/RequirementsTab.js";
import { BenefitsTab } from "./edit/BenefitsTab.js";
import { SourcesTab } from "./edit/SourcesTab.js";
import { ApplicationTab } from "./edit/ApplicationTab.js";
import { OutputTab } from "./edit/OutputTab.js";

const STATUSES = ["Nicht beworben", "Beworben", "Eingangsbestätigung", "Rückruf erhalten", "Angenommen", "Abgelehnt"];

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

    // Tab-Instanzen erstellen
    this.tabs = {
      import: new ImportTab(root),
      company: new CompanyTab(root),
      contact: new ContactTab(root),
      job: new JobTab(root),
      requirements: new RequirementsTab(root),
      benefits: new BenefitsTab(root),
      sources: new SourcesTab(root),
      application: new ApplicationTab(root, STATUSES),
      output: new OutputTab(root)
    };

    // Container Struktur rendern
    root.innerHTML = `
      <div class="editor-tab-container">

        <header class="app-header">
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

        <main id="editorTabContent" class="content-frame">
          ${this.tabs.import.render()}
          ${this.tabs.company.render()}
          ${this.tabs.contact.render()}
          ${this.tabs.job.render()}
          ${this.tabs.requirements.render()}
          ${this.tabs.benefits.render()}
          ${this.tabs.sources.render()}
          ${this.tabs.application.render()}
          ${this.tabs.output.render()}
        </main>

        <footer class="app-footer">
          <button type="button" id="back" class="secondary">Zurück</button>
          <button type="button" id="save" class="success">Speichern</button>
        </footer>
      </div>
    `;

    // Alle Tabs initialisieren (Werte eintragen und Event-Listener binden)
    Object.values(this.tabs).forEach(tab => tab.init(application, this.analyzer, this.applyAnalysis.bind(this)));

    // Eigene Tab-Navigation binden
    this.bindTabNavigation(root);

    root.querySelector("#back").onclick = () => location.hash = "#/";
    root.querySelector("#save").onclick = () => this.save(application);
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
          content.style.display = content.id === targetId ? "" : "none";
        });
      };
    });
  }

  applyAnalysis(result) {
    // Analyse-Ergebnisse an alle Tabs verteilen
    this.tabs.company.applyAnalysis(result, this.formatDate.bind(this));
    this.tabs.contact.applyAnalysis(result);
    this.tabs.job.applyAnalysis(result);
    this.tabs.requirements.applyAnalysis(result);
    this.tabs.benefits.applyAnalysis(result);
    this.tabs.application.applyAnalysis(result);
  }

  save(application) {
    // Sammle alle Daten aus den einzelnen Tabs
    Object.values(this.tabs).forEach(tab => tab.save(application));

    this.repository.save(application);
    location.hash = "#/detail/" + encodeURIComponent(application.id);
  }
}
