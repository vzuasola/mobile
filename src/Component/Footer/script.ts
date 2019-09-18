import * as utility from "@core/assets/js/components/utility";
import * as Handlebars from "handlebars/runtime";

import * as xhr from "@core/assets/js/vendor/reqwest";

import * as footerTemplate from "./handlebars/menu.handlebars";

import {DafaConnect} from "@app/assets/script/dafa-connect";
import EqualHeight from "@app/assets/script/components/equal-height";

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
        this.getFooter();
        this.equalizeSponsorHeight();

        Router.on(RouterClass.afterNavigate, (event) => {
            this.refreshFooter();
        });
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.getFooter();
        this.equalizeSponsorHeight();
    }

    private equalizeSponsorHeight() {
        const equalSponsor = new EqualHeight(".sponsors-lists");
        equalSponsor.init();
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
            this.generateFooterMarkup(this.footerData);
            this.getOriginalUrl();
            this.attachProduct();
        });
    }

    /**
     * Set the download in the template
     *
     */
    private generateFooterMarkup(data) {
        const footer: HTMLElement = this.element.querySelector("#footer-menu");
        data = this.procesFooterMenu(data);
        data = this.casinoGoldVisibility(data);
        const template = footerTemplate({
            footerData: data,
            footerMenuClass: data.footer_menu.length === 2 ? "footer-mobile-item half"
                : ((data.footer_menu.length === 1) ? "footer-mobile full" : "footer-mobile-item"),
        });

        footer.innerHTML = template;
    }

    private procesFooterMenu(data) {
        const menus = [];
        for (const menu in data.footer_menu) {
            if (data.footer_menu.hasOwnProperty(menu)) {
                const element = data.footer_menu[menu];
                if (!DafaConnect.isDafaconnect() ||
                    (DafaConnect.isDafaconnect()
                        && !element.attributes.class.match("footer-desktop"))
                ) {
                    menus.push(element);
                }
            }
        }

        data.footer_menu = menus;
        return data;
    }

    private casinoGoldVisibility(data) {
        const menus = [];
        const product = ComponentManager.getAttribute("product");
        for (const menu in data.footer_menu) {
            if (data.footer_menu.hasOwnProperty(menu)) {
                const element = data.footer_menu[menu];
                if ((product !== "mobile-casino-gold" && product !== "mobile-exchange") ||
                    (product === product && (product === "mobile-casino-gold" || product === "mobile-exchange"))
                    && !element.attributes.class.match("language-trigger")) {
                    menus.push(element);
                }
            }
        }

        data.footer_menu = menus;
        return data;
    }
}
