import * as utility from "@core/assets/js/components/utility";
import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import {ResetPassword} from "./scripts/reset-password";

/**
 *
 */
export class CantLoginResetPasswordComponent implements ComponentInterface {
    private resetPassword: ResetPassword;

    onLoad(element: HTMLElement, attachments: {}) {
        this.activateResetPassword(element, attachments);
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.activateResetPassword(element, attachments);
    }

    /**
     * Activate Reset Password
     */
    private activateResetPassword(element, attachments) {
        this.resetPassword = new ResetPassword(
            element,
            attachments);
        this.resetPassword.init();
    }
}
