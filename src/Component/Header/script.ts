import * as utility from "@core/assets/js/components/utility";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

/**
 *
 */
export class HeaderComponent implements ComponentInterface {
    private element: HTMLElement;

    onLoad(element: HTMLElement, attachments: {}) {
        this.element = element;

        ComponentManager.subscribe("balance.fetch", (event, src, data: any) => {
            if (typeof data.response.balance !== "undefined") {
                const wrapper = this.element.querySelector(".account-balance");

                if (wrapper) {
                    const balance = wrapper.querySelector(".account-balance-amount");
                    const link = wrapper.querySelector("a");
                    const loader = wrapper.querySelector("div");

                    if (balance) {
                        balance.innerHTML = data.response.balance;
                    }

                    utility.removeClass(link, "hidden");
                    utility.addClass(loader, "hidden");
                }
            }
        });
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.element = element;

        ComponentManager.broadcast("balance.refresh");
    }
}
