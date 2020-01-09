import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

export class ProductIntegrationModule implements ModuleInterface {

    private attachments: any;
    private product: string;

    onLoad(attachments: {
        authenticated: boolean,
        productMapping: any,
        matrix: boolean,
        productAlias: any,
        productCodeMapping: any,
    }) {
        this.attachments = attachments;
        this.playerMatrixRedirect();
        this.onLoggedInListener();
    }

    private playerMatrixRedirect() {
        const product = (Router.route() === "/login" &&  utility.getParameterByName("product"))
            ? this.getProductFromParam() : ComponentManager.getAttribute("product");
        if (this.attachments.matrix && Router.route() !== "/sports-df" &&
            this.attachments.productMapping[product]
        ) {
            const url = "/" + ComponentManager.getAttribute("language") + "/"
                + this.attachments.productMapping[product];

            // Redirect to als on load if player matrix
            window.location.href = url;
        }
    }

    private getProductFromParam() {
        const product = utility.getParameterByName("product") ? utility.getParameterByName("product")
                : "mobile-entrypage";
        let productCode = product;
        for (const originalProduct in this.attachments.productAlias) {
            if (this.attachments.productAlias.hasOwnProperty(originalProduct)) {
                const aliases = this.attachments.productAlias[originalProduct];
                if (aliases.includes(product)) {
                    productCode = originalProduct;
                }
            }
        }
        return this.attachments.productCodeMapping.hasOwnProperty(productCode)
            ? this.attachments.productCodeMapping[productCode] : "mobile-entrypage";
    }

    private onLoggedInListener() {
        ComponentManager.subscribe("session.login", (event, src, data) => {
            const product = (Router.route() === "/login" &&  utility.getParameterByName("product"))
            ? this.getProductFromParam() : ComponentManager.getAttribute("product");
            if (data.response.matrix &&
                this.attachments.productMapping[product]
            ) {
                const url = "/" + ComponentManager.getAttribute("language") + "/"
                    + this.attachments.productMapping[product];
                window.location.href = url;
            }
        });
    }
}
