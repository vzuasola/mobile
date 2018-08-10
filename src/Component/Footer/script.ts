import * as utility from "@core/assets/js/components/utility";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";

/**
 *
 */
export class FooterComponent implements ComponentInterface {
    private element: HTMLElement;
    private originalOrl: string;

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
                this.originalOrl = menu.getAttribute("href");
            }
        }
    }

    private attachProduct() {
        const product = ComponentManager.getAttribute("product");
        const menu: HTMLElement = this.element.querySelector(".footer-desktop");

        if (menu && this.originalOrl) {
            let url = this.originalOrl;
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
