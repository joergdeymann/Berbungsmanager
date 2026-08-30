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


    links(urls) {
        const unique = [...new Set(urls ?? [])].filter(Boolean);

        if (unique.length === 0) {
            return "<p>—</p>";
        }

        if (unique.length === 1) {
            return `<p>${this.link(unique[0])}</p>`;
        }

        const items = unique
            .map(url => `<li>${this.link(url)}</li>`)
            .join("");

        return `<ul>${items}</ul>`;
    }

    link(url) {

        if (!url) {
            return "—";
        }
        if (typeof url !== "string") {
            return this.links(url);
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