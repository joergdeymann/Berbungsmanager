export class ParseUrl {
    async getHtml(url) {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP-Fehler: ${response.status}`);
        }

        const html = await response.text();

        return html;
    }

    async getContent(url) {
        const html = await this.getHtml(url);
        return html;
    }
}