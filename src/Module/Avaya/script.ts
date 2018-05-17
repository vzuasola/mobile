import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import * as PopupWindow from "@core/assets/js/components/utils/popup";

import {Avaya} from "./scripts/avaya";

import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

/**
 *
 */
export class AvayaModule implements ModuleInterface {
    private avayaClass: Avaya;
    private windowTitle: string = "avayaWindow";
    private openBehavior: string = "popup";
    private windowObject = null;
    private avayaLink: string = "";
    private options: any = {};
    onLoad(attachments: {authenticated: boolean}) {
        // Instantiate the avaya library
        this.avayaClass = new Avaya(this.options);
        // Add listen to everything
        ComponentManager.subscribe("click", this.getAvayaToken);
    }

    private updatePopupWindow(url) {
        try {
            if (this.windowObject.location.href !== "about:blank" &&
                url === this.avayaLink &&
                !this.windowObject.closed
            ) {
                this.windowObject.focus();
            } else {
                this.avayaLink = url;
                this.windowObject.location.replace(url);
            }
        } catch (e) {
            if (this.windowObject) {
                this.windowObject.focus();
            }
        }
    }

    /**
     * Event listener for the avaya link
     * @param  object event
     * @return void/boolean
     */
    private getAvayaToken(event, src, data) {
        const evt = event || window.event;
        let target = evt.target || evt.srcElement;

        // Get parent Anchor if target is inside of anchor
        if (target.tagName !== "A" && (target.parentNode !== null && target.parentNode.tagName === "A")) {
            target = target.parentNode;
        }

        // Check if the link should be changed to avaya link
        if (target.href !== undefined &&
            (target.href.indexOf("linkto:avaya") !== -1 ||
            target.getAttribute("data-avayalink") === "true")
        ) {
            evt.preventDefault();

            target = utility.getParameterByName("target", target.href);
            target = target || (target.getAttribute("data-avaya-target") || this.openBehavior);

            if (target === "_self") {
                // Same tab
                this.windowObject = window;
            } else if (target === "_blank") {
                // New tab
                this.windowObject = window.open("", "_blank");
            } else {
                // Popup
                // We use a different data attribute for the popup,
                // since popup-window.js is already using the target=window
                let title = utility.getParameterByName("title", target.href);
                title = title || (target.getAttribute("data-popup-title") || this.windowTitle);

                const prop = this.popUpProperties(target);
                try {
                    if (this.windowObject &&
                        !this.windowObject.closed &&
                        this.windowObject.location.href !== "about:blank"
                    ) {
                        this.windowObject.focus();
                    } else {
                        this.windowObject = PopupWindow("", title, prop);
                    }
                } catch (e) {
                    if (this.windowObject) {
                        this.windowObject.focus();
                    }
                }
            }

            this.avayaClass.getAvayaToken(target);
            return false;
        }
    }

    /**
     * Method to prepare the popup properties
     *
     * @param  object $target Element to check
     * @return object
     */
    private popUpProperties(target) {
        const defaults = {
                width: 360,
                height: 720,
                scrollbars: 1,
                scrollable: 1,
                resizable: 1,
            };
        const properties = {};

        // Check the properties and get all possible values
        for (const i in defaults) {
            if (defaults.hasOwnProperty(i)) {
                const property = utility.getParameterByName(i, target.href) ||
                (target.getAttribute("data-popup-" + i) || defaults[i]);
                properties[i] = property;
            }
        }

        return properties;
    }

}
