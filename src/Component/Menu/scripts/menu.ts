import * as utility from "@core/assets/js/components/utility";

import {ComponentManager} from "@plugins/ComponentWidget/asset/component";

export class Menu {
    constructor(private element: HTMLElement) {
}

    activate() {
        this.bindEvents();
        this.closeEvents();
    }

    private bindEvents() {
        ComponentManager.subscribe(utility.eventType(), (src, target) => {
            const icon = this.element.querySelector(".mobile-menu-icon");

            if (target === icon || target.parentNode === icon) {
                this.openMenu();
            } else if (utility.hasClass(target, "mobile-menu-overlay")
            ) {
                if (!utility.hasClass(target, "icon-thumbnail-item")) {
                    src.preventDefault();
                }
                this.closeMenu();
            }
        });
    }

    private closeEvents() {
        ComponentManager.subscribe("click", (src, target) => {
            const icon = this.element.querySelector(".mobile-menu-icon");

            if (target === icon || target.parentNode === icon) {
                this.openMenu();
            } else if (utility.hasClass(
                target, "close-svg") ||
                utility.hasClass(target, "menu-item-internal", true) ||
                utility.hasClass(target, "logo-img")
            ) {
                this.closeMenu();
            }
        });
    }

    private openMenu() {
        utility.addClass(this.element, "menu-open");
        setTimeout(() => {
            utility.removeClass(this.element.querySelector(".close-svg"),  "hidden");
        }, 100);
        this.createOverlay();
    }

    private closeMenu() {
        utility.removeClass(this.element, "menu-open");
        utility.addClass(this.element.querySelector(".close-svg"),  "hidden");
    }

    private createOverlay() {
        if (!this.element.querySelector(".mobile-menu-overlay")) {
            const overlay = document.createElement("div");
            const menu = this.element.querySelector(".mobile-menu");

            utility.addClass(overlay, "mobile-menu-overlay");
            menu.parentNode.insertBefore(overlay, menu);
        }
    }
}
