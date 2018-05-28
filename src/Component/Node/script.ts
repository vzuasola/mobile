import * as utility from "@core/assets/js/components/utility";

import Accordion from "@app/assets/script/components/accordion";

import EqualHeight from "@app/assets/script/components/equal-height";
import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";

/**
 *
 */
export class NodeComponent implements ComponentInterface {
    onLoad(element: HTMLElement, attachments: {}) {
        this.equalizeStickyHeight();
        this.accordion(element);
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.equalizeStickyHeight();
        this.accordion(element);
    }

    private equalizeStickyHeight() {
        const equalSticky = new EqualHeight(".sticky-box");
        equalSticky.init();
    }

    private accordion(element) {
        const options = {
            element,
        };
        const accordion = new Accordion(options);
    }
}
