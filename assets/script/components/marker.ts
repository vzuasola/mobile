import * as utility from "@core/assets/js/components/utility";

/**
 * Marker
 *
 * Used to style input checkbox/radio form element
 *
 * @param Object options
 * @param String options.parent parent element of the checkbox/radio inputs
 * @param String options.className class name of the checkbox/radio wrapper used for styling
 * @param String options.iconDefault <svg>/<img> tag for normal/unchecked checkbox/radio inputs
 * @param String options.iconActive <svg>/<img> tag for active/checked checkbox/radio inputs
 */
export class Marker {
    private checkboxes: {};
    private parent: Element;
    private className: string;

    constructor(private options: any) {
        this.options = this.mergeSettings(options);
        this.parent = (typeof this.options.parent === "string")
            ? document.querySelector(this.options.parent)
            : this.options.parent;
        this.checkboxes = this.parent.querySelectorAll("input[type='checkbox'], input[type='radio']");
        this.init();
    }

    init() {
        this.generateMarkup();
    }

    private mergeSettings(options) {
        const settings = {
            parent: "",
            className: "marker",
            iconDefault: null,
            iconActive: null,
        };

        const userSttings = options;

        for (const attrname in userSttings) {
            if (userSttings[name] === undefined) {
                settings[attrname] = userSttings[attrname];
            }
        }

        return settings;
    }

    private generateMarkup() {
        utility.forEach(this.checkboxes, (checkbox) => {
            // Wrap input with span
            utility.wrapElement(checkbox, "span", this.options.className);

            // Add span tag for style purposes
            const span = document.createElement("span");
            checkbox.parentNode.appendChild(span);

            if (this.options.iconDefault && this.options.iconActive) {
                span.innerHTML = this.options.iconDefault;
                span.innerHTML += this.options.iconActive;

                // Override classname
                span.parentElement.className = "marker-svg";
            }
        });
    }
}
