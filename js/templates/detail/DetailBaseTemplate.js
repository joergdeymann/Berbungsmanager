import { HtmlUtils } from "../../utils/HtmlUtils.js";

export class DetailBaseTemplate {

    list(items) {

        if (!items?.length) {
            return `<p class="muted">Keine Angaben</p>`;
        }

        return `
            <ul>
                ${items.map(item => `
                    <li>${HtmlUtils.escape(item)}</li>
                `).join("")}
            </ul>
        `;
    }

    link(url) {

        if (!url) {
            return "—";
        }

        const safe = HtmlUtils.escape(url);

        return `
            <a href="${safe}"
               target="_blank"
               rel="noopener">
                ${safe}
            </a>
        `;
    }
}