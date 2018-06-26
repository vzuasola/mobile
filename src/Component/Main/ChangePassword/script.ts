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
        // console.log("this.forgotUsername ", this.forgotUsername);

        this.forgotUsernameListeners(element);

    }

    private forgotUsernameListeners(element) {
        this.forgotUsername = new ForgotUsername(element, "#ForgotUsernameForm_email");
        // console.log("this.forgotUsername ", this.forgotUsername);

        const form: HTMLElement = element.querySelector(".forgot-username-form");

        utility.listen(form, "submit", (event, src: any) => {
            event.preventDefault();

            this.forgotUsername.checkField();

        });
    }

    private activateForgotPassword(element) {
        this.forgotPasswordListeners(element);
    }

    private forgotPasswordListeners(element) {
        this.forgotPassword = new ForgotPassword(element, "#ForgotPasswordForm_email", "#ForgotPasswordForm_username");

        const form: HTMLElement = element.querySelector(".forgot-password-form");

        utility.listen(form, "submit", (event, src: any) => {
            event.preventDefault();

            this.forgotPassword.checkField();

        });
    }
}
