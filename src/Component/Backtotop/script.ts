import * as utility from "@core/assets/js/components/utility";

import BacktoTop from "@app/assets/script/components/back-to-top";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";

import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";

/**
 *
 */
export class BacktotopComponent implements ComponentInterface {
    onLoad(element: HTMLElement, attachments: {}) {
        this.activeBackToTop(element);

        Router.on(RouterClass.afterNavigate, (event) => {
            ComponentManager.refreshComponent("backtotop");
        });
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.activeBackToTop(element);
    }

    private activeBackToTop(element) {
        const backtoTop = new BacktoTop(element);
        backtoTop.init();
    }
}
