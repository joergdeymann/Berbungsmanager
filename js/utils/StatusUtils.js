export class StatusUtils {

    static classes = {
        "Nicht beworben": "status-draft",
        "Beworben": "status-applied",
        "Eingangsbestätigung": "status-confirmed",
        "Rückruf erhalten": "status-callback",
        "Angenommen": "status-accepted",
        "Abgelehnt": "status-rejected"
    };

    static getClass(status) {
        return this.classes[status] || "status-draft";
    }
}