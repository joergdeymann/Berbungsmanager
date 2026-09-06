export class Toast {

    // Zeigt eine kurze, nicht blockierende Meldung, die von selbst
    // verschwindet - mit "×"-Button für den Fall, dass das
    // Verschwinden zu lange dauert.
    static show(message, duration = 2500) {
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.innerHTML = `
            <span>${message}</span>
            <button type="button" class="toast-close" aria-label="Schließen">×</button>
        `;

        document.body.appendChild(toast);

        const remove = () => toast.remove();
        const timer = setTimeout(remove, duration);

        toast.querySelector(".toast-close").onclick = () => {
            clearTimeout(timer);
            remove();
        };
    }
}
