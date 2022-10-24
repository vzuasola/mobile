import * as utility from "@core/assets/js/components/utility";
import {FormBase} from "@app/assets/script/components/form-base";
import {Modal} from "@app/assets/script/components/modal";
import Notification from "@app/assets/script/components/notification";
import * as verificationTemplate from "./../templates/handlebars/profile-changes.handlebars";
import * as questionMarkTemplate from "@app/templates/handlebars/question-mark.handlebars";
import {Loader} from "@app/assets/script/components/loader";
import {ComponentManager} from "@core/src/Plugins/ComponentWidget/asset/component";

/**
 * Bonuses
 *
 * @param Node element component parent element
 * @param Object attachments
 */
export class Bonuses extends FormBase {
    private form: HTMLFormElement;

    constructor(element: HTMLElement, attachments: {}) {
        super(element, attachments);
    }

    init() {
        console.log("Bonuses");
    }
}
