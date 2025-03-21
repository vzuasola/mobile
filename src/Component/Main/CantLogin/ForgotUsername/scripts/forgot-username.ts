import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";
import {Loader} from "@app/assets/script/components/loader";
import {FormBase} from "@app/assets/script/components/form-base";
import {Router} from "@plugins/ComponentWidget/asset/router";

/**
 * Forgot Username
 *
 * @param Node element component parent element
 * @param Object attachments
 * @param String emailField selector to target for email
 */
export class ForgotUsername extends FormBase {
    private emailField: HTMLFormElement;
    private emailContainer: HTMLElement;
    private form: HTMLFormElement;
    private loader: Loader;
    private validator: any;

    constructor(element: HTMLElement, attachments: {}) {
        super(element, attachments);
        this.emailField = this.element.querySelector("#ForgotUsernameForm_email");
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
            url: Router.generateRoute("cant_login", "forgotusername"),
            type: "json",
            method: "post",
            data: {
                email: this.emailField.value,
            },
        })
            .then((resp) => {
                if (resp.status === "FORGOT_USERNAME_SUCCESS" ||
                    resp.status === "SUCCESS" ||
                    resp.status === "SUCCESS1") {
                    this.showConfirmationMessage(this.form, ".api-success-message");
                } else {
                    this.showMessage(this.emailContainer, this.messageMapping(resp.status));
                }
            })
            .fail((err, msg) => {
                this.showMessage(this.emailContainer, msg);
            })
            .always((resp) => {
                this.loader.hide();
                this.enableFields(this.form);
            });
    }
}
