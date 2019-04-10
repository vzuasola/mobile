import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {Loader} from "@app/assets/script/components/loader";
import {Modal} from "@app/assets/script/components/modal";
import {Redirector} from "@app/assets/script/components/redirector";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

/**
 *
 */
export class CasinoOptionComponent implements ComponentInterface {
    private loader: Loader;
    private element: HTMLElement;
    private isLogin: boolean;

    constructor() {
        this.loader = new Loader(document.body, true);
    }

    onLoad(element: HTMLElement, attachments: {authenticated: boolean}) {
        this.element = element;
        this.isLogin = attachments.authenticated;

        this.listenSettingsLightbox();
        this.listenCasinoOptionLink();
        this.listenLogout();
    }

    onReload(element: HTMLElement, attachments: {authenticated: boolean}) {
        this.element = element;
    }

    private listenSettingsLightbox() {
        ComponentManager.subscribe("click", (event, src) => {
            const el = utility.hasClass(src, "settings-trigger", true);

            if (el) {
                event.preventDefault();
                ComponentManager.broadcast("casino.preference");
            }
        });

        ComponentManager.subscribe("casino.preference", (event, src) => {
            this.getPreference({}, (response) => {
                if (response) {
                    this.setSelectedOption(response.preferredProduct);
                    Modal.open("#casino-option-lightbox");
                }
            });
        });
    }

    private listenCasinoOptionLink() {
        ComponentManager.subscribe("click", (event, src) => {
            const parentEl = utility.hasClass(src, "casino-option", true);
            if (parentEl) {
                event.preventDefault();

                const product = parentEl.getAttribute("data-preferred-casino");

                this.getPreference(product, (response) => {
                    if (response.preferredProduct && response.redirect) {
                        this.setSelectedOption(response.preferredProduct);

                        Router.navigate(response.redirect, ["*"]);
                        Modal.close("#casino-option-lightbox");
                    }
                });
            }
        });
    }

    private getPreference(product, callback) {
        xhr({
            url: Router.generateRoute("casino_option", "preference"),
            type: "json",
            method: "post",
            data: {
                preferred_product: product,
            },
        }).then((response) => {
            callback(response);
        }).fail((error, message) => {
            // do something
        });
    }

    private listenLogout() {
         ComponentManager.subscribe("session.logout", (event, target) => {
             Modal.close("#casino-option-lightbox");
         });
    }

    private setSelectedOption(selected) {
        const selectedEl = (selected === "casino_gold")
            ? ".casino-gold" : ".casino-classic";
        const unselectedProduct = (selected === "casino_gold")
            ? ".casino-classic" : ".casino-gold";
        utility.removeClass(this.element.querySelector(selectedEl), "select-option-muted");
        utility.addClass(this.element.querySelector(selectedEl), "selected");
        utility.addClass(this.element.querySelector(unselectedProduct), "select-option-muted");
        utility.removeClass(this.element.querySelector(unselectedProduct), "selected");
    }
}
