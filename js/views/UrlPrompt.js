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
                    <label for="url-input">Webadresse der Stellenanzeige hier einfügen:</label>
                    <div class="url-input-row">
                        <button type="button" id="pasteUrl" class="secondary" title="Aus Zwischenablage einfügen">📋 Einfügen</button>
                        <input id="url-input" type="url" placeholder="https://...">
                    </div>
                    <p class="prompt-hint" id="url-hint"></p>
                    <div class="prompt-buttons">
                        <button id="cancelUrl" class="danger">Abbrechen</button>
                        <button id="submitUrl" class="primary">Importieren</button>
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
            const pasteBtn = overlay.querySelector("#pasteUrl");

            input.focus();

            pasteBtn.onclick = async () => {
                try {
                    const text = await navigator.clipboard.readText();
                    if (text) {
                        input.value = text.trim();
                        hint.textContent = "";
                        input.focus();
                    }
                } catch {
                    hint.textContent = "Einfügen per Button nicht möglich - bitte Strg+V im Feld benutzen.";
                }
            };

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
