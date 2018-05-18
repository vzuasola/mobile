import * as utility from "@core/assets/js/components/utility";

import {ComponentManager} from "@plugins/ComponentWidget/asset/component";

export class Menu {
    constructor(private element: HTMLElement) {
    }

    activate() {
        const event = this.isTouch() ? "touchend" : "click";
        this.bindEvents(event);
    }

    private isTouch() {
        return "ontouchstart" in (window as any) ||
            (window as any).DocumentTouch && document instanceof (window as any).DocumentTouch;
    }

    private bindEvents(event: string) {
        ComponentManager.subscribe(event, (src, target) => {
            const icon = this.element.querySelector(".mobile-menu-icon");
            const targetQuicklink = utility.hasClass(target, "menu-item-internal")
                                    || utility.hasClass(target.parentNode, "menu-item-internal")
                                    || utility.hasClass(target.parentNode.parentNode, "menu-item-internal");

            if (target === icon || target.parentNode === icon) {
                this.openMenu();
            } else if (utility.hasClass(target, "close-svg")
                || targetQuicklink
                || utility.hasClass(target, "mobile-menu-overlay")) {
                this.closeMenu();
            }
        });
    }

    private openMenu() {
        utility.addClass(this.element, "menu-open");
        this.createOverlay();
    }

    private closeMenu() {
        utility.removeClass(this.element, "menu-open");
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
