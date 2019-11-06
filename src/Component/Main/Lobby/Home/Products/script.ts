import EqualHeight from "@app/assets/script/components/equal-height";
import {ComponentManager, ComponentInterface} from "@plugins/ComponentWidget/asset/component";

/**
 *
 */
export class ProductsComponent implements ComponentInterface {
    onLoad(element: HTMLElement, attachments: {}) {
        this.equalizeProductHeight();
        this.componentFinish(element);
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.equalizeProductHeight();
        this.componentFinish(element);
    }

    private equalizeProductHeight() {
        const equalProduct = new EqualHeight(".product-box");
        equalProduct.init();
    }

    private componentFinish(element) {
        ComponentManager.broadcast("token.parse", {
            element,
            method: "parseLink",
            selector: "[href*=ticket\\.token]",
        });
    }
}
