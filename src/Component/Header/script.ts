import * as utility from "@core/assets/js/components/utility";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";
import cashierGaCode from "@app/assets/script/components/cashierGaCode";

/**
 *
 */
export class HeaderComponent implements ComponentInterface {
    private element: HTMLElement;
    private attachments: any;

    onLoad(element: HTMLElement, attachments: { authenticated: boolean }) {
        this.element = element;
        this.attachments = attachments;
        this.refreshBalance();
        this.activateCashierGaCode(element);

        Router.on(RouterClass.afterNavigate, (event) => {
            if (this.attachments.authenticated) {
                const wrapper = this.element.querySelector(".account-balance");
                const link = wrapper.querySelector("a");
                const loader = wrapper.querySelector("div");

                utility.addClass(link, "hidden");
                utility.removeClass(loader, "hidden");

                this.refreshBalance();
            }
        });
    }

    onReload(element: HTMLElement, attachments: { authenticated: boolean }) {
        this.element = element;
        this.attachments = attachments;
        this.refreshBalance();
        this.activateCashierGaCode(element);
    }

    private refreshBalance() {
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
                            const product = ComponentManager.getAttribute("product");

                            if (response.map.hasOwnProperty(product) && response.map[product] !== 0) {
                                let totalBalance = 0;
                                if (response.balances[response.map[product]]) {
                                    totalBalance += response.balances[response.map[product]];
                                }

                                if (response.bonuses[response.map[product]]) {
                                    totalBalance += response.bonuses[response.map[product]];
                                }

                                if (response.reserveBalances[response.map[product]]) {
                                    totalBalance += response.reserveBalances[response.map[product]];
                                }
                                balance.innerHTML = Number(totalBalance).toFixed(2);
                            }
                        }

                        utility.removeClass(link, "hidden");
                        utility.addClass(loader, "hidden");
                    }
                }
            },
        });
    }

    private activateCashierGaCode(element) {
        cashierGaCode(element, "account-balance", "cashier header");
    }
}
