import * as utility from "@core/assets/js/components/utility";

/**
 * Radio Styler
 *
 * Used to style Radio form element
 *
 * @param String/Node parent parent element of the radio inputs
 * @param String className class name of the radio wrapper for styling
 */
export class RadioStyler {
    private radios;

    constructor(parent: any, private className: string = "radio-styler") {
        parent = (typeof parent === "string") ? document.querySelector(parent) : parent;
        this.radios = parent.querySelectorAll("input[type='radio']");
    }

    init() {
        this.generateMarkup();
    }

    private generateMarkup() {
        utility.forEach(this.radios, (radio) => {
            // Wrap radio with span
            utility.wrapElement(radio, "span", this.className);

            // Add span tag for style purposes
            const span = document.createElement("span");
            radio.parentNode.appendChild(span);
        });
    }
}
