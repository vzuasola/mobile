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
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.listenCasinoOptionLightbox();
    }

    private listenCasinoOptionLightbox() {
        ComponentManager.subscribe("click", (event, src) => {
            if (utility.hasClass(src, "casino-option-trigger", true)) {
                event.preventDefault();
                Modal.open("#casino-option-lightbox");
            }
        });
    }
}
