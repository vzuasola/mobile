import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";
import {Router} from "@plugins/ComponentWidget/asset/router";
import {Loader} from "@app/assets/script/components/loader";
import {FormBase} from "@app/assets/script/components/form-base";
import PasswordMeter from "@app/assets/script/components/password-meter";

/**
 * Reset Password
 *
 * @param Node element component parent element
 * @param Object attachments
 */
export class ChangePassword extends FormBase {
    private form: HTMLFormElement;
    private currentPasswordField: HTMLFormElement;
    private newPasswordField: HTMLFormElement;
    private verifyPasswordField: HTMLFormElement;
    private passwordVerifyContainer: HTMLElement;
    private validator: any;
    private loader: Loader;
    private passwordMeter: PasswordMeter;

    constructor(element: HTMLElement, attachments: {}) {
        super(element, attachments);
        this.element = element;
        this.attachments = attachments;
    }

    init() {
        this.form = this.element.querySelector(".change-password-form");

        if (this.form) {
            this.currentPasswordField = this.form.ChangePasswordForm_current_password;
            this.newPasswordField = this.form.ChangePasswordForm_new_password;
            this.verifyPasswordField = this.form.ChangePasswordForm_verify_password;
            this.passwordVerifyContainer = utility.hasClass(this.verifyPasswordField, "form-item", true);

            this.loader = new Loader(utility.hasClass(this.passwordVerifyContainer, "form-item", true), false, 0);
            this.validator = this.validateForm(this.form);
            this.activatePasswordMeter();
            this.bindEvent();
            this.tryAgain(this.form);
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
        this.hideMessage(this.passwordVerifyContainer);
        this.loader.show();

        // Disable fields
        this.disableFields(this.form);

        xhr({
            url: Router.generateRoute("my_account", "changepassword"),
            type: "json",
            method: "post",
            data: {
                current_password: this.currentPasswordField.value,
                new_password : this.newPasswordField.value,
            },
        })
            .then((resp) => {
                if (resp.status === "CHANGE_PASSWORD_SUCCESS") {
                    this.showConfirmationMessage(this.form, ".api-success-message");
                } else if (resp.status === "CHANGE_PASSWORD_FAILED") {
                    this.showConfirmationMessage(this.form, ".api-failed-message");
                } else {
                    this.showMessage(this.passwordVerifyContainer, this.messageMapping(resp.status, "change_password"));
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

    private activatePasswordMeter() {
        const attachments = this.element.getAttribute("data-component-widget-attachments");
        const config = JSON.parse(attachments);
        this.passwordMeter = new PasswordMeter({
            selector: "#ChangePasswordForm_new_password",
            strength: config.passwordStrengthMeter,
        });

        this.passwordMeter.init();
    }

    private tryAgain(form) {
        const tryAgainBtn = this.element.querySelector(".try-again-btn");
        const failMessageContainer: any = this.element.querySelector(".api-failed-message");

        utility.listen(tryAgainBtn, "click", (event, src) => {
            event.preventDefault();
            this.loader.hide();
            this.onFormReset(form);

            failMessageContainer.style.opacity = "0";
            utility.removeClass(form, "hidden");

            setTimeout(() => {
                utility.addClass(failMessageContainer, "hidden");
                form.style.opacity = "1";
            }, 10);
        });
    }

    private onFormReset(form) {
        // reset form
        form.reset();

        // enable fields
        utility.forEach(form.elements, (input) => {
            input.readOnly = false;
        });

        // remove password meter
        this.passwordMeter.passwordMeterRender("hidden");

        // remove icon-validation
        const icons = form.querySelectorAll(".icon-validation");
        utility.forEach(icons, (icon) => {
            icon.remove();
        });

        // remove helper block
        const messages = form.querySelectorAll(".form-help-block");
        utility.forEach(messages, (message) => {
            message.remove();
        });
    }
}
