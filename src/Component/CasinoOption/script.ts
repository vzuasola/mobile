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

    onLoad(element: HTMLElement, attachments: {}) {
        this.listenCasinoOptionLightbox();
        this.bindCasinoRadioButton();
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.bindCasinoRadioButton();
    }

    private listenCasinoOptionLightbox() {
        ComponentManager.subscribe("click", (event, src) => {
            if (utility.hasClass(src, "casino-option-trigger", true)) {
                event.preventDefault();
                Modal.open("#casino-option-lightbox");
            }
        });
    }

    private bindCasinoRadioButton() {
        utility.delegate(document, ".casino-option", "click", (event, src) => {
            console.log(src.value);
            xhr({
                url: Router.generateRoute("casino_option", "preference"),
                type: "json",
                method: "post",
                data: {
                    preferred_casino: src.value,
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
        }, true);

    }

}
