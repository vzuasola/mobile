import * as utility from "@core/assets/js/components/utility";
import {ComponentInterface} from "@core/src/Plugins/ComponentWidget/asset/component";
import {ChangePassword} from "./scripts/change-password";

/**
 *
 */
export class MyAccountChangePasswordComponent implements ComponentInterface {
    private changePassword: ChangePassword;

    onLoad(element: HTMLElement, attachments: {}) {
        this.activateChangePassword(element, attachments);
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.activateChangePassword(element, attachments);
    }

    /**
     * Activate Reset Password
     */
    private activateChangePassword(element, attachments) {
        this.changePassword = new ChangePassword(
            element,
            attachments);
        this.changePassword.init();
    }
}
