export class HtmlUtils {

    static escape(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    static toGermanDate(date) {
        if (!date) return "";

        const parsed = new Date(date);

        return Number.isNaN(parsed.getTime())
            ? date
            : parsed.toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            });
    }
}