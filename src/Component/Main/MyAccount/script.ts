import * as utility from "@core/assets/js/components/utility";
import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import Tab from "@app/assets/script/components/tab";
import {CheckboxStyler} from "@app/assets/script/components/checkbox-styler";
import {RadioStyler} from "@app/assets/script/components/radio-styler";

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

        // Checkbox styler
        const checkbox = new CheckboxStyler(element.querySelector("#ProfileForm_contact_preference"));
        checkbox.init();

        const radio = new RadioStyler("#MyProfileForm_gender");
        radio.init();
    }
}
