import * as utility from "@core/assets/js/components/utility";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

/**
 *
 */
export class TabNavigationComponent implements ComponentInterface {
    private element: HTMLElement;
    private initElement: HTMLElement;
    private events = {};

    onLoad(element: HTMLElement) {
        this.element = element;
        this.events = {};
        this.highlightQuickNavMenu();
        this.refreshQuickNav();
        this.broadcastTabNavReady();
    }

    onReload(element: HTMLElement) {
        this.element = element;
        if (typeof this.events === "undefined") {
            this.events = {};
        }
        this.refreshQuickNav();
        this.broadcastTabNavReady();
    }

    /**
     *  Helper function used to show Quick Nav Submenu
     */
    private showQuickNavSubmenu(show: boolean) {
        const subMenus = this.element.querySelectorAll(".quick-nav-submenu-item a");
        for (const subMenu in subMenus) {
            if (subMenus.hasOwnProperty(subMenu)) {
                const menu = subMenus[subMenu];
                if (!show) {
                    utility.addClass(utility.findParent(menu, "ul"), "hidden");
                    utility.removeClass(this.element.querySelector(".quick-nav-menu"), "show-submenu");
                    continue;
                }
                if (utility.hasClass(menu, "active")) {
                    utility.removeClass(utility.findParent(menu, "ul"), "hidden");
                    utility.addClass(this.element.querySelector(".quick-nav-menu"), "show-submenu");
                }
            }
        }
    }

    /**
     *  Helper function used to highlight active links
     *  If page is an inner page, puts active class on parent element as well
     */
    private highlightQuickNavMenu() {
        ComponentManager.subscribe("tab_nav.highlight", (event, target, data) => {
            const menu = this.element.querySelector("a." + data.menu);
            const lang = "/" + ComponentManager.getAttribute("language");
            if (lang + Router.route() === menu.getAttribute("href")) {
                const activeClass = menu.getAttribute("data-router-active-link-class");
                const parentSibling = utility.previousElementSibling(utility.findParent(menu, "ul"));
                if (menu && !utility.hasClass(menu, activeClass)) {
                    utility.addClass(menu, activeClass);
                }
                if (parentSibling && !utility.hasClass(parentSibling, activeClass)) {
                    utility.addClass(parentSibling, "active");
                }
                this.showQuickNavSubmenu(true);
                return;
            }
        });
    }

    /**
     *  Helper function to broadcast Quick Nav is ready.
     *  Added timeout due to completion race issue
     */
    private broadcastTabNavReady() {
        setTimeout(() => {
            ComponentManager.broadcast("tab_nav.ready", { ready: true });
        }, 500);
    }

    /**
     *  Helper function to refresh Quick Nav menu, then broadcast that Quick Nav is now ready
     */
    private refreshQuickNav() {
        if (this.checkEvent("tab_nav.refresh")) {
            ComponentManager.subscribe("tab_nav.refresh", (event, target, data) => {
                const activeElements = this.element.querySelectorAll(".active");
                for (const element in activeElements) {
                    if (activeElements.hasOwnProperty(element)) {
                        const elem = activeElements[element];
                        utility.removeClass(elem, "active");
                        this.showQuickNavSubmenu(false);
                    }
                }
                ComponentManager.broadcast("tab_nav.ready", { ready: true });
            });
        }
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
}
