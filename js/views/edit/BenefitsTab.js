import { BaseEditTab } from "./BaseEditTab.js";

export class BenefitsTab extends BaseEditTab {
  render() {
    return `
      <section id="section-benefits" class="tab-content" style="display:none;">
        <div class="section-header">
          <div><span class="section-icon">🎁</span><h2>Benefits / Zusatzleistungen</h2></div>
          <button type="button" class="button primary add-benefit">+ Benefit hinzufügen</button>
        </div>
        <div class="field-grid">
          <div class="field field-ultra-wide"><label>Benefits Freitext (Zeilengetrennt)</label><textarea id="benefits" rows="6"></textarea></div>
        </div>
        <div id="benefitsContainer" class="subsection-grid"></div>
      </section>
    `;
  }

  init(application) {
    this.set("benefits", (application.benefits || []).join("\n"));

    this.root.querySelectorAll(".add-benefit").forEach(button => {
      button.onclick = () => {
        const container = this.root.querySelector("#benefitsContainer");
        if (!container) return;
        const item = document.createElement("div");
        item.className = "benefit-item";
        item.innerHTML = `<div class="benefit-icon">🎁</div><div class="benefit-content"><input class="benefit-title" placeholder="Benefit"><textarea rows="3" placeholder="Beschreibung des Benefits"></textarea></div><button type="button" class="icon-button remove-benefit">×</button>`;
        item.querySelector(".remove-benefit").onclick = () => item.remove();
        container.appendChild(item);
      };
    });
  }

  applyAnalysis(result) {
    this.set("benefits", (result.benefits || []).join("\n"));
  }

  save(application) {
    application.benefits = this.list("benefits");
    application.social = application.social || { benefits: [], impact: [], focus: [] };
    application.social.benefits = application.social.benefits?.length ? application.social.benefits : application.benefits;
  }
}
