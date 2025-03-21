import * as utility from "@core/assets/js/components/utility";
import EqualHeight from "@app/assets/script/components/equal-height";
import {ComponentManager, ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";

/**
 *
 */
export class ProductsComponent implements ComponentInterface {
    private element: HTMLElement;

    onLoad(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.equalizeProductHeight();
        this.componentFinish();
        this.listenToPartnerMatrixFilter();
        this.productsReady();
    }

    onReload(element: HTMLElement, attachments: {}) {
        if (!this.element) {
            this.listenToPartnerMatrixFilter();
        }
        this.element = element;
        this.equalizeProductHeight();
        this.componentFinish();
        this.productsReady();
    }

    private productsReady() {
        ComponentManager.broadcast("home.products.ready");
    }

    private equalizeProductHeight() {
        const equalProduct = new EqualHeight(".product-box");
        equalProduct.init();
    }

    private componentFinish() {
        ComponentManager.broadcast("token.parse", {
            element: this.element,
            method: "parseLink",
            selector: "[href*=ticket\\.token]",
        });
    }

    private listenToPartnerMatrixFilter() {
        ComponentManager.subscribe("post.login.partner.matrix.filter", (event, target, data) => {
            const products = this.element.querySelectorAll(".home-display li a");
            for (const productMenu in products) {
                if (products.hasOwnProperty(productMenu)) {
                    const instanceID = products[productMenu].getAttribute("data-product-instance-id");
                    if (data.disabled_products.indexOf(instanceID) > -1) {
                        utility.findParent(products[productMenu], "li").remove();
                    }
                }
            }

            // remove promotions tile
            if (this.element.querySelector("li.product-promotions")) {
                this.element.querySelector("li.product-promotions").remove();
            }
        });
    }
}
