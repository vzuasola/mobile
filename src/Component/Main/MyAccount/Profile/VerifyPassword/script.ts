import * as utility from "@core/assets/js/components/utility";
import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import {VerifyPassword} from "./scripts/verify-password";

/**
 *
 */
export class MyAccountProfileVerifyPasswordComponent implements ComponentInterface {
    private verifyPassword: VerifyPassword;

    onLoad(element: HTMLElement, attachments: {}) {
        this.activateVerifyPassword(element, attachments);
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.activateVerifyPassword(element, attachments);
    }

    /**
     * Activate Forgot Password
     */
    private activateVerifyPassword(element, attachments) {
        this.verifyPassword = new VerifyPassword(
            element,
            attachments);
        this.verifyPassword.init();
    }
}
