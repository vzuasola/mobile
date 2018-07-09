import * as utility from "@core/assets/js/components/utility";
import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import Tab from "@app/assets/script/components/tab";
import {ForgotUsername} from "./scripts/forgot-username";
import {ForgotPassword} from "./scripts/forgot-password";
import {Router} from "@plugins/ComponentWidget/asset/router";

/**
 *
 */
export class CantLoginComponent implements ComponentInterface {
    private forgotUsername: ForgotUsername;
    private forgotPassword: ForgotPassword;

    onLoad(element: HTMLElement, attachments: {}) {
        this.activateTab(element);
        this.activateForgotUsername(element, attachments);
        this.activateForgotPassword(element, attachments);
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.activateTab(element);
        this.activateForgotUsername(element, attachments);
        this.activateForgotPassword(element, attachments);
    }

    /**
     * Tab
     */
    private activateTab(element) {
        const tab = new Tab();
    }

    private activateForgotUsername(element, attachments) {
        this.forgotUsername = new ForgotUsername(
            element,
            attachments,
            Router.generateRoute("promotions", "promotions"),
            "#ForgotUsernameForm_email");
        this.forgotUsername.init();
    }

    private activateForgotPassword(element, attachments) {
        this.forgotPassword = new ForgotPassword(
            element,
            attachments,
            Router.generateRoute("promotions", "promotions"),
            "#ForgotPasswordForm_email",
            "#ForgotPasswordForm_username");
        this.forgotPassword.init();
    }
}
