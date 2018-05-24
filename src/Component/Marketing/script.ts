import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";

import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";

/**
 *
 */
export class MarketingComponent implements ComponentInterface {
    onLoad(element: HTMLElement, attachments: {}) {
        Router.on(RouterClass.afterNavigate, (event) => {
            ComponentManager.refreshComponent("marketing");
        });
    }

    onReload(element: HTMLElement, attachments: {}) {
        // Do nothing
    }
}
