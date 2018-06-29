import * as utility from "@core/assets/js/components/utility";

import BacktoTop from "@app/assets/script/components/back-to-top";

import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";

/**
 *
 */
export class FooterComponent implements ComponentInterface {
    private element: HTMLElement;

    onLoad(element: HTMLElement, attachments: {}) {
        this.element = element;
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.element = element;
    }

    private backTotop(element) {
        const backtotop = new BacktoTop(element);
    }
}
