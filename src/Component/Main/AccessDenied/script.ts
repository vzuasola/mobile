import * as utility from "@core/assets/js/components/utility";
import * as Handlebars from "handlebars/runtime";

import * as xhr from "@core/assets/js/vendor/reqwest";

import * as accessDeniedTemplate from "./handlebars/accessdenied.handlebars";
import {Router} from "@core/src/Plugins/ComponentWidget/asset/router";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";

/**
 *
 */
export class AccessDeniedComponent implements ComponentInterface {
    private element: HTMLElement;
    private accessDeniedData: any;

    onLoad(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.getAccessDenied();
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.getAccessDenied();
    }

    private getAccessDenied() {
        const product = ComponentManager.getAttribute("product");
        const productUrl = utility.addQueryParam(Router.generateRoute(
            "access_denied", "accessDenied"), "product", product);
        xhr({
            url: productUrl,
            type: "json",
        }).then((response) => {
            this.accessDeniedData = response;
            this.generateAccessDeniedMarkup(this.accessDeniedData);
        });
    }

    /**
     * Set the accessdenied in the template
     *
     */
    private generateAccessDeniedMarkup(data) {
        const accessDenied: HTMLElement = this.element.querySelector("#page-not-found");
        const template = accessDeniedTemplate({
            data,
        });

        accessDenied.innerHTML = template;
    }
}
