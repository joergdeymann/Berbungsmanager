import { DetailBaseTemplate } from "./DetailBaseTemplate.js";

export class RequirementsTemplate extends DetailBaseTemplate {

    render(application) {

        return `
            <section class="application-card subsection-display">
                <section class="section-header">
                    <div>
                        <span class="section-icon">🎯</span>
                        <div>
                            <h2>Anforderungen</h2>
                            <p>Diese Eigenschaften erwartet die Firma von Dir</p>
                        </div
                    </div>
                </section>
                
                <section class="section-body">
                    <div class="field">
                        <label>Muss-Anforderungen</label>
                        ${this.list(application.qualifications?.required)}
                    </div>

                    <div class="field">
                        <label>Fachliche Fähigkeiten / Technologien</label>
                        ${this.list(application.skills)}
                    </div>
                    <div class="field">
                        <label>Persönliche Anforderungen</label>
                        ${this.list(application.qualifications?.personal)}
                    </div>
                    <div class="field">
                        <label>Wünschenswerte Kenntnisse</label>
                        ${this.list(application.qualifications?.preferred)}
                    </div>
                </section>
            </section>    
        `;
    }
}