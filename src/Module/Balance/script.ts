import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";

/**
 *
 */
export class BalanceModule implements ModuleInterface {
    private balanceResponse: number;
    private stash = [];

    private isLogin: boolean = false;
    private isPending: boolean = false;

    onLoad(attachments: {authenticated: boolean}) {
        if (attachments.authenticated) {
            this.isLogin = true;
        }

        ComponentManager.subscribe("session.prelogin", (event, src, data) => {
            this.isLogin = true;
            this.balanceResponse = undefined;
        });

        ComponentManager.subscribe("session.logout", (event, src) => {
            this.isLogin = false;
        });

        // refreshes the balance on demand and execute an event named balance.fetch
        ComponentManager.subscribe("balance.refresh", (event, src) => {
            if (!this.isLogin) {
                return;
            }

            this.getBalance((response) => {
                ComponentManager.broadcast("balance.fetch", {
                    response,
                });
            });
        });

        // fetches the balance and execute a user supplied callback
        // this will not execute the subscribers
        ComponentManager.subscribe("balance.return", (event, src, data) => {
            if (!this.isLogin) {
                return;
            }

            if (this.balanceResponse) {
                data.success(this.balanceResponse);
            } else {
                if (this.isPending) {
                    this.stash.push(data.success);
                } else {
                    this.stash.push(data.success);

                    this.getBalance((response) => {
                        if (this.stash.length > 0) {
                            for (const item of this.stash) {
                                if (item) {
                                    item(response);
                                }
                            }
                        }

                        this.stash = [];
                    });
                }
            }
        });
    }

    /**
     *
     */
    private getBalance(success?) {
        this.isPending = true;

        xhr({
            url: Router.generateModuleRoute("balance", "balances"),
            type: "json",
        }).then((response) => {
            this.balanceResponse = response;
            this.isPending = false;

            if (success) {
                success(response);
            }
        });
    }
}
