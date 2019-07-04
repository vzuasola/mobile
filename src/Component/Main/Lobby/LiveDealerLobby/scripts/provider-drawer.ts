import * as utility from "@core/assets/js/components/utility";

import {ComponentManager} from "@plugins/ComponentWidget/asset/component";

export class ProviderDrawer {
    constructor(private element: HTMLElement) {
}

    activate() {
        this.bindEvents();
        this.closeEvents();
    }

    private bindEvents() {
        ComponentManager.subscribe(utility.eventType(), (src, target) => {
            const icon = this.element.querySelector(".provider-drawer");
            if (target === icon || target.parentNode === icon) {
                this.openProvider();
            } else if (utility.hasClass(target, "provider-menu-overlay")
            ) {
                this.closeProvider(src);
            }
        });
    }

    private closeEvents() {
        ComponentManager.subscribe("click", (src, target) => {
            if (ComponentManager.getAttribute("product") === "mobile-live-dealer") {
                const icon = this.element.querySelector(".provider-drawer");

                if (target === icon || target.parentNode === icon) {
                    this.openProvider();
                } else if (utility.hasClass(target, "close-svg") ||
                    utility.hasClass(target, "close-drawer")
                ) {
                    this.closeProvider(src);
                }
            }
        });
    }

    private openProvider() {
        utility.addClass(this.element, "provider-open");
        this.createOverlay();
    }

    private closeProvider(src) {
        src.preventDefault();
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
