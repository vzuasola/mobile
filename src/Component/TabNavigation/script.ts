import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";
import * as quickNavTemplate from "./handlebars/tab-navigation.handlebars";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

/**
 *
 */
export class TabNavigationComponent implements ComponentInterface {
    private element: HTMLElement;
    private events = {};
    private quickNavMenu: [];
    private product: string;

    onLoad(element: HTMLElement) {
        this.element = element;
        this.events = {};
        this.quickNavMenu = [];
        this.product = ComponentManager.getAttribute("product");
        this.tabNavXhrRequest("quickNav", (response) => {
            this.quickNavMenu = response;
            if (response.quick_nav.length > 0) {
                this.populateQuickNavMenu();
                this.highlightQuickNavMenu();
                this.broadcastTabNavReady();
            }
        });
    }

    onReload(element: HTMLElement) {
        this.element = element;
        this.quickNavMenu = [];
        this.product = ComponentManager.getAttribute("product");
        this.tabNavXhrRequest("quickNav", (response) => {
            this.quickNavMenu = response;
            if (response.quick_nav.length > 0) {
                this.populateQuickNavMenu();
                this.highlightQuickNavMenu();
                this.broadcastTabNavReady();
            }
        });
        if (typeof this.events === "undefined") {
            this.events = {};
        }
    }

    /**
     *  Retrieve Quick Nav Menu
     */
    private tabNavXhrRequest(method: string, callback) {
        xhr({
            url: Router.generateRoute("tab_navigation", method),
            type: "json",
            data: {
                product: this.product,
                keyword: Router.route(),
            },
        }).then((response) => {
            callback(response);
        }).fail((error, message) => {
            console.log(error);
        });
    }

    /**
     *  Populate Quick Nav Menu template
     */
    private populateQuickNavMenu() {
        /* tslint:disable:no-string-literal */
        const template = quickNavTemplate({
            home: this.quickNavMenu["quick_nav"].shift(),
            menus: this.quickNavMenu["quick_nav"],
            product: this.quickNavMenu["quick_nav_product"],
            router_refresh: JSON.stringify(["main", "tab_navigation"]),
        });
        /* tslint:disable:no-string-literal */

        this.element.querySelector(".quick-nav-menu").innerHTML = template;
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
        if (this.checkEvent("tab_nav.highlight")) {
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
    }

    /**
     *  Helper function to broadcast Quick Nav is ready.
     *  Added timeout due to completion race issue
     */
    private broadcastTabNavReady() {
        ComponentManager.broadcast("tab_nav.ready", { ready: true });
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
