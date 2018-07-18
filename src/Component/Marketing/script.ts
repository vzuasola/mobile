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
        const stash = [];
        const scripts = element.querySelectorAll("script");

        for (const key in scripts) {
            if (scripts.hasOwnProperty(key)) {
                const script = scripts[key];
                const body = script.innerHTML;

                const scriptAppend = document.createElement("script");

                scriptAppend.appendChild(document.createTextNode(body));
                stash.push(scriptAppend);
                script.remove();
            }
        }

        for (const item of stash) {
            element.appendChild(item);
        }
    }
}
