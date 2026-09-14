export class Toast {

    // Warnungen müssen mindestens 10s sichtbar bleiben, Erfolgsmeldungen
    // und Hinweise reichen 5s. Fehler blenden NICHT automatisch aus -
    // die bleiben stehen, bis sie aktiv weggeklickt werden.
    static MIN_DURATIONS = {
        success: 5000,
        info: 5000,
        warning: 10000,
    };

    // Zeigt eine kurze, nicht blockierende Meldung mittig auf dem
    // Bildschirm - mit "×"-Button zum Wegklicken. type steuert Farbe
    // und Verhalten: "success" (grün, 5s), "info" (blau, 5s),
    // "warning" (gelb, mind. 10s) verschwinden automatisch.
    // "error" (blassrot) bleibt stehen, bis manuell weggeklickt wird.
    static show(message, type = "info", duration) {
        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span>${message}</span>
            <button type="button" class="toast-close" aria-label="Schließen">×</button>
        `;

        this.stack().appendChild(toast);

        const remove = () => {
            toast.classList.add("toast-out");
            toast.addEventListener("animationend", () => toast.remove(), { once: true });
        };

        let timer = null;
        if (type !== "error") {
            const minDuration = this.MIN_DURATIONS[type] ?? this.MIN_DURATIONS.info;
            const effectiveDuration = Math.max(duration ?? minDuration, minDuration);
            timer = setTimeout(remove, effectiveDuration);
        }

        toast.querySelector(".toast-close").onclick = () => {
            if (timer) clearTimeout(timer);
            remove();
        };
    }

    static stack() {
        let stack = document.getElementById("toast-stack");
        if (!stack) {
            stack = document.createElement("div");
            stack.id = "toast-stack";
            document.body.appendChild(stack);
        }
        return stack;
    }
}