import * as utility from "@core/assets/js/components/utility";

import {ComponentManager, ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import {Loader} from "@app/assets/script/components/loader";

/**
 *
 */
export class AuthenticateComponent implements ComponentInterface {
    private loader: Loader;
    private isLogin: boolean = false;

    constructor() {
        this.loader = new Loader(document.body, true);
    }

    onLoad(element: HTMLElement, attachments: {authenticated: boolean}) {
        this.isLogin = attachments.authenticated;

        ComponentManager.subscribe("session.prelogin", (event, src, data) => {
            this.isLogin = true;
        });

        ComponentManager.subscribe("session.logout", (event) => {
            this.isLogin = false;
        });

        this.doLoginProcess(element);
    }

    onReload(element: HTMLElement, attachments: {authenticated: boolean}) {
        this.isLogin = attachments.authenticated;

        this.doLoginProcess(element);
    }

    private doLoginProcess(element) {
        const product = utility.getParameterByName("product");

        if (product) {
            const el: HTMLElement = element.querySelector(`[data-product-integration-id="${product}"]`);

            if (el) {
                setTimeout(() => {
                    ComponentManager.broadcast("redirectable.set.product", {
                        product,
                        src: el,
                    });
                }, 500);

                return;
            }
        }

        ComponentManager.broadcast("header.login");
    }
}
