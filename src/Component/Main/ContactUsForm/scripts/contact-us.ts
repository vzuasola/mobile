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
            this.bindEvent();
        }
    }

    private bindEvent() {
        // Listen form on submit
        utility.listen(this.form, "submit", (event, src) => {
            event.preventDefault();

            const data = this.getFormFieldsValue();
            if (!this.validator.hasError) {
                xhr({
                    url: Router.generateRoute("contact_us", "submit"),
                    type: "json",
                    method: "post",
                    data: {
                        form: data,
                    },
                }).then((response) => {
                    if (response.success) {
                        // this.form.hide();
                        this.element.querySelector(".contact-us").innerHTML = response.message;
                    }
                });
            }
        });
    }

    private getFormFieldsValue() {
        const data = {};
        const formFields = this.form.querySelectorAll(".form-field");
        for (const fieldKey in formFields) {
            if (formFields.hasOwnProperty(fieldKey)) {
                const field = formFields[fieldKey];
                if (field.querySelector("input")) {
                    const id = field.querySelector("input").getAttribute("id");
                    data[id.replace("ContactUsForm_", "")] = this.form[id].value;
                }

                if (field.querySelector("select")) {
                    const id = field.querySelector("select").getAttribute("id");
                    data[id.replace("ContactUsForm_", "")] = this.form[id].value;
                }

                if (field.querySelector("textarea")) {
                    const id = field.querySelector("textarea").getAttribute("id");
                    data[id.replace("ContactUsForm_", "")] = this.form[id].value;
                }
            }
        }

        return data;
    }

}
