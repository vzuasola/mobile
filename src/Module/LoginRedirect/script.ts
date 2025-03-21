import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";
import {Loader} from "@app/assets/script/components/loader";

export class LoginRedirectModule implements ModuleInterface {
    private loader: Loader;
    private element;
    private isLogin: boolean;
    private matrix: boolean;

    constructor() {
        this.loader = new Loader(document.body, true);
    }

    onLoad(attachments: {authenticated: boolean, matrix: boolean}) {
        this.isLogin = attachments.authenticated;
        this.matrix = attachments.matrix;

        ComponentManager.subscribe("click", (event, src) => {
            if (!this.isLogin) {
                const el = utility.find(src, (element) => {
                    return element.getAttribute("data-post-login-url") &&
                        element.getAttribute("data-product-require-post-login") === "true";
                });

                if (el) {
                    event.preventDefault();
                    this.element = el;
                    ComponentManager.broadcast("header.login", {
                        src: el,
                        action: (srcElement) => {
                            this.doRedirectAfterLogin(srcElement);
                        },
                    });
                }
            }
        });

        /**
         * Event listener on click of .btn-login-trigger which invokes login lightbox
         */
        ComponentManager.subscribe("click", (event, src) => {
            if (!this.isLogin) {
                const el = utility.hasClass(src, "btn-login-trigger", true);
                if (el && !this.isLogin) {
                    ComponentManager.broadcast("header.login", {
                        src: el,
                    });
                }
            }
        });

        ComponentManager.subscribe("session.prelogin", (event, src, data) => {
            this.isLogin = true;
        });

        ComponentManager.subscribe("session.logout", (event) => {
            this.isLogin = false;
        });

        ComponentManager.subscribe("session.login", (event, src, data) => {
            this.matrix = data.response.matrix;
        });
    }

    private doRedirectAfterLogin(src) {
        if (src && src === this.element) {
            this.doRequest(src.getAttribute("data-post-login-url"));
        }
    }

    private doRequest(url) {
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
}
