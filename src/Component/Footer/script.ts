import * as utility from "@core/assets/js/components/utility";

import BacktoTop from "@app/assets/script/components/back-to-top";

import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";

/**
 *
 */
export class FooterComponent implements ComponentInterface {
    private backTotop;

    constructor() {
        this.backTotop = new BacktoTop();
    }

    onLoad(element: HTMLElement, attachments: {}) {
         // Placeholder
    }

    onReload(element: HTMLElement, attachments: {}) {
         // Placeholder
    }
}
