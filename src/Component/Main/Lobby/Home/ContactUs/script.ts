import * as utility from "@core/assets/js/components/utility";

import EqualHeight from "@app/assets/script/components/equal-height";
import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";

/**
 *
 */
export class ContactUsComponent implements ComponentInterface {
    private element: HTMLElement;
    onLoad(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.checkVisibility();
        this.equalizeContactUsHeight();
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.checkVisibility();
        this.equalizeContactUsHeight();
    }

    private equalizeContactUsHeight() {
        const equalDownload = new EqualHeight(".contact-box");
        equalDownload.init();
    }

    private checkVisibility() {
        const isIOS = this.isIOS();
        const contactItems = this.element.querySelectorAll(".home-contact-list a");
        if (typeof contactItems !== "undefined") {
            for (const key in contactItems) {
                if (contactItems.hasOwnProperty(key)) {
                    const parentEl = utility.findParent(contactItems[key], "li");
                    if ((!isIOS && utility.hasClass(contactItems[key], "ios")) ||
                    (isIOS && utility.hasClass(contactItems[key], "android"))) {
                        parentEl.remove();
                    }
                }
            }

            this.applyMenuClass();
        }
    }

    private applyMenuClass() {
        const contactItems = this.element.querySelectorAll(".home-contact-list");
        const menuClass = [];
        menuClass[4] = "col-3";
        menuClass[3] = "home-contact-col-3";
        menuClass[2] = "home-contact-col-2";
        menuClass[1] = "home-contact-full-width";

        if (typeof contactItems !== "undefined") {
            const itemClass = (typeof menuClass[contactItems.length] !== "undefined")
                ? menuClass[contactItems.length] : "home-contact-more";

            for (const key in contactItems) {
                if (contactItems.hasOwnProperty(key)) {
                    utility.addClass(contactItems[key], itemClass);
                    if (contactItems.length === 3) {
                        utility.addClass(contactItems[key], "push");
                    }
                }
            }
        }
    }

    private isIOS() {
        return [
            "iPad Simulator",
            "iPhone Simulator",
            "iPod Simulator",
            "iPad",
            "iPhone",
            "iPod",
        ].indexOf(navigator.platform) !== -1
        // iPad on iOS 13 detection
        || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
    }
}
