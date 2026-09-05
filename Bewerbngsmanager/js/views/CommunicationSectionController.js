import { InputPrompt } from "./InputPromt.js";
import { VerifyPrompt } from "./VerifyPrompt.js";

export class CommunicationSectionController {

    constructor(repository) {
        this.repository = repository;
    }


    bind(root, application, onUpdate) {

        this.bindAdd(root, application, onUpdate);
        this.bindEdit(root, application, onUpdate);
        this.bindDelete(root, application, onUpdate);
    }


    bindAdd(root, application, onUpdate) {

        const addButton =
            root.querySelector("#addCommunication");

        if (!addButton) {
            return;
        }

        addButton.onclick = () => {

            const textarea =
                root.querySelector("#communicationText");

            const text = textarea.value.trim();

            if (!text) {
                return;
            }

            this.addEntry(application, text);
            this.repository.save(application);

            onUpdate();
        };
    }


    addEntry(application, text) {

        application.communication =
            application.communication || [];

        application.communication.push({
            id: crypto.randomUUID(),
            type: "Telefonat",
            text,
            date: new Date().toISOString()
        });
    }


    bindEdit(root, application, onUpdate) {

        root.querySelectorAll(
            "[data-edit-communication]"
        ).forEach(button => {

            button.onclick = () =>
                this.handleEdit(
                    button,
                    application,
                    onUpdate
                );
        });
    }

    bindDelete(root, application, onUpdate) {

        root.querySelectorAll(
            "[data-delete-communication]"
        ).forEach(button => {

            button.onclick = () =>
                this.handleDelete(
                    button,
                    application,
                    onUpdate
                );
        });
    }

    async handleDelete(button, application, onUpdate) {
        const entry = application.communication.find(
            item => item.id === button.dataset.deleteCommunication
        );

        if (!entry) {
            return;
        }


        // Datum für den Titel lesbar formatieren
        const formattedDate = entry.date
            ? new Date(entry.date).toLocaleString("de-DE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            })
            : "Unbekanntes Datum";

        const promptTitle = `Löschen von Telefongespräch (${formattedDate})`;
        const verifyPrompt = new VerifyPrompt();
        const verifyValue = await verifyPrompt.show(entry.text, promptTitle);

        if (!verifyValue) {
            return;
        }
        
        // Eintrag löschen
        application.communication = application.communication.filter(
            item => item.id !== entry.id
        );

        this.repository.save(application);
        onUpdate();
    }

    async handleEdit(button, application, onUpdate) {
        const entry =
            application.communication.find(
                item =>
                    item.id ===
                    button.dataset.editCommunication
            );

        if (!entry) {
            return;
        }

        const inputPrompt = new InputPrompt(this.repository, application.id);
        const value = await inputPrompt.show(entry.text);




        if (value === null) {
            return;
        }

        entry.text = value.trim();

        this.repository.save(application);
        onUpdate();
    }
}
