/*
 * ImageGallery
 * ------------
 * Zeigt eine Reihe von Bild-Karten. Klick auf eine Karte macht sie
 * zum "Hauptbild" (isMain, besonders markiert und an erster
 * Stelle). Über das Eingabefeld können weitere Bilder per URL
 * ergänzt werden (kein Datei-Upload).
 */
export class ImageGallery {

    constructor(container, { showNames = false, addLabel = "+ Bild hinzufügen" } = {}) {
        this.container = container;
        this.showNames = showNames;
        this.addLabel = addLabel;
        this.images = [];
    }

    setImages(images) {
        this.images = images.map(image => ({ name: "", isMain: false, ...image }));
        if (this.images.length && !this.images.some(image => image.isMain)) {
            this.images[0].isMain = true;
        }
        this.render();
    }

    getImages() {
        // Hauptbild zuerst (Anforderung: der wichtige Eintrag steht oben).
        return [...this.images].sort((a, b) => (b.isMain ? 1 : 0) - (a.isMain ? 1 : 0));
    }

    addImage(url, name = "") {
        const trimmed = url.trim();
        if (!trimmed || this.images.some(image => image.url === trimmed)) return;
        this.images.push({ url: trimmed, name, isMain: this.images.length === 0 });
        this.render();
    }

    selectMain(url) {
        this.images.forEach(image => { image.isMain = image.url === url; });
        this.render();
    }

    removeImage(url) {
        this.images = this.images.filter(image => image.url !== url);
        if (this.images.length && !this.images.some(image => image.isMain)) {
            this.images[0].isMain = true;
        }
        this.render();
    }

    escape(value) {
        return String(value ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    render() {
        const cards = this.getImages().map(image => `
            <div class="image-card${image.isMain ? " main" : ""}" data-url="${this.escape(image.url)}">
              ${image.isMain ? '<span class="image-card-badge">★ Hauptbild</span>' : ""}
              <img src="${this.escape(image.url)}" alt="${this.escape(image.name)}" loading="lazy">
              ${this.showNames && image.name ? `<span class="image-card-name">${this.escape(image.name)}</span>` : ""}
              <button type="button" class="icon-button image-card-remove" data-url="${this.escape(image.url)}">×</button>
            </div>
        `).join("");

        this.container.innerHTML = `
            ${this.images.length ? `<div class="image-grid">${cards}</div>` : `<p class="muted">Noch keine Bilder gefunden.</p>`}
            <div class="image-add-row">
                <input type="url" class="image-add-input" placeholder="Bild-URL einfügen...">
                <button type="button" class="secondary image-add-button">${this.addLabel}</button>
            </div>
        `;

        this.container.querySelectorAll(".image-card").forEach(card => {
            card.onclick = event => {
                if (event.target.closest(".image-card-remove")) return;
                this.selectMain(card.dataset.url);
            };
        });

        this.container.querySelectorAll(".image-card-remove").forEach(button => {
            button.onclick = event => {
                event.stopPropagation();
                this.removeImage(button.dataset.url);
            };
        });

        const input = this.container.querySelector(".image-add-input");
        this.container.querySelector(".image-add-button").onclick = () => {
            if (input.value.trim()) {
                this.addImage(input.value);
                input.value = "";
            }
        };
        input.onkeydown = event => {
            if (event.key === "Enter") this.container.querySelector(".image-add-button").click();
        };
    }
}
