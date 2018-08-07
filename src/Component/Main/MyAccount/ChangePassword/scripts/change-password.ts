import * as utility from "@core/assets/js/components/utility";
// import * as xhr from "@core/assets/js/vendor/reqwest";
// import {Router} from "@plugins/ComponentWidget/asset/router";
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

            // this.token = utility.getParameterByName("sbfpw", document.referrer);
            // this.loader = new Loader(utility.hasClass(this.passwordVerifyContainer, "form-item", true), false, 0);
            this.validator = this.validateForm(this.form);
            this.activatePasswordMeter();
            // this.bindEvent();
        }
    }

    private activatePasswordMeter() {
        const attachments = this.element.getAttribute("data-component-widget-attachments");
        const config = JSON.parse(attachments);
        const passwordMeter = new PasswordMeter({
            selector: "#ChangePasswordForm_new_password",
            strength: config.passwordStrengthMeter,
        });

        passwordMeter.init();
    }
}
