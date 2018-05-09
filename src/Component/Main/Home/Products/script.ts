import EqualHeight from "@app/assets/script/components/equal-height";
import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";

/**
 *
 */
export class ProductsComponent implements ComponentInterface {
    onLoad(element: HTMLElement, attachments: {}) {
        // placeholder for on load event
        this.equalizeProductHeight();
        this.equalizeDownloadHeight();
    }

    onReload(element: HTMLElement, attachments: {}) {
        // placeholder for on reload event
        this.equalizeProductHeight();
        this.equalizeDownloadHeight();
    }

    private equalizeProductHeight() {
        const equalProduct = new EqualHeight(".product-box");
        equalProduct.init();
    }

    private equalizeDownloadHeight() {
        const equalDownload = new EqualHeight(".download-box");
        equalDownload.init();
    }
}
