import * as utility from "@core/assets/js/components/utility";

import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";

/**
 *
 */
export class FooterComponent implements ComponentInterface {
    onLoad(element: HTMLElement, attachments: {}) {
        this.downloadsVisibility(element);
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.downloadsVisibility(element);
    }

    private downloadsVisibility(element) {
        const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);

        if (ios) {
            utility.addClass(element.querySelector(".app-download"), "hidden");
        }
    }
}
