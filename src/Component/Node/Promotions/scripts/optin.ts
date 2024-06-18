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
            const optinFormEl = formWrapper.querySelector(".form-optin");

            // handle form submission
            if (event.target && event.target.matches('button[type="submit"]')) {
                event.preventDefault();
                const formData = new FormData(optinFormEl);
                formData.append("formId", optinFormEl.parentElement.getAttribute("data-form-id"));
                formData.append("formType", optinFormEl.parentElement.getAttribute("data-form-type"));

                xhr({
                    url: Router.generateRoute("node_promotions", "submit"),
                    type: "json",
                    method: "post",
                    processData: false,
                    data: formData,
                }).then((response) => {
                    if (response.success) {
                        this.element.querySelector("#container-" + response.formId).innerHTML = response.form;
                    }
                });
            }

            // handle form reset
            if (event.target && event.target.matches('button[type="reset"]')) {
                optinFormEl.reset();
            }
        });
    }
}
