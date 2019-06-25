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
    private productDirectIntegration: any = [];

    constructor() {
        this.loader = new Loader(document.body, true);
    }

    onLoad(
        element: HTMLElement,
        attachments: {
            authenticated: boolean,
            product_alias: any,
            product_direct_integration: any,
        },
    ) {
        this.isLogin = attachments.authenticated;
        this.productAlias = attachments.product_alias;
        this.productDirectIntegration = attachments.product_direct_integration;

        ComponentManager.subscribe("session.prelogin", (event, src, data) => {
            this.isLogin = true;
        });

        ComponentManager.subscribe("session.logout", (event) => {
            this.isLogin = false;
        });
        this.listenCasinoGoldRedirect();
        this.doLoginProcess(element);
        this.integrateProduct(element);
    }

    onReload(
        element: HTMLElement,
        attachments: {
            authenticated: boolean,
            product_alias: any,
            product_direct_integration: any,
        },
    ) {
        this.isLogin = attachments.authenticated;
        this.productAlias = attachments.product_alias;
        this.productDirectIntegration = attachments.product_direct_integration;
        this.doLoginProcess(element);
        this.integrateProduct(element);
    }

    private doLoginProcess(element) {
        if (Router.route() === "/login") {
            const product = utility.getParameterByName("product") ? utility.getParameterByName("product")
                : "mobile-entrypage";
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

    private integrateProduct(element) {
        const product = ComponentManager.getAttribute("product");
        if (this.productDirectIntegration && this.productDirectIntegration.hasOwnProperty(product)) {
            const productCode = this.productDirectIntegration[product];
            if (productCode && this.productAlias[productCode].includes(Router.route().substring(1))) {
                ComponentManager.broadcast("integrate.product", {srcElement: element, productCode});
            }
        }
    }

    private listenCasinoGoldRedirect() {
        ComponentManager.subscribe("redirect.postlogin.casino-gold", (event, src, data) => {
           data.loader.hide();
        });
    }
}
