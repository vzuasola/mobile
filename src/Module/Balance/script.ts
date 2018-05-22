import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";

/**
 *
 */
export class BalanceModule implements ModuleInterface {
    onLoad(attachments: {authenticated: boolean}) {
        if (attachments.authenticated) {
            this.getBalance();
        }

        ComponentManager.subscribe("balance.refresh", (event, src) => {
            this.getBalance();
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
