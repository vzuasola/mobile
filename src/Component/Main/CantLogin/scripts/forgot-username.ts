import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";
import {Loader} from "@app/assets/script/components/loader";
import {CantLoginBase} from "./cant-login-base";
import {Router} from "@plugins/ComponentWidget/asset/router";

/**
 * Forgot username
 *
 * @param Node element component parent element
 * @param Object attachments
 * @param String emailField selector to target for email
 */
export class ForgotUsername extends CantLoginBase {
    emailField: HTMLFormElement;
    emailContainer: HTMLElement;
    form: HTMLFormElement;
    loader: Loader;
    validator: any;

    constructor(element: HTMLElement, attachments: any, emailField: any) {
        super(element, attachments);
        this.element = element;
        this.attachments = attachments;
        this.emailField = this.element.querySelector(emailField);
    }

    init() {
        if (this.emailField) {
            this.emailContainer = utility.hasClass(this.emailField, "form-item", true);
            this.form = utility.findParent(this.emailField, "form");
            this.loader = new Loader(utility.hasClass(this.emailField, "form-item", true), false, 0);
            this.validator = this.validate(this.form);
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

        // close button element on success/confirmation message
        const formParent = utility.findParent(this.form, "div");
        const confirmationElem = formParent.querySelector(".confirmation-message");

        if (confirmationElem) {
            const closeBtn = confirmationElem.querySelector(".btn");

            if (closeBtn) {
                utility.listen(closeBtn, "click", (event) => {
                    event.preventDefault();
                    window.close();
                });
            }
        }
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
                if (resp.status === "FORGOT_USERNAME_SUCCESS") {
                    this.showConfirmationMessage(this.form);
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
