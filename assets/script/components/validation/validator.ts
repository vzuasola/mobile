import ValidatorExtension from "./validator-extension";
import Rules from "./rules";
import ErrorHandler from "./error-handler";

import * as FormValidator from "@core/assets/js/vendor/validate";

export class Validator {

    hasError: boolean;
    private formValidations: any;
    private options: any;
    private formValidator: FormValidator;

    constructor(formValidations, options) {
        this.formValidations = formValidations;
        this.options = options;
        this.hasError = false;
    }

    init() {
        this.setOptions();

        if (this.formValidations) {
            for (const form of Object.keys(this.formValidations)) {
                const ruleset = this.getRules(form);

                if (ruleset) {
                    this.formValidator = new FormValidator(
                        form,
                        ruleset,
                        (errors, event) => {
                            this.errorCallback(errors, event);
                        },
                    );

                    // extend the validator class, the extension acts like a
                    // reference call, modifying the passed object
                    const extension = new ValidatorExtension(this.formValidator);

                    const validationRules = this.options.rules;

                    this.registerValidators(ruleset, validationRules);
                }
            }
        }
    }

    private setOptions() {
        // Default options
        const defaults = {
            rules: Rules,
            error: ErrorHandler,
        };

        // extend options
        const options = this.options || {};

        for (const name in defaults) {
            if (this.options[name] === undefined) {
                this.options[name] = defaults[name];
            }
        }
    }

    private errorCallback(errors: any, event: any) {
        try {
            if (errors.length < 1) {
                this.hasError = false;
            } else {
                this.hasError = true;
            }

            const handler = this.options.error;
            return new handler(errors, event);
        } catch (e) {
            console.log(e);
        }
    }

    /**
     * Register the defined rules on the validators
     */
    private registerValidators(ruleset: any, rules: any) {
        for (const rule of Object.keys(rules)) {
            this.formValidator.registerCallback(rule, rules[rule].callback);
            this.formValidator.setMessage(rule, rules[rule].message);
        }

        // for (const i of ruleset.length) {
        ruleset.forEach((item, i) => {
            for (const set of Object.keys(ruleset[i].messages)) {
                this.formValidator.setMessage(ruleset[i].name + "."
                    + set.replace(/^callback_/, ""), ruleset[i].messages[set]);
            }
        });
    }

    /**
     *
     */
    private getRules(form: any) {
        const rules = [];

        if (this.formValidations[form]) {
            for (const field of Object.keys(this.formValidations[form])) {
                let definition: any = {};
                definition = {
                    name: form + "[" + field + "]",
                    messages: {},
                    args: {},
                    rules: {},
                };

                const ruleset = [];

                for (const rule of Object.keys(this.formValidations[form][field].rules)) {

                    definition.messages[rule] = this.formValidations[form][field].rules[rule].message;

                    // this.append arguments on the rule value
                    if (typeof this.formValidations[form][field].rules[rule].arguments !== "undefined") {
                        const args = this.formValidations[form][field].rules[rule].arguments;

                        definition.args[rule] = args;
                    }

                    ruleset.push(rule);
                }

                definition.rules = ruleset.join("|");

                const fieldClass = "class";
                const formClass = this.formValidations[form][field][fieldClass];
                definition.formClass = formClass;
                switch (formClass) {
                    case "App\\Extensions\\Form\\ConfigurableForm\\Fields\\Checkboxes":
                        definition.name = definition.name + "[]";
                        break;
                }

                rules.push(definition);
            }
        }

        return rules;
    }
}
