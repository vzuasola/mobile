import * as utility from "@core/assets/js/components/utility";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";

/**
 *
 */
export class HeaderComponent implements ComponentInterface {
    private element: HTMLElement;

    onLoad(element: HTMLElement, attachments: { product: string }) {
        this.element = element;

        this.refreshBalance(attachments.product);
        Router.on(RouterClass.afterNavigate, (event) => {
            const wrapper = this.element.querySelector(".account-balance");
            const link = wrapper.querySelector("a");
            const loader = wrapper.querySelector("div");
            utility.addClass(link, "hidden");
            utility.removeClass(loader, "hidden");
            ComponentManager.refreshComponent("header");
        });
    }

    onReload(element: HTMLElement, attachments: { product: string }) {
        this.element = element;
        this.refreshBalance(attachments.product);
    }

    private refreshBalance(product) {
        ComponentManager.broadcast("balance.return", {
            success: (response) => {
                if (typeof response.balance !== "undefined") {
                    const wrapper = this.element.querySelector(".account-balance");

                    if (wrapper) {
                        const balance = wrapper.querySelector(".account-balance-amount");
                        const link = wrapper.querySelector("a");
                        const loader = wrapper.querySelector("div");

                        if (balance) {
                            balance.innerHTML = response.balance;
                            if (product) {
                                balance.innerHTML = response.balances[product];
                            }
                        }

                        utility.removeClass(link, "hidden");
                        utility.addClass(loader, "hidden");
                    }
                }
            },
        });
    }
}
