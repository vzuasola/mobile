import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {Modal} from "@app/assets/script/components/modal";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

/**
 *
 */
export class CasinoOptionComponent implements ComponentInterface {
    private element: HTMLElement;

    onLoad(element: HTMLElement, attachments: {authenticated: boolean}) {
        this.listenCasinoOptionLightbox(attachments);
        this.bindCasinoRadioButton(element);
        this.listenLogout();
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.bindCasinoRadioButton(element);
    }

    private listenCasinoOptionLightbox(attachments) {
        ComponentManager.subscribe("click", (event, src) => {
            if (utility.hasClass(src, "casino-option-trigger", true)) {
                event.preventDefault();
                const product = src.getAttribute("product-id");
                if (attachments.authenticated) {
                    if (product === "product-casino") {
                        xhr({
                            url: Router.generateRoute("casino_option", "preference"),
                            type: "json",
                        }).then((response) => {
                            if (!response.casino_url) {
                                Modal.open("#casino-option-lightbox");
                            } else {
                                if (utility.isExternal(response.casino_url)) {
                                    window.location.href = response.casino_url;
                                } else {
                                    Router.navigate(response.casino_url, ["header", "main"]);
                                }
                            }
                        }).fail((error, message) => {
                            // do something
                        });
                    } else {
                        Modal.open("#casino-option-lightbox");
                    }
                }
            }
        });
    }

    private bindCasinoRadioButton(element) {

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
                    if (response.casino_url) {
                        if (utility.isExternal(response.casino_url)) {
                            window.location.href = response.casino_url;
                        } else {
                            Router.navigate(response.casino_url, ["header", "main"]);
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
