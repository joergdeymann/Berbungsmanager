import { DetailBaseTemplate } from "./DetailBaseTemplate.js";

export class RequirementsTemplate extends DetailBaseTemplate {

    render(application) {

        return `
            <section class="application-card subsection-display">
                <section class="section-header section">
                    <div>
                        <span class="section-icon">🎯</span>
                        <div>
                            <h2>Anforderungen</h2>
                            <p>Diese Eigenschaften erwartet die Firma von Dir</p>
                        </div
                    </div>
                </section>
                
                <div class="subsection">
                    <div class="field">
                        <label>Muss-Anforderungen</label>
                        ${this.list(application.qualifications?.required)}
                    </div>
                </div>

                <div class="subsection">
                    <div class="field">
                        <label>Fachliche Fähigkeiten / Technologien</label>
                        ${this.list(application.skills)}
                    </div>
                </div>
                
                <div class="subsection">
                    <div class="field">
                        <label>Persönliche Anforderungen</label>
                        ${this.list(application.qualifications?.personal)}
                    </div>
                </div>
                <div class="subsection">
                    <div class="field">
                        <label>Wünschenswerte Kenntnisse</label>
                        ${this.list(application.qualifications?.preferred)}
                    </div>
                </div>
            </section>    
        `;
    }
}