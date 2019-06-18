import * as utility from "@core/assets/js/components/utility";
import * as Handlebars from "handlebars/runtime";

import * as xhr from "@core/assets/js/vendor/reqwest";

import * as footerTemplate from "./handlebars/menu.handlebars";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";

/**
 *
 */
export class FooterComponent implements ComponentInterface {
    private element: HTMLElement;
    private originalUrl: string;
    private product: string;
    private footerData: any;

    onLoad(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.getOriginalUrl();
        this.attachProduct();
        this.attachProduct();
        this.getFooter();

        Router.on(RouterClass.afterNavigate, (event) => {
            this.getOriginalUrl();
            this.attachProduct();
            this.refreshFooter();
        });
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.getOriginalUrl();
        this.attachProduct();
        this.getFooter();
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

    private refreshFooter() {
        const product = ComponentManager.getAttribute("product");
        if (this.product !== product) {
            this.product = product;
            ComponentManager.refreshComponent("footer");
        }
    }

    private getFooter() {
        xhr({
            url: Router.generateRoute("footer", "footer"),
            type: "json",
        }).then((response) => {
            this.footerData = response;
            console.log(this.footerData);
            this.generateFooterMarkup(this.footerData);
        });
    }

    /**
     * Set the download in the template
     *
     */
    private generateFooterMarkup(data) {
        const footer: HTMLElement = this.element.querySelector("#footer");
        const template = footerTemplate({
            footerData: data,
        });

        footer.innerHTML = template;
    }
}
