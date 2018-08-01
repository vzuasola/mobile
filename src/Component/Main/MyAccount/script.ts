import * as utility from "@core/assets/js/components/utility";
import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import Tab from "@app/assets/script/components/tab";

/**
 *
 */
export class MyAccountComponent implements ComponentInterface {
    onLoad(element: HTMLElement, attachments: {}) {
        this.init(element);
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.init(element);
    }

    private init(element) {
        new Tab();
    }
}
