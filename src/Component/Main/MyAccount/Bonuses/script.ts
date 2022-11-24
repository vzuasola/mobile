import * as utility from "@core/assets/js/components/utility";
import {ComponentInterface} from "@core/src/Plugins/ComponentWidget/asset/component";
import {Bonuses} from "./scripts/bonuses";

/**
 *
 */
export class BonusesComponent implements ComponentInterface {
    private bonus: Bonuses;

    onLoad(element: HTMLElement, attachments: {}) {
        this.activateBonuses(element, attachments);
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.activateBonuses(element, attachments);
    }

    /**
     * Activate Forgot Password
     */
    private activateBonuses(element, attachments) {
        this.bonus = new Bonuses(
            element,
            attachments,
        );
        this.bonus.init();
    }
}
