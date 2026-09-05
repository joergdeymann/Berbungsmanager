export class InputPrompt {
    constructor(repository, id) {
        this.repository = repository;
        this.id = id;
    }

    // Erwartet den Standardtext (Vorausfüllung beim Bearbeiten)
    show(defaultValue = "") {
        return new Promise((resolve) => {
            // Der alte Code-Block mit "repository" und "getById" wurde komplett entfernt.

            const overlay = document.createElement("div");
            overlay.className = "modal-overlay"; 
            
            overlay.innerHTML = `
            <div id="input-container" class="input-container">
                <div class="input-prompt">
                    <label for="input-text">Telefonat / Rückruf dokumentieren:</label>
                    <textarea id="input-text" rows="4" placeholder="Informationen zum Telefonat eingeben ...">${defaultValue}</textarea>
                    <div class="prompt-buttons">
                        <button id="cancelInput" class="danger">Abbrechen</button>
                        <button id="submitInput">Speichern</button>
                    </div>
                </div>
            </div>
            `;

            document.body.appendChild(overlay);

            const inputContainer = overlay.querySelector("#input-container");
            const textarea = overlay.querySelector("#input-text");
            const submitBtn = overlay.querySelector("#submitInput");
            const cancelBtn = overlay.querySelector("#cancelInput");

            textarea.focus();
            textarea.setSelectionRange(textarea.value.length, textarea.value.length);

            submitBtn.onclick = () => {
                const text = textarea.value.trim();
                overlay.remove();
                resolve(text);
            };

            cancelBtn.onclick = () => {
                overlay.remove();
                resolve(null);
            };

            inputContainer.onclick = event => {
                if (event.target === inputContainer) {
                    event.stopPropagation();
                    event.preventDefault();
                    overlay.remove();
                    resolve(null);
                }
            };

            document.addEventListener("keydown", event => {
                if (event.key === "Escape" && document.body.contains(overlay)) {
                    overlay.remove();
                    resolve(null);
                }
            });

        });
    }
}
