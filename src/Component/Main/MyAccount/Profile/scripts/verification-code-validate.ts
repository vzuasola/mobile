// SMS Verification Code Validation
import * as FormValidator from "@core/assets/js/vendor/validate";
import * as utility from "@core/assets/js/components/utility";
import ValidatorExtension from "@core/assets/js/components/validation/validator-extension";

export class VerificationCodeValidate {
    private element: HTMLElement;
    private attachments: any;
    // construct
    constructor(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.attachments = attachments;
    }

    // init
    init() {
        // SMS Verification Code Validation
        const verificationCodeValidator = new FormValidator("sms-verification-code-form",
        [{
            name: "verification-code-field",
            display: "Verification Code",
            rules: "required|callback_min_length|callback_max_length",
            id: "verification-code-field",
            args: {
                callback_max_length: ["6"],
                callback_min_length: ["6"],
            },
        }],
        (errors, event) => {
            const e = event || window.event;

            // Attaching error message on field element
            for (const key in errors) {
                if (errors[key].id) {
                    const selectorWrapper = document.querySelector("." + errors[key].id + "-wrapper");
                    this.manageFieldClasses(errors[key].id, selectorWrapper, "valid", "invalid");
                    selectorWrapper.querySelector(".validation-error-message").innerHTML = errors[key].message;
                    utility.addClass(selectorWrapper, "has-error");
                }
            }

            if (errors.length === 0) {
                const target = e.target || e.srcElement;
                const selectorWrapperParent = target.parentNode.parentNode;
                this.manageFieldClasses(target.id, selectorWrapperParent, "invalid", "valid");
                selectorWrapperParent.querySelector(".validation-error-message").innerHTML = "";
                utility.removeClass(selectorWrapperParent, "has-error");
            }
        });

        // Custom Validations
        verificationCodeValidator.registerCallback("min_length", (value, param, field) => {
            return value.length >= param[0];
        });
        verificationCodeValidator.registerCallback("max_length", (value, param, field) => {
            return value.length <= param[0];
        });
        const verificationValidatorEvent = ["blur", "change"];
        new ValidatorExtension(verificationCodeValidator, verificationValidatorEvent);

        verificationCodeValidator.setMessage("required", this.attachments.verification_code_required_message);
        verificationCodeValidator.setMessage("min_length", this.attachments.verification_code_min_length_message);
        verificationCodeValidator.setMessage("max_length", this.attachments.verification_code_max_length_message);
    }

    private manageFieldClasses(key, selector, remove, add) {
        const validationIcon = selector.querySelector(".validation-icon");
        utility.addClass(validationIcon, "validated");
        utility.removeClass(validationIcon, remove);
        utility.removeClass(document.querySelector("#" + key), remove);
        utility.addClass(validationIcon, add);
        utility.addClass(document.querySelector("#" + key), add);
    }
}
