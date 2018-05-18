import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";

import * as promotionTemplate from "./handlebars/promotion.handlebars";

import Dropdown from "@app/assets/script/components/dropdown";

/**
 *
 */
export class PromotionsComponent implements ComponentInterface {
    onLoad(element: HTMLElement, attachments: {}) {
        const data = {title: "Promo"};
        console.log(data);
        console.log(promotionTemplate(data));
        this.activateDropdown();
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.activateDropdown();
    }

    private activateDropdown() {
        const dropdown = new Dropdown();
        dropdown.init();
    }
}
