import { Application } from "../models/Application.js";
import { ApplicationAnalyzer } from "../services/analysis/ApplicationAnalyzer.js";

export class EditorView {
  constructor(repository, id = null) {
    this.repository = repository;
    this.id = id;
    this.analyzer = new ApplicationAnalyzer();
  }

  async render(root) {
    const application = this.id
      ? this.repository.getById(this.id)
      : new Application();

    if (!application) {
      location.hash = "#/";
      return;
    }

    // FIX: Holt das Template relativ zur Position dieser EditorView.js-Datei
    // '../templates/EditorView.html' wandert von der JS-Datei aus exakt in den richtigen Ordner.
    const templateUrl = new URL('../templates/EditorView.html', import.meta.url);
    const response = await fetch(templateUrl);

    if (!response.ok) {
      console.error(`HTML-Template konnte nicht geladen werden: ${response.statusText}`);
      return;
    }
    const htmlText = await response.text();
    // 1. HTML-Template asynchron einlesen
    // const response = await fetch("./views/template/EditorView.html");
    // const htmlText = await response.text();

    // HTML in ein temporäres Dokument-Fragment umwandeln
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, "text/html");
    const templateContent = doc.body;

    // Lokaler Helper, um Elemente im noch nicht eingehängten DOM anzusprechen
    const $ = selector => templateContent.querySelector(selector);

    // 2. Formular-Felder strukturiert mit den Objektdaten befüllen
    $("#viewTitle").textContent = this.id ? "Bewerbung bearbeiten" : "Neue Bewerbung";
    $("#originalText").value = application.originalText || "";

    $("#companyName").value = application.company?.name || "";
    $("#street").value = application.company?.street || "";
    $("#zip").value = application.company?.zip || "";
    $("#city").value = application.company?.city || "";
    $("#country").value = application.company?.country || "";
    $("#website").value = application.company?.website || "";
    $("#verifiedAt").value = application.company?.verifiedAt || application.companyInformation?.verifiedAt || "";
    $("#industry").value = application.companyInformation?.industry || "";
    $("#companySize").value = application.companyInformation?.size || "";
    $("#founded").value = application.companyInformation?.founded || "";

    $("#phones").value = (application.company?.phones || []).join("\n");
    $("#emails").value = (application.company?.emails || []).join("\n");

    $("#jobTitle").value = application.job?.title || "";
    $("#jobLocation").value = application.job?.location || "";
    $("#employmentType").value = application.job?.employmentType || "";
    $("#salary").value = application.job?.salary || "";
    $("#referenceNumber").value = application.job?.referenceNumber || "";

    // Selektoren dynamisch aufbauen
    $("#remote").innerHTML = ["Unbekannt", "Remote", "Hybrid", "Vor Ort"]
      .map(x => `<option ${application.remote === x ? "selected" : ""}>${x}</option>`)
      .join("");

    $("#contactName").value = application.contacts?.[0]?.name || "";
    $("#contactRole").value = application.contacts?.[0]?.role || "";

    $("#source").innerHTML = ["", "LinkedIn", "Instagram", "Indeed", "StepStone", "XING", "Unternehmenswebsite", "Sonstige"]
      .map(source => `<option value="${source}" ${application.application?.source === source ? "selected" : ""}>${source || "Bitte auswählen"}</option>`)
      .join("");

    $("#jobUrl").value = application.application?.jobUrl || "";
    $("#status").value = application.application?.status || "";
    $("#appliedAt").value = application.application?.appliedAt || "";
    $("#method").value = application.application?.method || "";

    $("#portalUrl").value = application.portal?.url || "";
    $("#portalUser").value = application.portal?.username || "";
    $("#portalPassword").value = application.portal?.password || "";

    $("#requiredQualifications").value = (application.qualifications?.required || []).join("\n");
    $("#skills").value = (application.skills || []).join("\n");
    $("#preferredQualifications").value = (application.qualifications?.preferred || []).join("\n");
    $("#personalQualifications").value = (application.qualifications?.personal || []).join("\n");

    $("#companyDescription").value = application.companyDescription || "";
    $("#tasks").value = (application.tasks || []).join("\n");
    $("#specialties").value = (application.companyInformation?.specialties || []).join("\n");
    $("#benefits").value = (application.benefits || []).join("\n");
    $("#socialBenefits").value = (application.social?.benefits || []).join("\n");
    $("#socialImpact").value = (application.social?.impact || []).join("\n");
    $("#socialFocus").value = (application.social?.focus || []).join("\n");
    $("#notes").value = application.notes || "";

    // 3. Das fertig befüllte HTML-Gerüst an das App-Root übergeben
    root.innerHTML = "";
    while (templateContent.firstChild) {
      root.appendChild(templateContent.firstChild);
    }

    // Interne Helfer für Lesezugriffe nach dem Einhängen ins Haupt-Dokument
    const get = id => root.querySelector("#" + id).value;
    const list = id => get(id).split("\n").map(x => x.trim()).filter(Boolean);

    // 4. Interaktions- & Event-Listener binden
    root.querySelector("#back").onclick = () => location.hash = "#/";

    root.querySelector("#analyze").onclick = () => {
      const result = this.analyzer.analyze(get("originalText"));

      if (result.companyName) root.querySelector("#companyName").value = result.companyName;
      if (result.company) {
        root.querySelector("#street").value = result.company.street || "";
        root.querySelector("#zip").value = result.company.zip || "";
        root.querySelector("#city").value = result.company.city || "";
        root.querySelector("#country").value = result.company.country || "";
        root.querySelector("#website").value = result.company.website || "";
        root.querySelector("#verifiedAt").value = result.company.verifiedAt || "";
        root.querySelector("#industry").value = result.companyInformation?.industry || "";
        root.querySelector("#companySize").value = result.companyInformation?.size || "";
        root.querySelector("#founded").value = result.companyInformation?.founded || "";
        root.querySelector("#specialties").value = (result.companyInformation?.specialties || []).join("\n");
      }
      if (result.job) {
        root.querySelector("#jobTitle").value = result.job.title || "";
        root.querySelector("#jobLocation").value = result.job.location || "";
        root.querySelector("#employmentType").value = result.job.employmentType || "";
        root.querySelector("#salary").value = result.job.salary || "";
        root.querySelector("#referenceNumber").value = result.job.referenceNumber || "";
      }
      if (result.contact) {
        root.querySelector("#contactName").value = result.contact.name || "";
        root.querySelector("#contactRole").value = result.contact.role || "";
      }
      if (result.source) root.querySelector("#source").value = result.source;
      if (result.job?.workModel && result.job.workModel !== "Unbekannt") {
        root.querySelector("#remote").value = result.job.workModel;
      }

      root.querySelector("#phones").value = (result.phones || []).join("\n");
      root.querySelector("#tasks").value = (result.tasks || []).join("\n");
      root.querySelector("#skills").value = (result.skills || []).join("\n");
      root.querySelector("#emails").value = (result.emails || []).join("\n");
      root.querySelector("#requiredQualifications").value = (result.qualifications?.required || []).join("\n");
      root.querySelector("#preferredQualifications").value = (result.qualifications?.preferred || []).join("\n");
      root.querySelector("#personalQualifications").value = (result.qualifications?.personal || []).join("\n");
      root.querySelector("#companyDescription").value = result.companyInformation?.description || "";
      root.querySelector("#socialBenefits").value = (result.social?.benefits || result.benefits || []).join("\n");
      root.querySelector("#socialImpact").value = (result.social?.impact || []).join("\n");
      root.querySelector("#socialFocus").value = (result.social?.focus || []).join("\n");
      root.querySelector("#benefits").value = (result.benefits || []).join("\n");

      if (result.emails?.length) {
        alert("Erkannte E-Mail-Adressen:\n" + result.emails.join("\n"));
      }
    };

    root.querySelector("#save").onclick = () => {
      application.originalText = get("originalText");

      application.company = {
        name: get("companyName"),
        street: get("street"),
        zip: get("zip"),
        city: get("city"),
        country: get("country"),
        website: get("website"),
        verifiedAt: get("verifiedAt"),
        phones: list("phones"),
        emails: list("emails")
      };

      application.remote = get("remote");
      application.job = {
        ...application.job,
        title: get("jobTitle"),
        location: get("jobLocation"),
        employmentType: get("employmentType"),
        salary: get("salary"),
        referenceNumber: get("referenceNumber")
      };
      application.contacts = [{
        name: get("contactName"),
        role: get("contactRole")
      }].filter(contact => contact.name || contact.role);

      application.application = {
        status: get("status"),
        appliedAt: get("appliedAt"),
        method: get("method"),
        source: get("source"),
        jobUrl: get("jobUrl")
      };

      application.portal = {
        url: get("portalUrl"),
        username: get("portalUser"),
        password: get("portalPassword")
      };

      application.skills = list("skills");
      application.tasks = list("tasks");
      application.companyInformation.description = get("companyDescription");
      application.companyInformation.industry = get("industry");
      application.companyInformation.size = get("companySize");
      application.companyInformation.verifiedAt = get("verifiedAt");
      application.companyInformation.founded = get("founded");
      application.companyInformation.specialties = list("specialties");
      application.benefits = list("benefits");
      application.social = {
        benefits: list("socialBenefits"), impact: list("socialImpact"), focus: list("socialFocus")
      };

      if (!application.social.benefits.length) {
        application.social.benefits = application.benefits; 
      } 
      
      application.notes = get("notes"); 
      application.qualifications = { 
        required: list("requiredQualifications"), 
        preferred: list("preferredQualifications"), 
        personal: list("personalQualifications") 
      }; 
      
      this.repository.save(application); 
      location.hash = "#/detail/" + application.id;
    };
  }
}
