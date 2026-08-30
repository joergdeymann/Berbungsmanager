import { DetailBaseTemplate } from "./DetailBaseTemplate.js";

export class BenefitsTemplate extends DetailBaseTemplate {

    render(application) {

        return `
            <section class="card section">

                <h2>🎁 Benefits</h2>

                ${this.list(application.benefits)}

            </section>
        `;
    }
}