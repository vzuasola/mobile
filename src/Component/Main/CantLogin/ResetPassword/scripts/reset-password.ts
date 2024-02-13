import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";
import {Loader} from "@app/assets/script/components/loader";
import {FormBase} from "@app/assets/script/components/form-base";
import PasswordMeter from "@app/assets/script/components/password-meter";
import PasswordChecklist from "@app/assets/script/components/password-validation-box";
import {Router} from "@plugins/ComponentWidget/asset/router";

/**
 * Reset Password
 *
 * @param Node element component parent element
 * @param Object attachments
 */
export class ResetPassword extends FormBase {
    private form: HTMLFormElement;
    private passwordField: HTMLFormElement;
    private passwordFieldVerify: HTMLFormElement;
    private passwordVerifyContainer: HTMLElement;
    private token: string;
    private loader: Loader;
    private validator: any;

    constructor(element: HTMLElement, attachments: {}) {
        super(element, attachments);
    }

    init() {
        this.form = this.element.querySelector(".reset-password-form");
        if (this.form) {
            this.passwordField = this.form[this.form.name + "_new_password"];
            this.passwordFieldVerify = this.form[this.form.name + "_verify_password"];
            this.passwordVerifyContainer = utility.hasClass(this.passwordFieldVerify, "form-item", true);
            this.token = utility.getParameterByName("sbfpw");
            this.loader = new Loader(utility.hasClass(this.passwordVerifyContainer, "form-item", true), false, 0);
            this.validator = this.validateForm(this.form);
            if (this.attachments.usePasswordChecklist) {
                const formNameFromDrupal = "ResetPasswordForm";
                const newPasswordFieldName = "new_password";
                const verifyPasswordFieldName = "verify_password";

                // Aggregate all rules to be used in checklist box
                const validations = JSON.parse(this.form.getAttribute("data-validations"));
                const passwordValidations = validations[formNameFromDrupal][newPasswordFieldName].rules;
                const passwordVerifyFieldValidations = validations[formNameFromDrupal][verifyPasswordFieldName].rules;
                Object.keys(passwordVerifyFieldValidations).forEach((ruleKey) => {
                    const ruleConfig = passwordVerifyFieldValidations[ruleKey];

                    if (!passwordValidations[ruleKey]) {
                        passwordValidations[ruleKey] = ruleConfig;
                    }
                });

                new PasswordChecklist({
                    passwordFieldId: "ResetPasswordForm_new_password",
                    passwordVerifyFieldId: "ResetPasswordForm_verify_password",
                    submitButtonId: "ResetPasswordForm_submit",
                    pwdValidations: passwordValidations,
                });
            } else {
                this.activatePasswordMeter();
            }

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

    private activatePasswordMeter() {
        const widgetContainer = document.querySelector("div[data-component-widget-class=cant_login]");
        const attachments = widgetContainer.getAttribute("data-component-widget-attachments");
        const config = JSON.parse(attachments);
        const passwordMeter = new PasswordMeter({
            selector: "#ResetPasswordForm_new_password",
            strength: config.passwordStrengthMeter,
        });

        passwordMeter.init();
    }

    private checkField() {
        // Remove/hide error message & Show loader
        this.hideMessage(this.passwordVerifyContainer);
        this.loader.show();

        // Disable fields
        this.disableFields(this.form);

        xhr({
            url: Router.generateRoute("cant_login", "resetforgottenpassword"),
            type: "json",
            method: "post",
            data: {
                token: this.token,
                password : this.passwordField.value,
            },
        })
            .then((resp) => {
                if (resp.status === "CHANGE_FORGOTTEN_PASSWORD_SUCCESS") {
                    this.showConfirmationMessage(this.form, ".api-success-message");
                } else {
                    this.showMessage(this.passwordVerifyContainer, this.messageMapping(resp.status));
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
