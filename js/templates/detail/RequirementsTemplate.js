import { DetailBaseTemplate } from "./DetailBaseTemplate.js";

export class RequirementsTemplate extends DetailBaseTemplate {

    render(application) {

        return `
            <section class="card section">

                <h2>🎯 Anforderungen</h2>

                <h3>Muss-Anforderungen</h3>
                ${this.list(application.qualifications?.required)}

                <h3>Fachliche Fähigkeiten / Technologien</h3>
                ${this.list(application.skills)}

                <h3>Persönliche Anforderungen</h3>
                ${this.list(application.qualifications?.personal)}

                <h3>Wünschenswerte Kenntnisse</h3>
                ${this.list(application.qualifications?.preferred)}

            </section>
        `;
    }
}