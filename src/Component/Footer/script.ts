import * as utility from "@core/assets/js/components/utility";

import BacktoTop from "@app/assets/script/components/back-to-top";

import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";

/**
 *
 */
export class FooterComponent implements ComponentInterface {
    onLoad(element: HTMLElement, attachments: {}) {
        this.activeBackToTop(element);
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.activeBackToTop(element);
    }

    private activeBackToTop(element) {
        const backtoTop = new BacktoTop(element);
        backtoTop.init();
    }
}
