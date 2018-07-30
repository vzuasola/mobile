import * as utility from "@core/assets/js/components/utility";
import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import {ForgotPassword} from "./scripts/forgot-password";

/**
 *
 */
export class CantLoginForgotPasswordComponent implements ComponentInterface {
    private forgotPassword: ForgotPassword;

    onLoad(element: HTMLElement, attachments: {}) {
        this.activateForgotPassword(element, attachments);
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.activateForgotPassword(element, attachments);
    }

    /**
     * Activate Forgot Password
     */
    private activateForgotPassword(element, attachments) {
        this.forgotPassword = new ForgotPassword(
            element,
            attachments);
        this.forgotPassword.init();
    }
}
