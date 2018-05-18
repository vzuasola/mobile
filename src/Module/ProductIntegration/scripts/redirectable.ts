import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";
import {Loader} from "@app/assets/script/components/loader";

export abstract class Redirectable implements ModuleInterface {
    protected code: string;
    protected isLoginOnly: boolean;
    protected module: string;

    private element;
    private loader;
    private isLogin: boolean;

    constructor() {
        this.loader = new Loader(document.body, true);
    }

    onLoad(attachments: {authenticated: boolean}) {
        this.isLogin = attachments.authenticated;

        ComponentManager.subscribe("click", (event, src) => {
            const el = utility.find(src, (element) => {
                return element.getAttribute("data-product-integration-id") === this.code;
            });

            if (el) {
                event.preventDefault();

                if (!this.isLogin) {
                    if (this.isLoginOnly) {
                        this.element = el;
                        ComponentManager.broadcast("header.login", {
                            src: el,
                            productVia: el.getAttribute("data-product-login-via"),
                            regVia: el.getAttribute("data-product-reg-via"),
                        });

                        return;
                    }
                }

                this.loader.show();
                this.doRequest();
            }
        });

        ComponentManager.subscribe("session.prelogin", (event, src, data) => {
            this.isLogin = true;

            if (data && typeof data.src !== "undefined" && data.src === this.element) {
                this.doRequest();
            }
        });

        ComponentManager.subscribe("session.logout", (event) => {
            this.isLogin = false;
        });
    }

    private doRequest() {
        xhr({
            url: Router.generateModuleRoute(this.module, "integrate"),
            type: "json",
            method: "post",
        }).then((response) => {
            if (typeof response.redirect !== "undefined") {
                window.location.href = response.redirect;
            }
        }).fail((error, message) => {
            // do something
        });
    }
}
