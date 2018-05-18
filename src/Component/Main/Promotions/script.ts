import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";

import Dropdown from "@app/assets/script/components/dropdown";

/**
 *
 */
export class PromotionsComponent implements ComponentInterface {
    onLoad(element: HTMLElement, attachments: {}) {
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
