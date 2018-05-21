import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

/**
 *
 */
export class BalanceModule implements ModuleInterface {
    onLoad(attachments: {authenticated: boolean}) {
        if (attachments.authenticated) {
            this.getBalance();
        }

        ComponentManager.subscribe("session.login", (event, src) => {
            this.getBalance();
        });

        ComponentManager.subscribe("balance.fetch", (event, src, data: any) => {
            if (typeof data.response.balance !== "undefined") {
                const wrapper = document.querySelector(".account-balance");

                if (wrapper) {
                    const element = wrapper.querySelector(".account-balance-amount");
                    const link = wrapper.querySelector("a");
                    const loader = wrapper.querySelector("div");

                    if (element) {
                        element.innerHTML = data.response.balance;
                    }

                    utility.removeClass(link, "hidden");
                    utility.addClass(loader, "hidden");
                }
            }
        });
    }

    /**
     *
     */
    private getBalance() {
        xhr({
            url: Router.generateModuleRoute("balance", "balances"),
            type: "json",
        }).then((response) => {
            ComponentManager.broadcast("balance.fetch", {
                response,
            });
        });
    }
}
