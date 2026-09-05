import { DetailBaseTemplate } from "./DetailBaseTemplate.js";
import { HtmlUtils } from "../../utils/HtmlUtils.js";
import { StatusUtils } from "../../utils/StatusUtils.js";

export class DetailHeaderTemplate extends DetailBaseTemplate {

    render(application) {

        const status =
            application.application?.status ||
            "Nicht beworben";

        return `
            <header class="app-header pb-0">

                <span class="status-badge ${StatusUtils.getClass(status)}">
                    ${HtmlUtils.escape(status)}
                </span>

                <div class="shrink-to-left">

                    <h1>
                        ${HtmlUtils.escape(
                            application.company?.name ||
                            "Unbenannte Firma"
                        )}
                    </h1>

                    <p>
                        ${HtmlUtils.escape(
                            application.job?.title ||
                            "Keine Stelle angegeben"
                        )}
                    </p>

                </div>

                <nav class="header-detail-view">

                    <button
                        class="danger"
                        data-action="delete">
                        Löschen
                    </button>

                    <button
                        class="primary"
                        data-route="#/edit/${encodeURIComponent(application.id)}">
                        Bearbeiten
                    </button>

                </nav>

            </header>
        `;
    }
}