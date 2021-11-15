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
            url: Router.generateRoute("menu", "preference"),
            type: "json",
        }).then((response) => {
            if (response.success) {
                if (!this.isSupportedLanguage(src)) {
                    response.redirect = response.redirect.replace(
                        "\/" + ComponentManager.getAttribute("language") + "\/",
                        "/" + this.getRedirectLanguage(src) + "/");
                }
                // redirect to URL
                if (response.redirect) {
                    Router.navigate(response.redirect, ["*"], {removeParams: ["product"]});
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
