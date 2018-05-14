import * as utility from "@core/assets/js/components/utility";
import * as FormValidator from "@core/assets/js/vendor/validate";

import {ComponentManager} from "@plugins/ComponentWidget/asset/component";

/**
 *
 */
export class Validation {
    private rules = [{
        name: "username",
        rules: {
            callback_user_required: [],
            callback_check_mobile_format: [],
            callback_min_length: ["3"],
            callback_max_length: ["15"],
        },
    }, {
        name: "password",
        rules: {
            callback_user_required: [],
            callback_check_mobile_format: [],
            callback_min_length: ["6"],
            callback_max_length: ["10"],
        },
    }];

    handleOnLoad(element: HTMLElement, attachments: {error_messages: {[name: string]: string}}) {
        this.bindLoginValidation(attachments);
        this.bindClearErrorMessage(element);

        this.listenSessionHasFailed(attachments);
    }

    handleOnReload(element: HTMLElement, attachments: {error_messages: {[name: string]: string}}) {
        this.bindLoginValidation(attachments);
        this.bindClearErrorMessage(element);
    }

    /**
     * Bind the validations
     */
    private bindLoginValidation(attachments) {
        const ruleset = [];

        for (const rule of this.rules) {
            ruleset.push({
                name: rule.name,
                rules: Object.keys(rule.rules).join("|"),
                args: rule.rules,
            });
        }

        const validator = new FormValidator("login-form",
            ruleset,
            (errors, event) => {
                this.doValidate(errors, event, attachments);
            },
        );

        validator.registerCallback("user_required", (value, param, field) => {
            return (value !== null && value !== "");
        });

        validator.registerCallback("pass_required", (value, param, field) => {
            return (value !== null && value !== "");
        });

        validator.registerCallback("min_length", (value, param, field) => {
            return value.length >= param[0];
        });

        validator.registerCallback("max_length", (value, param, field) => {
            return value.length <= param[0];
        });

        validator.registerCallback("check_mobile_format", (value, param, field) => {
            const pattern = /^\w+$/i;
            return pattern.test(value);
        });

        validator.setMessage("user_required", attachments.error_messages.blank_username);
        validator.setMessage("pass_required", attachments.error_messages.blank_password);
        validator.setMessage("min_length", attachments.error_messages.invalid_passname);
        validator.setMessage("max_length", attachments.error_messages.invalid_passname);
        validator.setMessage("check_mobile_format", attachments.error_messages.invalid_passname);
    }

    /**
     * Perform the actual validation
     *
     * @param errors
     * @param event
     */
    private doValidate(errors, event, attachments) {
        if (errors.length > 0) {
            event.preventDefault();
            event.stopPropagation();

            const form = utility.getTarget(event);
            let errorMessage: string;

            let userFlag = false;
            let passFlag = false;

            for (const key in errors) {
                if (errors.hasOwnProperty(key)) {
                    const error = errors[key];

                    if (error.rule === "user_required") {
                        errorMessage = error.message;
                        userFlag = true;
                    }

                    if (error.rule === "pass_required") {
                        errorMessage = error.message;
                        passFlag = true;
                    }

                    if (!userFlag) {
                        errorMessage = error.message;
                    }

                    if (userFlag && passFlag) {
                        errorMessage = attachments.error_messages.blank_passname;
                    }
                }
            }

            form.querySelector(".login-error").innerHTML = errorMessage;
        }
    }

    /**
     * Bind if error message will be cleared
     */
    private bindClearErrorMessage(element) {
        const form: HTMLElement = element.querySelector(".login-form");

        utility.listen(element, "click", (event, src) => {
            if (utility.hasClass(src, "modal-overlay") || utility.hasClass(src, "modal-close")) {
                form.querySelector(".login-error").innerHTML = "";
            }
        });
    }

    /**
     * Listeners
     *
     */

    private listenSessionHasFailed(attachments) {
        ComponentManager.subscribe("session.failed", (event, src, data: { error: any, form: HTMLFormElement }) => {
            const errorMessage = {
                401: attachments.error_messages.invalid_passname,
                402: attachments.error_messages.account_suspended,
                403: attachments.error_messages.account_locked,
                500: attachments.error_messages.service_not_available,
            };

            data.form.querySelector(".login-error").innerHTML = errorMessage[data.error.status];
        });
    }
}
