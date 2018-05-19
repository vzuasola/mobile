import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

import {Redirectable} from "../scripts/redirectable";

export class CasinoIntegrationModule extends Redirectable implements ModuleInterface {
    protected code = "casino";
    protected isLoginOnly = true;

    doRequest(src) {
        this.getPreferredCasino();
    }

    private getPreferredCasino() {
        xhr({
            url: Router.generateRoute("casino_option", "preference"),
            type: "json",
        }).then((response) => {
            if (response.success) {
                if (!response.redirect) {
                    ComponentManager.broadcast("casino.preference");
                    this.loader.hide();
                } else {
                    if (utility.isExternal(response.redirect)) {
                        window.location.href = response.redirect;
                    } else {
                        Router.navigate(response.redirect, ["header", "main"]);
                    }
                }
            }
        }).fail((error, message) => {
            // do something
        });
    }
}
