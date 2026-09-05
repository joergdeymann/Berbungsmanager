import { DetailBaseTemplate } from "./DetailBaseTemplate.js";

export class DetailNavigationTemplate extends DetailBaseTemplate {

    render() {

        return `
            <header class="app-header">

                <nav class="detail-navigation">

                    <button
                        type="button"
                        data-section="company">
                        Firma
                    </button>

                    <button
                        type="button"
                        data-section="contact">
                        Ansprechpartner
                    </button>

                    <button
                        type="button"
                        data-section="job">
                        Stelle
                    </button>

                    <button
                        type="button"
                        data-section="requirements">
                        Anforderungen
                    </button>

                    <button
                        type="button"
                        data-section="benefits">
                        Benefits
                    </button>

                    <button
                        type="button"
                        data-section="sources">
                        Quellen
                    </button>

                    <button
                        type="button"
                        data-section="application">
                        Bewerbung & Ausgabe
                    </button>

                    <button
                        type="button"
                        data-section="communication">
                        Telefonate
                    </button>

                </nav>

            </header>

            <main id="detailContent" class="content-frame"></main>
        `;
    }
}