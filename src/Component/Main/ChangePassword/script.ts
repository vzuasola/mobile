import * as utility from "@core/assets/js/components/utility";
import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import Tab from "@app/assets/script/components/tab";
import {ForgotUsername} from "./scripts/forgot-username";
import {ForgotPassword} from "./scripts/forgot-password";

/**
 *
 */
export class ChangePasswordComponent implements ComponentInterface {
    private forgotUsername: ForgotUsername;
    private forgotPassword: ForgotPassword;
    private errorMessages: any;

    onLoad(element: HTMLElement, attachments: {}) {
        this.activateTab(element);
        this.activateForgotUsername(element);
        this.activateForgotPassword(element);
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.activateTab(element);
        this.activateForgotUsername(element);
        this.activateForgotPassword(element);
    }

    /**
     * Tab
     */
    private activateTab(element) {
        const tab = new Tab();
    }

    private activateForgotUsername(element) {
        this.forgotUsername = new ForgotUsername(element, "#ForgotUsernameForm_email");
        this.forgotUsername.init();
    }

    private activateForgotPassword(element) {
        this.forgotPassword = new ForgotPassword(element, "#ForgotPasswordForm_email", "#ForgotPasswordForm_username");
        this.forgotPassword.init();
    }
}
