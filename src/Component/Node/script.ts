import * as utility from "@core/assets/js/components/utility";

import EqualHeight from "@app/assets/script/components/equal-height";
import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";

/**
 *
 */
export class NodeComponent implements ComponentInterface {
    onLoad(element: HTMLElement, attachments: {}) {
        this.equalizeStickyHeight();
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.equalizeStickyHeight();
    }

    private equalizeStickyHeight() {
        const equalSticky = new EqualHeight(".sticky-box");
        equalSticky.init();
    }
}
