import * as utility from "@core/assets/js/components/utility";
import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import Tab from "@app/assets/script/components/tab";
import {Marker} from "@app/assets/script/components/marker";

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

        const iconChecked = `<svg class="marker-active" viewbox="0 0 39.19 39.53">
            <use xlink:href="#check-rounded-thin" xmlns:xlink="http://www.w3.org/1999/xlink"></use></svg>`;
        const iconUnChecked = `<svg class="marker-normal" viewbox="0 0 100 100">
            <use xlink:href="#exclamation-rounded" xmlns:xlink="http://www.w3.org/1999/xlink"></use></svg>`;

        // Checkbox
        new Marker({
            parent: ".MyProfileForm_preference_markup",
            iconDefault: iconUnChecked,
            iconActive: iconChecked,
        });

        // Radio
        new Marker({
            parent: "#MyProfileForm_gender",
        });
    }
}
