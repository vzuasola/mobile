import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";
import {Loader} from "@app/assets/script/components/loader";
import {FormBase} from "@app/assets/script/components/form-base";
import {Router} from "@plugins/ComponentWidget/asset/router";

/**
 * Forgot Password
 *
 * @param Node element component parent element
 * @param Object attachments
 * @param String emailField selector to target for email
 * @param String passwordField selector to target for password
 */
export class ForgotPassword extends FormBase {
    private emailField: HTMLFormElement;
    private emailContainer: HTMLElement;
    private form: HTMLFormElement;
    private loader: Loader;
    private validator: any;
    private passwordField: HTMLFormElement;

    constructor(element: HTMLElement, attachments: {}) {
        super(element, attachments);
        this.emailField = this.element.querySelector("#ForgotPasswordForm_email");
        this.passwordField = this.element.querySelector("#ForgotPasswordForm_username");
    }

    init() {
        if (this.emailField) {
            this.emailContainer = utility.hasClass(this.emailField, "form-item", true);
            this.form = utility.findParent(this.emailField, "form");
            this.loader = new Loader(utility.hasClass(this.emailField, "form-item", true), false, 0);
            this.validator = this.validateForm(this.form);
            this.bindEvent();
        }
    }

    private bindEvent() {
        // Listen form on submit
        utility.listen(this.form, "submit", (event, src) => {
            event.preventDefault();

            if (!this.validator.hasError) {
                this.checkField();
            }
        });
    }

    private checkField() {
        // Remove/hide error message & Show loader
        this.hideMessage(this.emailContainer);
        this.loader.show();

        // Disable fields
        this.disableFields(this.form);

        xhr({
            url: Router.generateRoute("cant_login", "forgotpassword"),
            type: "json",
            method: "post",
            data: {
                username: this.passwordField.value,
                email: this.emailField.value,
            },
        })
            .then((resp) => {
                if (resp.status === "FORGOT_PASSWORD_SUCCESS") {
                    this.showConfirmationMessage(this.form, ".api-success-message");
                } else {
                    this.showMessage(this.emailContainer, this.messageMapping(resp.status));
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
