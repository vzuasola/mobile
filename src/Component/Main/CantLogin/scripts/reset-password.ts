import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";
import {Loader} from "@app/assets/script/components/loader";
import {CantLoginBase} from "@app/src/Component/Main/CantLogin/scripts/cant-login-base";

/**
 * Forgot username
 *
 * @param Node element component parent element
 * @param Object attachments
 * @param String url
 */
export class ResetPassword extends CantLoginBase {
    url: string;
    form: HTMLFormElement;
    passwordField: HTMLFormElement;
    passwordFieldVerify: HTMLFormElement;
    passwordVerifyContainer: HTMLElement;
    token: string;
    loader: Loader;

    constructor(element: HTMLElement, attachments: any, url: string) {
        super(element, attachments);
        this.element = element;
        this.attachments = attachments;
        this.url = url;
    }

    init() {
        this.form = this.element.querySelector(".reset-password-form");

        if (this.form) {
            this.passwordField = this.form.ResetPasswordForm_new_password;
            this.passwordFieldVerify = this.form.ResetPasswordForm_verify_password;
            this.passwordVerifyContainer = utility.hasClass(this.passwordFieldVerify, "form-item", true);
            this.token = utility.getParameterByName("sbfpw", document.referrer);
            this.loader = new Loader(utility.hasClass(this.passwordVerifyContainer, "form-item", true), false, 0);
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
    }

    checkField() {
        // Remove/hide error message & Show loader
        this.hideMessage(this.passwordVerifyContainer);
        this.loader.show();

        // Disable fields
        this.disableFields(this.form);

        xhr({
            url: this.url,
            type: "json",
            method: "post",
            data: {
                token: this.token,
                password : this.passwordField.value,
            },
        })
            .then((resp) => {
                if (resp.message === "CHANGE_FORGOTTEN_PASSWORD_SUCCESS") {
                    this.showConfirmationMessage(this.form);
                } else {
                    this.showMessage(this.passwordVerifyContainer, this.messageMapping(resp.message));
                }
            })
            .fail((err, msg) => {
                this.showMessage(this.passwordVerifyContainer, "Error retrieving data...");
            })
            .always((resp) => {
                this.loader.hide();
                this.enableFields(this.form);
            });
    }
}
