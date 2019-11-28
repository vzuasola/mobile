import * as utility from "@core/assets/js/components/utility";
import * as Handlebars from "handlebars/runtime";

import * as xhr from "@core/assets/js/vendor/reqwest";

import * as infobarTemplate from "./handlebars/infobar.handlebars";
import { Router } from "@core/src/Plugins/ComponentWidget/asset/router";

import {ComponentManager, ComponentInterface} from "@plugins/ComponentWidget/asset/component";

/**
 *
 */
export class InfobarComponent implements ComponentInterface {
    private element: HTMLElement;
    private InfobarData: any;
    onLoad(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.getInfobar();
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.getInfobar();
    }

    private getInfobar() {
        xhr({
            url: Router.generateRoute("home_infobar", "infobar"),
            type: "json",
        }).then((response) => {
            this.InfobarData = response;
            this.generateInfobarMarkup(this.InfobarData);
        });
    }

    /**
     * Set the infobar in the template
     *
     */
    private generateInfobarMarkup(data) {
        const Infobar: HTMLElement = this.element.querySelector("#home-infobar");
        const template = infobarTemplate({
            InfobarData: data,
        });

        Infobar.innerHTML = template;
    }

}
