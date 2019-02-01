import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";
import {Loader} from "@app/assets/script/components/loader";

export abstract class Redirectable implements ModuleInterface {
    protected code: string;
    protected isLoginOnly: boolean;
    protected module: string;

    protected loader;

    private element;
    private isLogin: boolean;

    constructor() {
        this.loader = new Loader(document.body, true);
    }

    onLoad(attachments: {authenticated: boolean}) {
        this.isLogin = attachments.authenticated;

        // whenever an element tagged as an integration has been clicked, it will do
        // the integration specific behavior for that product
        ComponentManager.subscribe("click", (event, src) => {
            const el = utility.find(src, (element) => {
                if (element) {
                    return element.getAttribute("data-product-integration-id") === this.code;
                }
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
                this.doRequest(el);
            }
        });

        // a very special event that allows use to set a product data
        // programatically, used by the direct access login URL with
        // login modal
        ComponentManager.subscribe("redirectable.set.product", (event, src, data) => {
            if (data &&
                data.src &&
                data.product === this.code
            ) {
                if (!this.isLogin) {
                    let onlyLogin = this.isLoginOnly;

                    if (typeof data.onlyLogin !== "undefined") {
                        onlyLogin = data.onlyLogin;
                    }

                    if (onlyLogin) {
                        this.element = data.src;

                        ComponentManager.broadcast("header.login", {
                            src: data.src,
                            productVia: data.src.getAttribute("data-product-login-via"),
                            regVia: data.src.getAttribute("data-product-reg-via"),
                        });

                        return;
                    }
                }

                this.loader.show();
                this.doRequest(data.src);
            }
        });

        ComponentManager.subscribe("session.prelogin", (event, src, data) => {
            this.isLogin = true;

            if (data && typeof data.src !== "undefined" && data.src === this.element) {
                this.doRequest(data.src);
            }
        });

        ComponentManager.subscribe("session.logout", (event) => {
            this.isLogin = false;
        });

        ComponentManager.subscribe("direct.login", (event, src, data) => {
            if (data && typeof data.srcElement !== "undefined") {
                const el: HTMLElement = data.srcElement
                    .querySelector(`[data-product-instance-id="${data.productCode}"]`);
                if (el && el.getAttribute("data-product-integration-id") === this.code) {
                    this.doDirectLogin(el);
                }
            }
        });

        ComponentManager.subscribe("integrate.product", (event, src, data) => {
            if (data && typeof data.srcElement !== "undefined") {
                const el: HTMLElement = data.srcElement
                    .querySelector(`[data-product-instance-id="${data.productCode}"]`);
                if (el && el.getAttribute("data-product-integration-id") === this.code) {
                    if (el) {
                        setTimeout(() => {
                            ComponentManager.broadcast("redirectable.set.product", {
                                product: el.getAttribute("data-product-integration-id"),
                                src: el,
                            });
                        }, 500);
                        return;
                    }

                    ComponentManager.broadcast("header.login");
                }
            }
        });
    }

    protected doRequest(src) {
        this.loader.show();

        xhr({
            url: Router.generateModuleRoute(this.module, "integrate"),
            type: "json",
            method: "post",
        }).then((response) => {
            if (typeof response.redirect !== "undefined") {
                window.location.href = response.redirect;
                return;
            }

            this.loader.hide();
        }).fail((error, message) => {
            this.loader.hide();
        });
    }

    protected doDirectLogin(element) {

        if (element) {
            setTimeout(() => {
                ComponentManager.broadcast("redirectable.set.product", {
                    product: element.getAttribute("data-product-integration-id"),
                    src: element,
                    onlyLogin: true,
                });
            }, 500);
            return;
        }

        ComponentManager.broadcast("header.login");
    }
}
