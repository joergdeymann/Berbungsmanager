import { BaseEditTab } from "./BaseEditTab.js";

const WORK_MODELS = ["Unbekannt", "Vor Ort", "Hybrid", "Remote"];

export class JobTab extends BaseEditTab {
  render() {
    return `
      <section id="section-job" class="tab-content" style="display:none;">
        <div class="section-header"><div><span class="section-icon">💼</span><h2>Stellendetails</h2></div></div>
        <div class="field-grid">
          <div class="field"><label>Jobtitel</label><input id="jobTitle"></div>
          <div class="field"><label>Arbeitsort</label><input id="jobLocation"></div>
          <div class="field"><label>Anstellungsart</label><input id="employmentType"></div>
          <div class="field"><label>Arbeitsmodell</label>
            <select id="remote">${WORK_MODELS.map(model => `<option value="${model}">${model}</option>`).join("")}</select>
          </div>
          <div class="field"><label>Gehalt</label><input id="salary"></div>
          <div class="field"><label>Referenznummer</label><input id="referenceNumber"></div>
          <div class="field field-ultra-wide"><label>Aufgaben (Zeilengetrennt)</label><textarea id="tasks" rows="6"></textarea></div>
        </div>
      </section>
    `;
  }

  init(application) {
    this.set("jobTitle", application.job?.title);
    this.set("jobLocation", application.job?.location);
    this.set("employmentType", application.job?.employmentType);
    this.set("salary", application.job?.salary);
    this.set("referenceNumber", application.job?.referenceNumber);
    this.set("tasks", (application.tasks || []).join("\n"));

    const remote = this.root.querySelector("#remote");
    if (remote) remote.value = application.job?.workModel || "Unbekannt";
  }

  applyAnalysis(result) {
    this.set("jobTitle", result.job?.title);
    this.set("jobLocation", result.job?.location);
    this.set("employmentType", result.job?.employmentType);
    this.set("salary", result.job?.salary);
    this.set("referenceNumber", result.job?.referenceNumber);
    this.set("tasks", (result.tasks || []).join("\n"));

    if (result.job?.workModel && result.job.workModel !== "Unbekannt") {
      const remote = this.root.querySelector("#remote");
      if (remote) remote.value = result.job.workModel;
    }
  }

  save(application) {
    application.job = {
      ...application.job,
      title: this.get("jobTitle"),
      location: this.get("jobLocation"),
      employmentType: this.get("employmentType"),
      workModel: this.get("remote"),
      salary: this.get("salary"),
      referenceNumber: this.get("referenceNumber")
    };
    application.tasks = this.list("tasks");
  }
}
