import * as utility from "@core/assets/js/components/utility";

import {ComponentManager} from "@plugins/ComponentWidget/asset/component";

export class ProviderDrawer {
    constructor(private element: HTMLElement) {
}

    activate() {
        this.bindEvents();
    }

    private bindEvents() {
        ComponentManager.subscribe("click", (src, target) => {
            const icon = this.element.querySelector(".provider-drawer");

            if (target === icon || target.parentNode === icon) {
                this.openProvider();
            } else if (utility.hasClass(target, "close-svg") ||
                utility.hasClass(target, "close-drawer") ||
                utility.hasClass(target, "provider-menu-overlay")
            ) {
                this.closeProvider();
            }
        });
    }

    private openProvider() {
        utility.addClass(this.element, "provider-open");
        this.createOverlay();
    }

    private closeProvider() {
        utility.removeClass(this.element, "provider-open");
    }

    private createOverlay() {
        if (!this.element.querySelector(".provider-menu-overlay")) {
            const overlay = document.createElement("div");
            const menu = this.element.querySelector(".provider-menu");

            utility.addClass(overlay, "provider-menu-overlay");
            menu.parentNode.insertBefore(overlay, menu);
        }
    }
}
