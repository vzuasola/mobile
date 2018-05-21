import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";

import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";

/**
 *
 */
export class SEOComponent implements ComponentInterface {
    onLoad(element: HTMLElement, attachments: {}) {
        Router.on(RouterClass.afterNavigate, (event) => {
            ComponentManager.refreshComponent("seo");
        });
    }

    onReload(element: HTMLElement, attachments: {}) {
        // Do nothing
    }
}
