import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";
import {Redirector} from "@app/assets/script/components/redirector";

import {Redirectable} from "../scripts/redirectable";

export class GenericIntegrationModule extends Redirectable implements ModuleInterface {
    protected code = "redirect";
    protected isLoginOnly = true;

    protected doRequest(src) {
        this.doRedirectAfterLogin(src);

    }

    protected doRedirectAfterLogin(src) {
        let redirect = utility.getParameterByName("re");
        if (!redirect) {
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
                        if (!this.isSupportedLanguage(src)) {
                            response.url = response.url.replace(
                                "\/" + ComponentManager.getAttribute("language") + "\/",
                                "/" + this.getRedirectLanguage(src) + "/");
                        }
                        Redirector.redirect(response.url, () => {
                            this.loader.hide();
                        });

                        return;
                    }

                    this.loader.hide();
                }).fail((error, message) => {
                    this.loader.hide();
                });
            }
        } else {
            xhr({
                url: Router.generateModuleRoute("product_integration", "process"),
                type: "json",
                method: "post",
                data: {
                    url: redirect,
                },
            }).then((response) => {
                if (response.url) {
                    redirect = response.url;
                    Redirector.redirect(redirect);
                }
            });
        }

    }
}
