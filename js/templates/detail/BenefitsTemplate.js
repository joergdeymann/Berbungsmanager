import { DetailBaseTemplate } from "./DetailBaseTemplate.js";

export class BenefitsTemplate extends DetailBaseTemplate {

    render(application) {
        return `

            <section class="application-card subsection-display">
                <section class="section-header section">
                    <div>
                        <span class="section-icon">🎁</span>
                        <div>
                            <h2>Benefits</h2>
                            <p>Ausgleichmöglichkeiten von der Firma unterstützt</p>
                        </div
                    </div>
                </section>
                
                <div class="subsection">
                    <div class="field">
                        <label>Benefits</label>
                ${this.list(application.benefits)}
                    </div>
                </div>
            </section>
        `;
    }
}