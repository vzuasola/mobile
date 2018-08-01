import * as utility from "@core/assets/js/components/utility";
import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import {ForgotUsername} from "./scripts/forgot-username";

/**
 *
 */
export class CantLoginForgotUsernameComponent implements ComponentInterface {
    private forgotUsername: ForgotUsername;

    onLoad(element: HTMLElement, attachments: {}) {
        this.activateForgotUsername(element, attachments);
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.activateForgotUsername(element, attachments);
    }

    /**
     * Activate Forgot Username
     */
    private activateForgotUsername(element, attachments) {
        this.forgotUsername = new ForgotUsername(
            element,
            attachments);
        this.forgotUsername.init();
    }
}
