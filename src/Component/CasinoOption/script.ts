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

    constructor() {
        this.loader = new Loader(document.body, true);
    }

    onLoad(element: HTMLElement, attachments: {authenticated: boolean}) {
        this.listenToLogin();
        this.listenCasinoOptionLightbox(attachments);
        this.listenSettingsLightbox(attachments);
        this.listenCasinoOptionLink(element);
        this.listenLogout();
    }

    onReload(element: HTMLElement, attachments: {authenticated: boolean}) {
        // placeholder for reload
    }

    private listenSettingsLightbox(attachments) {
        ComponentManager.subscribe("click", (event, src) => {
            const el = utility.hasClass(src, "settings-trigger", true);
            if (el) {
                event.preventDefault();
                if (attachments.authenticated) {
                    this.loader.hide();
                    Modal.open("#casino-option-lightbox");
                }
            }
        });
    }

    private listenCasinoOptionLightbox(attachments) {
        ComponentManager.subscribe("click", (event, src) => {
            const el = utility.hasClass(src, "casino-option-trigger", true);
            if (el) {
                event.preventDefault();
                const product = el.getAttribute("product-id");
                if (attachments.authenticated) {
                    if (product === "product-casino") {
                        this.getPreferredCasino();
                    } else {
                        this.loader.hide();
                        Modal.open("#casino-option-lightbox");
                    }
                }
            }
        });
    }

    private listenToLogin() {
        ComponentManager.subscribe("session.login", (event, target, data: any) => {
            if (data && typeof data.src !== "undefined") {
                event.preventDefault();
                const el = utility.hasClass(data.src, "casino-option-trigger", true);
                if (el) {
                     this.getPreferredCasino();
                }
            }
        });
    }

    private listenCasinoOptionLink(element) {
        ComponentManager.subscribe("click", (event, src) => {
            if (utility.hasClass(src, "casino-option")) {
                event.preventDefault();
                const product = src.getAttribute("data-preferred-casino");
                const unselectedProduct = (product === "casino_gold") ? ".casino-classic" : ".casino-gold";
                utility.removeClass(src, "select-option-muted");
                utility.addClass(element.querySelector(unselectedProduct), "select-option-muted");

                xhr({
                    url: Router.generateRoute("casino_option", "preference"),
                    type: "json",
                    method: "post",
                    data: {
                        product,
                    },
                }).then((response) => {
                    if (response.lobby_url) {
                        if (utility.isExternal(response.lobby_url)) {
                            window.location.href = response.lobby_url;
                        } else {
                            Router.navigate(response.lobby_url, ["header", "main"]);
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

    private getPreferredCasino() {
        xhr({
            url: Router.generateRoute("casino_option", "preference"),
            type: "json",
        }).then((response) => {
            if (response.success) {
                if (!response.lobby_url) {
                    this.loader.hide();
                    Modal.open("#casino-option-lightbox");
                    console.log("no prefered");
                } else {
                    if (utility.isExternal(response.lobby_url)) {
                        window.location.href = response.lobby_url;
                    } else {
                        Router.navigate(response.lobby_url, ["header", "main"]);
                    }
                }
            } else {
                this.loader.hide();
                Modal.open("#login-lightbox");
            }
        }).fail((error, message) => {
            // do something
        });
    }

}
