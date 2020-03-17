import * as utility from "@core/assets/js/components/utility";
import * as Handlebars from "handlebars/runtime";

import * as xhr from "@core/assets/js/vendor/reqwest";

import * as maintenanceTemplate from "./handlebars/maintenance.handlebars";
import {Router} from "@core/src/Plugins/ComponentWidget/asset/router";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";

/**
 *
 */
export class MaintenanceComponent implements ComponentInterface {
    private element: HTMLElement;
    private maintenanceData: any;

    onLoad(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.getMaintenance();
     }

    onReload(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.getMaintenance();
    }

    private getMaintenance() {
        const product = ComponentManager.getAttribute("product");
        const productUrl = utility.addQueryParam(Router.generateRoute(
            "maintenance", "maintenance"), "product", product);
        xhr({
            url: productUrl,
            type: "json",
        }).then((response) => {
            this.maintenanceData = response;
            this.generateMaintenanceMarkup(this.maintenanceData);
            this.highlightMenu();
        });
    }

    /**
     * Set the maintenance in the template
     *
     */
    private generateMaintenanceMarkup(data) {
        const maintenance: HTMLElement = this.element.querySelector("#maintenance");
        const template = maintenanceTemplate({
            data,
        });

        maintenance.innerHTML = template;
    }

    /**
     * Helper function that sends event to menu component to
     * highlight arcade menu tile
     */
    private highlightMenu() {
        let product = ComponentManager.getAttribute("product");
        product = product.replace("mobile-", "product-");
        ComponentManager.broadcast("menu.highlight", { menu: product });
    }
}
