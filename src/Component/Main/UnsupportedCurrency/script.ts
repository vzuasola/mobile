import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";

/**
 *
 */
export class UnsupportedCurrencyComponent implements ComponentInterface {

    onLoad(element: HTMLElement, attachments: {}) {
        this.highlightMenu();
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.highlightMenu();
    }

    /**
     *  Helper function used to highlight product on Left Nav Menu
     */
    private highlightMenu() {
        const product = ComponentManager.getAttribute("product");
        const productClass = product.replace("mobile", "product");

        setTimeout (() => {
            ComponentManager.broadcast("menu.highlight", { menu: productClass });
        }, 200);
    }
}
