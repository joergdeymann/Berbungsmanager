export class UrlPrompt {

    // Zeigt ein kleines Eingabefenster für eine URL.
    // Löst mit der eingegebenen URL auf, oder mit null bei Abbruch.
    show() {
        return new Promise((resolve) => {
            const overlay = document.createElement("div");
            overlay.className = "modal-overlay";

            overlay.innerHTML = `
            <div id="url-container" class="input-container">
                <div class="input-prompt auto-height">
                    <label for="url-input">Stellenanzeige per URL abrufen:</label>
                    <input id="url-input" type="url" placeholder="https://...">
                    <p class="prompt-hint" id="url-hint"></p>
                    <div class="prompt-buttons">
                        <button id="cancelUrl" class="danger">Abbrechen</button>
                        <button id="submitUrl" class="primary">Abrufen</button>
                    </div>
                </div>
            </div>
            `;

            document.body.appendChild(overlay);

            const container = overlay.querySelector("#url-container");
            const input = overlay.querySelector("#url-input");
            const hint = overlay.querySelector("#url-hint");
            const submitBtn = overlay.querySelector("#submitUrl");
            const cancelBtn = overlay.querySelector("#cancelUrl");

            input.focus();

            const submit = () => {
                const value = input.value.trim();
                if (!/^https?:\/\/.+/i.test(value)) {
                    hint.textContent = "Bitte eine vollständige URL eingeben (http:// oder https://).";
                    return;
                }
                overlay.remove();
                resolve(value);
            };

            submitBtn.onclick = submit;
            input.onkeydown = event => {
                if (event.key === "Enter") submit();
            };

            cancelBtn.onclick = () => {
                overlay.remove();
                resolve(null);
            };

            container.onclick = event => {
                if (event.target === container) {
                    overlay.remove();
                    resolve(null);
                }
            };

            document.addEventListener("keydown", function onEscape(event) {
                if (event.key === "Escape" && document.body.contains(overlay)) {
                    document.removeEventListener("keydown", onEscape);
                    overlay.remove();
                    resolve(null);
                }
            });
        });
    }
}
