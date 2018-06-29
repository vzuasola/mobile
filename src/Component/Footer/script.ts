import * as utility from "@core/assets/js/components/utility";

import BacktoTop from "@app/assets/script/components/back-to-top";

import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";

/**
 *
 */
export class FooterComponent implements ComponentInterface {
    onLoad(element: HTMLElement, attachments: {}) {
        this.backtotop(element);
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.backtotop(element);
    }

    private backtotop(element) {
        const backtotop = new BacktoTop(element);
    }
}
