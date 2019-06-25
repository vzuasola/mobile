import * as utility from "@core/assets/js/components/utility";

import { ComponentInterface, ComponentManager } from "@plugins/ComponentWidget/asset/component";
import { Router, RouterClass } from "@plugins/ComponentWidget/asset/router";

/**
 *
 */
export class MarketingSpaceComponent implements ComponentInterface {
    private element: HTMLElement;

    onLoad(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.listenToHeader();
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.removeMetaElement();
    }

    private listenToHeader() {
        ComponentManager.subscribe("components.finish", () => {
            this.removeMetaElement();
        });

        Router.on(RouterClass.navigateError, (event) => {
            this.removeMetaElement();
        });

    }

    private removeMetaElement() {
        const meta = this.element.querySelector(".meta");

        if (meta) {
            meta.remove();
        }
    }
}
