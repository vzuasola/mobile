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
            callback_check_username_format: [],
            callback_min_length: ["3"],
            callback_max_length: ["15"],
        },
    }, {
        name: "password",
        rules: {
            callback_pass_required: [],
            callback_check_mobile_format: [],
            callback_min_length: ["6"],
            callback_max_length: ["15"],
        },
    }];

    private attachments;

    handleOnLoad(element: HTMLElement, attachments: {error_messages: {[name: string]: string}}) {
        this.attachments = attachments;

        this.bindLoginValidation(attachments);
        this.bindClearErrorMessage(element);

        this.listenSessionHasFailed();
    }

    handleOnReload(element: HTMLElement, attachments: {error_messages: {[name: string]: string}}) {
        this.attachments = attachments;

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
            value = value.trim();
            return (value !== null && value !== "");
        });

        validator.registerCallback("pass_required", (value, param, field) => {
            return (value !== null && value !== "");
        });

        validator.registerCallback("min_length", (value, param, field) => {
            value = value.trim();
            return value.length >= param[0];
        });

        validator.registerCallback("max_length", (value, param, field) => {
            value = value.trim();
            return value.length <= param[0];
        });

        validator.registerCallback("check_username_format", (value, param, field) => {
            const pattern = /^\w+$/i;
            return pattern.test(value.trim());
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
        validator.setMessage("check_username_format", attachments.error_messages.invalid_passname);
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
                        utility.addClass(form.querySelector('[name="username"]'), "invalid");
                        errorMessage = error.message;
                        userFlag = true;
                    }

                    if (error.rule === "pass_required") {
                        utility.addClass(form.querySelector('[name="password"]'), "invalid");
                        errorMessage = error.message;
                        passFlag = true;
                    }

                    if (!userFlag) {
                        utility.addClass(form.querySelector('[name="password"]'), "invalid");
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
            utility.removeClass(form.querySelector('[name="username"]'), "invalid");
            utility.removeClass(form.querySelector('[name="password"]'), "invalid");
            if (utility.hasClass(src, "modal-overlay") || utility.hasClass(src, "modal-close")) {
                form.querySelector(".login-error").innerHTML = "";
            }
        });
    }

    /**
     * Listeners
     *
     */

    private listenSessionHasFailed() {
        ComponentManager.subscribe("session.failed", (event, src, data: { error: any, form: HTMLFormElement }) => {
            const errorMessage = {
                200: this.attachments.error_messages.error_message_restricted_country,
                401: this.attachments.error_messages.invalid_passname,
                402: this.attachments.error_messages.account_suspended,
                403: this.attachments.error_messages.account_locked,
                421: this.attachments.error_messages.error_message_restricted_country,
                500: this.attachments.error_messages.service_not_available,
            };

            utility.addClass(data.form.querySelector('[name="username"]'), "invalid");
            utility.addClass(data.form.querySelector('[name="password"]'), "invalid");
            data.form.querySelector(".login-error").innerHTML = (errorMessage.hasOwnProperty(data.error.status))
                ? errorMessage[data.error.status] : errorMessage[500];
        });
    }
}
