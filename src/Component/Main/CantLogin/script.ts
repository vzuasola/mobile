import * as utility from "@core/assets/js/components/utility";
import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import Tab from "@app/assets/script/components/tab";
import {ForgotUsername} from "./scripts/forgot-username";
import {ForgotPassword} from "./scripts/forgot-password";
import {ResetPassword} from "./scripts/reset-password";
import {Router} from "@plugins/ComponentWidget/asset/router";
import {annotation} from "@app/assets/script/components/form-annotation";

/**
 *
 */
export class CantLoginComponent implements ComponentInterface {
    private forgotUsername: ForgotUsername;
    private forgotPassword: ForgotPassword;
    private resetPassword: ResetPassword;

    onLoad(element: HTMLElement, attachments: {}) {
        this.activateTab(element);
        this.activateForgotUsername(element, attachments);
        this.activateForgotPassword(element, attachments);
        this.activateResetPassword(element, attachments);
        this.activateFormAnnotation(element);
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.activateTab(element);
        this.activateForgotUsername(element, attachments);
        this.activateForgotPassword(element, attachments);
        this.activateResetPassword(element, attachments);
        this.activateFormAnnotation(element);
    }

    /**
     * Tab
     */
    private activateTab(element) {
        const tab = new Tab();
    }

    private activateFormAnnotation(element) {
        annotation(element);
    }

    private activateForgotUsername(element, attachments) {
        this.forgotUsername = new ForgotUsername(
            element,
            attachments,
            Router.generateRoute("cant_login", "forgotusername"),
            "#ForgotUsernameForm_email");
        this.forgotUsername.init();
    }

    private activateForgotPassword(element, attachments) {
        this.forgotPassword = new ForgotPassword(
            element,
            attachments,
            Router.generateRoute("cant_login", "forgotpassword"),
            "#ForgotPasswordForm_email",
            "#ForgotPasswordForm_username");
        this.forgotPassword.init();
    }

    private activateResetPassword(element, attachments) {
        this.resetPassword = new ResetPassword(
            element,
            attachments,
            Router.generateRoute("cant_login", "resetforgottenpassword"));
        this.resetPassword.init();
    }
}
