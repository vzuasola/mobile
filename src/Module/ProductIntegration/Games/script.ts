import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";
import {Redirector} from "@app/assets/script/components/redirector";

import {Redirectable} from "../scripts/redirectable";

export class GamesIntegrationModule extends Redirectable implements ModuleInterface {
    protected code = "games";
    protected isLoginOnly = false;

    protected doRequest(src) {
        const url = src.getAttribute("data-post-login-url");

        if (url) {
            this.loader.show();

            xhr({
                url: Router.generateModuleRoute("login_redirect", "process"),
                type: "json",
                method: "post",
                data: {
                    url,
                },
            }).then((response) => {
                if (typeof response.url !== "undefined") {
                    if (utility.isExternal(response.url)) {
                        Redirector.redirect(response.url, () => {
                            this.loader.hide();
                        });

                        return;
                    }

                    Router.navigate(response.url, ["*"]);
                    this.loader.hide();
                    return;
                }

                this.loader.hide();
            }).fail((error, message) => {
                this.loader.hide();
            });
        }
    }
}
