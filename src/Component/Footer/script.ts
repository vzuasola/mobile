import * as utility from "@core/assets/js/components/utility";

import {CookieNotif} from "@app/assets/script/components/cookie-notif";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";

/**
 *
 */
export class FooterComponent implements ComponentInterface {
    private cookienotif: CookieNotif;
    private element: HTMLElement;
    private originalUrl: string;

    constructor() {
        this.cookienotif = new CookieNotif(document.body, true);
    }

    onLoad(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.getOriginalUrl();
        this.attachProduct();

        Router.on(RouterClass.afterNavigate, (event) => {
            this.getOriginalUrl();
            this.attachProduct();
        });
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.getOriginalUrl();
        this.attachProduct();
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
}
