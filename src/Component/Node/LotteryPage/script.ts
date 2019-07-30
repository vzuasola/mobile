import Accordion from "@app/assets/script/components/accordion";

import EqualHeight from "@app/assets/script/components/equal-height";
import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";

/**
 * Lottery Basic Pages
 */
export class LotteryPageComponent implements ComponentInterface {
    private element: HTMLElement;
    private events: {};
    private productMenu: string = "product-keno";

    onLoad(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.events = {};
        this.highlightMenu();
        this.highlightQuickNavMenu();
        this.equalizeStickyHeight();
        this.accordion(element);
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.element = element;
        if (typeof this.events === "undefined") {
            this.events = {};
        }
        this.highlightMenu();
        this.highlightQuickNavMenu();
        this.equalizeStickyHeight();
        this.accordion(element);
    }

    private equalizeStickyHeight() {
        const equalSticky = new EqualHeight(".sticky-box");
        equalSticky.init();
    }

    private accordion(element) {
        const accordion = new Accordion(element, { collapsible: true });
    }

    /**
     *  Helper function used to highlight active links
     */
    private highlightQuickNavMenu() {
        if (this.checkEvent("tab_nav.ready")) {
            ComponentManager.subscribe("tab_nav.ready", (event, target, data) => {
                if (data.ready) {
                    this.broadcastQuickNavKey();
                }
            });
        }
    }

    /**
     *  Helper function used to broadcast which page should be highlighted on Quick Nav Menu
     */
    private broadcastQuickNavKey() {
        const pageTitle = this.element.querySelector(".node-inner-page");
        const quickNavKey = pageTitle.getAttribute("data-quick-nav-key");
        ComponentManager.broadcast("tab_nav.highlight", { menu: quickNavKey });
    }

    /**
     *  Helper function used to prevent duplication of listeners
     */
    private checkEvent(key) {
        if (this.events.hasOwnProperty(key)) {
            return false;
        }

        this.events[key] = key;
        return true;
    }

    /**
     *  Helper function used to highlight product on Left Nav Menu
     */
    private highlightMenu() {
        ComponentManager.broadcast("menu.highlight", { menu: this.productMenu });
        setTimeout (() => {
            ComponentManager.broadcast("menu.highlight", { menu: this.productMenu });
        }, 200);
    }
}
