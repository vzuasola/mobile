import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {Loader} from "@app/assets/script/components/loader";
import {Modal} from "@app/assets/script/components/modal";

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
            Modal.open("#casino-option-lightbox");
        });
    }

    private listenCasinoOptionLink() {
        ComponentManager.subscribe("click", (event, src) => {
            if (utility.hasClass(src, "casino-option")) {
                event.preventDefault();

                const product = src.getAttribute("data-preferred-casino");
                const unselectedProduct = (product === "casino_gold") ? ".casino-classic" : ".casino-gold";

                utility.removeClass(src, "select-option-muted");
                utility.addClass(this.element.querySelector(unselectedProduct), "select-option-muted");

                xhr({
                    url: Router.generateRoute("casino_option", "preference"),
                    type: "json",
                    method: "post",
                    data: {
                        product,
                    },
                }).then((response) => {
                    if (response.redirect) {
                        if (utility.isExternal(response.redirect)) {
                            window.location.href = response.redirect;
                        } else {
                            Router.navigate(response.redirect, ["header", "main"]);
                        }
                    }
                }).fail((error, message) => {
                    // do something
                });
            }
        });
    }

    private listenLogout() {
         ComponentManager.subscribe("session.logout", (event, target) => {
             Modal.close("#casino-option-lightbox");
         });
    }
}
