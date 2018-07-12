import * as utility from "@core/assets/js/components/utility";
import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import {ResetPassword} from "./scripts/reset-password";
import {Router} from "@plugins/ComponentWidget/asset/router";

/**
 *
 */
export class ResetPasswordComponent implements ComponentInterface {
    private resetPassword: ResetPassword;

    onLoad(element: HTMLElement, attachments: {}) {
        this.activateResetPassword(element, attachments);
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.activateResetPassword(element, attachments);
    }

    private activateResetPassword(element, attachments) {
        this.resetPassword = new ResetPassword(
            element,
            attachments,
            Router.generateRoute("promotions", "promotions"));
        this.resetPassword.init();
    }
}
