import ValidatorExtension from "@core/assets/js/components/validation/validator-extension";
import Rules from "@core/assets/js/components/validation/rules";
import ErrorHandler from "@core/assets/js/components/validation/error-handler";

import * as FormValidator from "@core/assets/js/vendor/validate";

export class Validator {

    private app: any;
    private options: any;
    private formValidator: FormValidator;

    constructor(options, app) {
        this.options = options;
        this.app = app;
    }

    init() {
        this.setOptions();

        if (this.app &&
            this.app.settings &&
            this.app.settings.formValidations
        ) {
            for (const form in this.app.settings.formValidations) {
                const ruleset = this.getRules(form);

                if (ruleset) {
                    this.formValidator = new FormValidator(
                        form,
                        ruleset,
                        this.errorCallback
                    );

                    // extend the validator class, the extension acts like a
                    // reference call, modifying the passed object
                    new ValidatorExtension(this.formValidator);

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
        for (const rule in rules) {
            this.formValidator.registerCallback(rule, rules[rule].callback);
            this.formValidator.setMessage(rule, rules[rule].message);
        }

        for (let i = 0; i < ruleset.length; i++) {
            for (const set in ruleset[i].messages) {
                this.formValidator.setMessage(ruleset[i].name + '.' + set.replace(/^callback_/, ''), ruleset[i].messages[set]);
            }
        }
    }

    /**
     *
     */
    private getRules(form: any) {
        const rules = [];

        if (this.app.settings.formValidations[form]) {
            for (const field in this.app.settings.formValidations[form]) {
                let definition: any = {};
                definition = {
                    name: form + '[' + field + ']',
                    messages: {},
                    args: {},
                    rules: {}
                };

                const ruleset = [];

                for (const rule in this.app.settings.formValidations[form][field].rules) {

                    definition.messages[rule] = this.app.settings.formValidations[form][field].rules[rule].message;

                    // this.append arguments on the rule value
                    if (typeof this.app.settings.formValidations[form][field].rules[rule].arguments !== 'undefined') {
                        const args = this.app.settings.formValidations[form][field].rules[rule].arguments;

                        definition.args[rule] = args;
                    }

                    ruleset.push(rule);
                }

                definition.rules = ruleset.join('|');

                const formClass = this.app.settings.formValidations[form][field]['class'];
                definition.formClass = formClass;
                switch (formClass) {
                    case 'App\\Extensions\\Form\\ConfigurableForm\\Fields\\Checkboxes':
                        definition.name = definition.name + '[]';
                        break;
                }

                rules.push(definition);
            }
        }

        return rules;
    }
}


