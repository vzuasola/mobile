import * as utility from "@core/assets/js/components/utility";

import {CookieNotif} from "@app/assets/script/components/cookie-notif";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";

/**
 *
 */
export class FooterComponent implements ComponentInterface {
    private element: HTMLElement;
    private originalUrl: string;

    onLoad(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.getOriginalUrl();
        this.attachProduct();
        this.attachProduct();
        this.cookieNotif();
        this.listenOnCookieNotifClose();

        Router.on(RouterClass.afterNavigate, (event) => {
            this.getOriginalUrl();
            this.attachProduct();
        });
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.getOriginalUrl();
        this.attachProduct();
        this.cookieNotif();
        this.listenOnCookieNotifClose();
    }

    private getOriginalUrl() {
        const menu: HTMLElement = this.element.querySelector(".footer-desktop");

        if (menu) {
            const url = menu.getAttribute("href");

            if (url.indexOf("@product") !== -1) {
                this.originalUrl = menu.getAttribute("href");
            }
        }
    }

    private attachProduct() {
        const product = ComponentManager.getAttribute("product");
        const menu: HTMLElement = this.element.querySelector(".footer-desktop");

        if (menu && this.originalUrl) {
            let url = this.originalUrl;

            if (url.indexOf("@product") !== -1) {
                if (product !== "mobile-entrypage") {
                    url = url.replace("@product", product.replace("mobile-", ""));
                } else {
                    url = url.replace("@product", "");
                }
            }

            menu.setAttribute("href", url);
        }
    }

    private cookieNotif() {
        ComponentManager.subscribe("cookienotif.show", (event, src) => {
            this.toggleCookieNotif();
        });
    }

    private listenOnCookieNotifClose() {
        ComponentManager.subscribe("click", (event, src) => {
            if (utility.hasClass(src, "cookie-notif-close", 1)) {
                this.toggleCookieNotif();
            }
        });
    }

    private toggleCookieNotif() {
        const cookienotif = this.element.querySelector(".cookie-notif");
        if (cookienotif) {
            utility.toggleClass(cookienotif, "hidden");
        }
    }
}
