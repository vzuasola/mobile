import EqualHeight from "@app/assets/script/components/equal-height";
import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";

/**
 *
 */
export class ProductsComponent implements ComponentInterface {
    onLoad(element: HTMLElement, attachments: {}) {
        this.equalizeProductHeight();
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.equalizeProductHeight();
    }

    private equalizeProductHeight() {
        const equalProduct = new EqualHeight(".product-box");
        equalProduct.init();
    }
}
