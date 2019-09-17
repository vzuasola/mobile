import * as utility from "@core/assets/js/components/utility";

import {ComponentManager} from "@plugins/ComponentWidget/asset/component";

export class ProviderDrawer {
    constructor(private element: HTMLElement) {
}

    activate() {
        this.listenProviderClick();
        this.bindEvents();
        this.closeEvents();
    }

    private listenProviderClick() {
        ComponentManager.subscribe("provider_tab.click", (src, target) => {
            this.openProvider(true);
        });
    }

    private bindEvents() {
        ComponentManager.subscribe(utility.eventType(), (src, target) => {
            const icon = this.element.querySelector(".provider-drawer");
            if (target === icon || target.parentNode === icon) {
                this.openProvider();
            } else if (utility.hasClass(target, "provider-menu-overlay")
            ) {
                this.closeProvider(src, target);
            }
        });
    }

    private closeEvents() {
        ComponentManager.subscribe("click", (src, target) => {
            if (ComponentManager.getAttribute("product") === "mobile-arcade") {
                const icon = this.element.querySelector(".provider-drawer");

                if (target === icon || target.parentNode === icon) {
                    this.openProvider(false);
                } else if (utility.hasClass(target, "close-svg") ||
                    utility.hasClass(target, "close-drawer")
                ) {
                    this.closeProvider(src, target);
                }
            }
        });
    }

    private openProvider(fromProvider?: boolean) {
        utility.addClass(this.element, "provider-open");
        this.createOverlay(fromProvider);
    }

    private closeProvider(src, target) {
        if (!utility.hasClass(target, "close-drawer")) {
            src.preventDefault();
        }
        const overlay = this.element.querySelector(".provider-menu-overlay");
        if (overlay) {
            utility.removeClass(overlay, "provider-menu-overlay");
        }
        utility.removeClass(this.element, "provider-open");
    }

    private createOverlay(fromProvider?: boolean) {
        if (!this.element.querySelector(".provider-menu-overlay")) {
            const overlay = document.createElement("div");
            const menu = this.element.querySelector(".provider-menu");

            const providers = menu.querySelectorAll(".game-providers-list");
            for (const elemKey in providers) {
                if (providers.hasOwnProperty(elemKey)) {
                    const provider = providers[elemKey];
                    utility.removeClass(provider, "hidden");
                    if (provider.getAttribute("data-category-provider") === "1" && fromProvider) {
                        utility.addClass(provider, "hidden");
                    }
                }
            }

            utility.addClass(overlay, "provider-menu-overlay");
            menu.parentNode.insertBefore(overlay, menu);
        }
    }
}
