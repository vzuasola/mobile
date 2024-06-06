import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";
import { Router } from "@plugins/ComponentWidget/asset/router";
import { FormBase } from "@app/assets/script/components/form-base";

/**
 * Optin Form
 *
 * @param Node element component parent element
 * @param Object attachments
 */
export class OptinForm extends FormBase {

    constructor(element: HTMLElement, attachments: {}) {
        super(element, attachments);
        this.element = element;
        this.attachments = attachments;
    }

    init() {
        const formWrappers = this.element.querySelectorAll(".optin-form-wrapper");
        utility.forEach(formWrappers, (formWrapper) => {
            if (formWrapper) {
                this.bindEvent(formWrapper);
            }
        });
    }

    private bindEvent(formWrapper) {

        utility.addEventListener(formWrapper, "click", (event) => {

            if (event.target && event.target.matches('button[type="submit"]')) {
                event.preventDefault();
                const optinFormEl = formWrapper.querySelector(".form-optin");
                xhr({
                    url: Router.generateRoute("node_promotions", "submit"),
                    type: "json",
                    method: "post",
                    data: this.getFormFieldsValue(optinFormEl),
                }).then((response) => {
                    if (response.success) {
                        this.element.querySelector("#container-" + response.formId).innerHTML = response.form;
                    }
                });
            }
        });
    }

    private getFormFieldsValue(optinFormEl) {
        const data = {
            formId: optinFormEl.parentElement.getAttribute("data-form-id"),
            formType: optinFormEl.parentElement.getAttribute("data-form-type"),
        };
        const formFields = optinFormEl.querySelectorAll(".form-field");

        for (const fieldKey in formFields) {
            if (formFields.hasOwnProperty(fieldKey)) {
                const field = formFields[fieldKey];
                if (field.querySelector("input")) {
                    const id = field.querySelector("input").getAttribute("id");
                    const fieldName = id.replace("FormBase_", "");
                    data["FormBase[" + fieldName + "]"] = optinFormEl[id].value;
                }

                if (field.querySelector("select")) {
                    const id = field.querySelector("select").getAttribute("id");
                    const fieldName = id.replace("FormBase_", "");
                    data["FormBase[" + fieldName + "]"] = optinFormEl[id].value;
                }

                if (field.querySelector("textarea")) {
                    const id = field.querySelector("textarea").getAttribute("id");
                    const fieldName = id.replace("FormBase_", "");
                    data["FormBase[" + fieldName + "]"] = optinFormEl[id].value;
                }
            }
        }

        return data;
    }

}
