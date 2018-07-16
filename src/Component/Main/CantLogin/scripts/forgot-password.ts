import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";
import {Router} from "@plugins/ComponentWidget/asset/router";
import {ForgotUsername} from "./forgot-username";

/**
 * Forgot password
 *
 * @param Node element component parent element
 * @param Object attachments
 * @param String url
 * @param String emailField selector to target for email
 * @param String passwordField selector to target for password
 */
export class ForgotPassword extends ForgotUsername {
    passwordField: HTMLFormElement;

    constructor(element: HTMLElement, attachments: any, url: string, emailField: any, passwordField: any) {
        super(element, attachments, url, emailField);
        this.passwordField = this.element.querySelector(passwordField);
    }

    checkField() {
        // Remove/hide error message & Show loader
        this.hideMessage(this.emailContainer);
        this.loader.show();

        // Disable fields
        this.disableFields(this.form);

        xhr({
            url: this.url,
            type: "json",
            method: "post",
            data: {
                username: this.passwordField.value,
                email: this.emailField.value,
            },
        })
            .then((resp) => {
                if (resp.message === "FORGOT_PASSWORD_SUCCESS") {
                    this.showConfirmationMessage(this.form);
                } else {
                    this.showMessage(this.emailContainer, this.messageMapping(resp.message));
                }
            })
            .fail((err, msg) => {
                this.showMessage(this.emailContainer, "Error retrieving data...");
            })
            .always((resp) => {
                this.loader.hide();
                this.enableFields(this.form);
            });
    }
}
