export class DetailNavigationController {

    constructor(onSectionChange) {
        this.onSectionChange = onSectionChange;
    }


    bind(root) {

        const buttons =
            root.querySelectorAll("[data-section]");

        buttons.forEach(button => {

            button.addEventListener("click", () => {
                this.onSectionChange(
                    button.dataset.section
                );

                this.highlight(buttons, button);
            });
        });
    }


    highlight(buttons, activeButton) {

        buttons.forEach(button => {

            button.classList.toggle(
                "active",
                button === activeButton
            );
        });
    }


    setActiveSection(root, section) {

        const buttons =
            root.querySelectorAll("[data-section]");

        buttons.forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.section === section
            );
        });
    }
}
