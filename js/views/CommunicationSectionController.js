export class CommunicationSectionController {

    constructor(repository) {
        this.repository = repository;
    }


    bind(root, application, onUpdate) {

        this.bindAdd(root, application, onUpdate);
        this.bindEdit(root, application, onUpdate);
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


    handleEdit(button, application, onUpdate) {

        const entry =
            application.communication.find(
                item =>
                    item.id ===
                    button.dataset.editCommunication
            );

        if (!entry) {
            return;
        }

        const value = prompt(
            "Telefonnotiz bearbeiten:",
            entry.text
        );

        if (value === null) {
            return;
        }

        entry.text = value.trim();

        this.repository.save(application);
        onUpdate();
    }
}
