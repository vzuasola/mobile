import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

import {Redirectable} from "../scripts/redirectable";

export class GenericIntegrationModule extends Redirectable implements ModuleInterface {
    protected code = "redirect";
    protected isLoginOnly = true;

    protected doRequest(src) {
        const url = src.getAttribute("data-post-login-url");

        if (url) {
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
                        window.location.href = response.url;
                    } else {
                        Router.navigate(response.url, ["header", "main"]);
                    }
                }
            }).fail((error, message) => {
                // do something
            });
        }

        // post login url was not found
        // generic application handling here
    }
}
