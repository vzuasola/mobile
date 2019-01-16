import * as utility from "@core/assets/js/components/utility";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";

/**
 *
 */
export class PWAComponent implements ComponentInterface {
    private element: HTMLElement;
    private originalUrl: string;

    onLoad(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.showPWA();
        this.listenOnPWAClose();
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.showPWA();
    }

    private showPWA() {
        ComponentManager.subscribe("pwa.show", (event, src) => {
            this.togglePWA();
        });
    }

    private listenOnPWAClose() {
        ComponentManager.subscribe("click", (event, src) => {
            if (utility.hasClass(src, "btn-pwa-close", 1)) {
                this.togglePWA();
            }
        });
    }

    private togglePWA() {
        const pwa = this.element.querySelector(".btn-pwa");
        if (pwa) {
            utility.toggleClass(pwa, "hidden");
        }
    }
}
