import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

export class ProductIntegrationModule implements ModuleInterface {
    onLoad(attachments: {}) {
        this.bindToLogin();
        this.bindLaunchProduct();
    }

    private bindToLogin() {
        ComponentManager.subscribe("session.login", (event, target, data: any) => {
            if (data && typeof data.src !== "undefined") {
                event.preventDefault();
                const el = utility.hasClass(data.src, "product-integration", true);

                if (el) {
                    let product = data.src.getAttribute("product-id");
                    product = product.replace("product-", "");

                    this.getProductLink(product);
                }
            }
        });
    }

    private bindLaunchProduct() {
        ComponentManager.subscribe("click", (event, target, data) => {
            const el = utility.hasClass(target, "product-integration", true);

            if (el) {
                event.preventDefault();
                let product = el.getAttribute("product-id");
                product = product.replace("product-", "");

                this.getProductLink(product);
            }
        });
    }

    private getProductLink(product: string) {
        xhr({
            url: Router.generateModuleRoute(product + "_integration", "integrate"),
            type: "json",
            method: "post",
            data: {
                product,
            },
        }).then((response) => {
            if (response.lobby_url) {
                if (utility.isExternal(response.lobby_url)) {
                    window.location.href = response.lobby_url;
                } else {
                    Router.navigate(response.lobby_url, ["header", "main"]);
                }
            }
        }).fail((error, message) => {
            // do something
        });
    }
}
