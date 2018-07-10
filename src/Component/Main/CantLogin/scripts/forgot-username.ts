import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";
import {Router} from "@plugins/ComponentWidget/asset/router";
import {Loader} from "@app/assets/script/components/loader";
import {CantLoginBase} from "./cant-login-base";

/**
 * Forgot username
 *
 * @param Node element component parent element
 * @param Object attachments
 * @param String url
 * @param String emailField selector to target for email
 * @param String passwordField selector to target for password
 */
export class ForgotUsername extends CantLoginBase {
    url: string;
    emailField: HTMLFormElement;
    emailContainer: HTMLElement;
    form: HTMLFormElement;
    loader: Loader;

    constructor(element: HTMLElement, attachments: any, url: string, emailField: any) {
        super(element, attachments);
        this.element = element;
        this.attachments = attachments;
        this.url = url;
        this.emailField = this.element.querySelector(emailField);
    }

    init() {
        if (this.emailField) {
            console.log("this.attachments ", this.attachments);
            this.emailContainer = utility.hasClass(this.emailField, "form-item", true);
            this.form = utility.findParent(this.emailField, "form");
            this.loader = new Loader(utility.hasClass(this.emailField, "form-item", true), false, 0);
            this.bindEvent();
        }
    }

    bindEvent() {
        // Listen form on submit
        utility.listen(this.form, "submit", (event, src) => {
            event.preventDefault();

            setTimeout(() => {
                const fields = Array.prototype.slice.call(this.form.elements);

                const hasError = fields.filter((field) => {
                    return utility.hasClass(field, "has-error", true);
                });

                if (hasError.length < 1) {
                    this.checkField();
                }
            }, 100);
        });

        // close button element on success/confirmation message
        const formParent = utility.findParent(this.form, "div");
        const closeBtn = formParent.querySelector(".confirmation-message").querySelector(".btn");

        utility.listen(closeBtn, "click", (event) => {
            event.preventDefault();
            window.close();
        });
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
                email: this.emailField.value,
            },
        })
            .then((resp) => {
                // TEMPORARY
                resp = {
                    message: "FORGOT_USERNAME_FAILED",
                    // message: "FORGOT_USERNAME_SUCCESS",
                    response_code: "INT036",
                };

                if (resp.message === "FORGOT_USERNAME_SUCCESS") {
                    this.showConfirmationMessage(this.form);
                } else {
                    this.showMessage(this.emailContainer, this.messageMapping(resp.message));
                    // this.showMessage(this.emailContainer, this.attachments.messages[resp.message]);
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
