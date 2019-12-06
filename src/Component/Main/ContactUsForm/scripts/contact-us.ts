import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";
import { Router } from "@plugins/ComponentWidget/asset/router";
import { Loader } from "@app/assets/script/components/loader";
import { FormBase, resetForm } from "@app/assets/script/components/form-base";

/**
 * Reset Password
 *
 * @param Node element component parent element
 * @param Object attachments
 */
export class ContactUsForm extends FormBase {
    private form: HTMLFormElement;
    private validator: any;

    constructor(element: HTMLElement, attachments: {}) {
        super(element, attachments);
        this.element = element;
        this.attachments = attachments;
    }

    init() {
        this.form = this.element.querySelector(".contact-us-form");

        if (this.form) {
            this.validator = this.validateForm(this.form);
            console.log(this.form);
            console.log(this.validator);
            this.bindEvent();
        }
    }

    private bindEvent() {
        // Listen form on submit
        utility.listen(this.form, "submit", (event, src) => {
            event.preventDefault();
            if (!this.validator.hasError) {
                console.log("submitting");
            }
        });
    }

}
