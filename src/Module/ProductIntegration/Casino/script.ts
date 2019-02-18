import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";
import {Redirector} from "@app/assets/script/components/redirector";

import {Redirectable} from "../scripts/redirectable";

export class CasinoIntegrationModule extends Redirectable implements ModuleInterface {
    protected code = "casino";
    protected isLoginOnly = false;

    doRequest(src) {
        this.getPreferredCasino(src);
    }

    private getPreferredCasino(src) {
        this.loader.show();

        xhr({
            url: Router.generateRoute("casino_option", "preference"),
            type: "json",
        }).then((response) => {
            if (response.success) {
                // redirect to URL
                if (response.redirect) {
                    if (utility.isExternal(response.redirect) ||
                        response.preferredProduct === "casino_gold"
                    ) {
                        const url = decodeURIComponent(response.redirect).replace(/\\/g, "");
                        alert(url);
                        Redirector.redirect(url, () => {
                            this.loader.hide();
                        });

                        return;
                    }

                    Router.navigate(response.redirect, ["*"]);
                    this.loader.hide();
                    return;
                }

                ComponentManager.broadcast("casino.preference");
            }

            this.loader.hide();
        }).fail((error, message) => {
            this.loader.hide();
        });
    }
}
