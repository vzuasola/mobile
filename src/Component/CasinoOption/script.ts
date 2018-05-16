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
        this.bindToLogin();
        this.bindCasinoOptionLightbox(attachments);
        this.bindCasinoOptionLink(element);
        this.bindLogout();
    }

    onReload(element: HTMLElement, attachments: {authenticated: boolean}) {
        this.bindCasinoOptionLightbox(attachments);
        this.bindCasinoOptionLink(element);
    }

    private bindCasinoOptionLightbox(attachments) {
        ComponentManager.subscribe("click", (event, src) => {
            if (utility.hasClass(src, "casino-option-trigger", true)) {
                event.preventDefault();
                const product = src.getAttribute("product-id");
                if (attachments.authenticated) {
                    if (product === "product-casino") {
                        this.getPreferredCasino();
                    } else {
                        Modal.open("#casino-option-lightbox");
                        this.loader.hide();
                    }
                }
            }
        });
    }

    private bindToLogin() {
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

    private bindCasinoOptionLink(element) {

        ComponentManager.subscribe("click", (event, src) => {
            if (utility.hasClass(src, "casino-option", true)) {
                event.preventDefault();
                const product = src.getAttribute("data-preferred-casino");
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

    private bindLogout() {
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
                    Modal.open("#casino-option-lightbox");
                    this.loader.hide();
                } else {
                    if (utility.isExternal(response.lobby_url)) {
                        window.location.href = response.lobby_url;
                    } else {
                        Router.navigate(response.lobby_url, ["header", "main"]);
                    }
                }
            } else {
                Modal.open("#login-lightbox");
                this.loader.hide();
            }
        }).fail((error, message) => {
            // do something
        });
    }

}
