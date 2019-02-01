import * as utility from "@core/assets/js/components/utility";

import {ComponentManager, ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@core/src/Plugins/ComponentWidget/asset/router";

import {Loader} from "@app/assets/script/components/loader";

/**
 *
 */
export class LobbyComponent implements ComponentInterface {
    private loader: Loader;
    private isLogin: boolean = false;
    private productAlias: any;

    constructor() {
        this.loader = new Loader(document.body, true);
    }

    onLoad(
        element: HTMLElement,
        attachments: {
            authenticated: boolean,
            product_alias: any,
        },
    ) {
        this.isLogin = attachments.authenticated;
        this.productAlias = attachments.product_alias;

        ComponentManager.subscribe("session.prelogin", (event, src, data) => {
            this.isLogin = true;
        });

        ComponentManager.subscribe("session.logout", (event) => {
            this.isLogin = false;
        });
        this.doLoginProcess(element);
        this.integrateSports(element);
    }

    onReload(
        element: HTMLElement,
        attachments: {
            authenticated: boolean,
            product_alias: any,
        },
    ) {
        this.isLogin = attachments.authenticated;
        this.productAlias = attachments.product_alias;
        this.doLoginProcess(element);
        this.integrateSports(element);
    }

    private doLoginProcess(element) {
        if (Router.route() === "/login") {
            const product = utility.getParameterByName("product");
            let productCode = product;
            for (const originalProduct in this.productAlias) {
                if (this.productAlias.hasOwnProperty(originalProduct)) {
                    const aliases = this.productAlias[originalProduct];
                    if (aliases.includes(product)) {
                        productCode = originalProduct;
                    }
                }
            }

            ComponentManager.broadcast("direct.login", {srcElement: element, productCode});
        }
    }

    private integrateSports(element) {

        if (this.productAlias.sports.includes(Router.route().substring(1))) {
            ComponentManager.broadcast("integrate.product", {srcElement: element, productCode: "sports"});
        }
    }
}
