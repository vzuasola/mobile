import * as utility from "@core/assets/js/components/utility";
import RuleFunctions from "@app/assets/script/components/validation/rules";

export default class PasswordChecklist {
    private options;
    private currentPasswordField: HTMLFormElement;
    private newPasswordField: HTMLFormElement;
    private verifyPasswordField: HTMLFormElement;
    private submitButton: HTMLElement;
    private passwordContainer;
    private currentPasswordStatus: boolean;
    private aggregatedStatus: boolean;
    // Password rules that participate in checklist box
    private checklistRulesConfig;
    // Rules for which we will use a custom implementation instead of getting one from rules.js
    private customRules;
    // Indicates rules that should share the same checklist message with another rule
    private ruleConcatenations;

    constructor(options) {
        this.options = options || {};
        this.currentPasswordField = document.querySelector("#" + this.options.passwordCurrentFieldId);
        this.currentPasswordStatus = !this.currentPasswordField;
        this.aggregatedStatus = false;
        this.newPasswordField = document.querySelector("#" + this.options.passwordFieldId);
        this.verifyPasswordField = document.querySelector("#" + this.options.passwordVerifyFieldId);
        this.submitButton = document.getElementById(this.options.submitButtonId);
        this.passwordContainer = utility.findParent(this.verifyPasswordField, ".form-item");
        this.checklistRulesConfig = {};
        this.customRules = {
            verify_password: this.verifyBothPasswordFieldsAreEqual,
            not_match_username: this.verifyPasswordNotSameAsUsername,
            new_password_different_from_current: this.verifyPasswordNotSameAsCurrentPassword,
        };

        this.ruleConcatenations = {
            max_length: "min_length",
            not_match_username: "invalid_words",
            new_password_different_from_current: "new_password",
        };

        if (this.newPasswordField && this.verifyPasswordField && this.submitButton) {
            this.init();
            this.generateMarkup();
        }
    }

    private init() {
        // Password rules that have been enabled in CMS
        const enabledRulesConfig = this.orderRulesByWeight(this.options.pwdValidations);

        const $this = this;

        Object.keys(enabledRulesConfig).forEach((ruleKey) => {
            const ruleConfig = enabledRulesConfig[ruleKey];

            // A rule without a checklist description in CMS will not be included in checklist
            if (ruleConfig.description.length > 0) {
                const ruleName = ruleKey.replace("callback_", "");
                $this.checklistRulesConfig[ruleName] = enabledRulesConfig[ruleKey];
            }
        });

        const checklistRuleNames = Object.keys(this.checklistRulesConfig);
        // If the main rule is not enabled, there is no reason to concatenate the dependent rule.
        Object.keys(this.ruleConcatenations).forEach((dependedRule) => {
            const mainRule = this.ruleConcatenations[dependedRule];

            if (checklistRuleNames.indexOf(mainRule) === -1) {
                delete $this.ruleConcatenations[dependedRule];
            }
        });

        this.submitButton.setAttribute("disabled", "disabled");
        const options = {attributes: true};
        const currPasswordFieldMutationObserver = new MutationObserver(
            this.currPasswordFieldMutationObserverCallback
                .bind(this),
        );
        if (this.currentPasswordField) {
            currPasswordFieldMutationObserver.observe(
                document.querySelector("." + this.options.passwordCurrentFieldId),
                options,
            );
        }

    }

    private currPasswordFieldMutationObserverCallback(mutationList, mutationObserver) {
        const $that = this;
        const submitButton = document.getElementById("ChangePasswordForm_submit");
        mutationList.forEach((mutation) => {
            const targetElement = mutation.target as HTMLElement;
            if (mutation.type === "attributes" && mutation.attributeName === "class") {
                if ( targetElement.classList.contains("has-error") && !(submitButton.hasAttribute("disabled"))) {
                    $that.currentPasswordStatus = false;
                } else if (targetElement.classList.contains("has-success")) {
                    $that.currentPasswordStatus = true;
                }
                $that.checkEnableSubmitButton();
            }
        });
    }

    private orderRulesByWeight(enabledRulesConfig) {

        const arrayOfRules = Object.keys(enabledRulesConfig)
                                .sort((a, b) => enabledRulesConfig[a].weight - enabledRulesConfig[b].weight);

        const sortedRules = {};
        arrayOfRules.forEach((ruleKey) => {
            sortedRules[ruleKey] = enabledRulesConfig[ruleKey];
        });

        return sortedRules;
    }

    private generateMarkup() {
        const $that = this;
        const formItem = document.createElement("div");
        utility.addClass(formItem, "form-item");

        this.currentPasswordField && this.currentPasswordField.addEventListener("input", () => {
            if (this.newPasswordField.value.length !== 0) {
                $that.runChecklistBoxRules($that.newPasswordField);
                $that.newPasswordField.dispatchEvent(new Event ("keyup"));
            }
        });
        this.newPasswordField.addEventListener("input", () => {
            $that.runChecklistBoxRules($that.newPasswordField);
        });
        this.verifyPasswordField.addEventListener("input", () => {
            $that.runChecklistBoxRules($that.newPasswordField);
        });

        let htmlRuleList = "";
        Object.keys(this.checklistRulesConfig).forEach((ruleName) => {
            const ruleConfig = this.checklistRulesConfig[ruleName];
            const concatenatedRuleNames = Object.keys($that.ruleConcatenations);
            // We do not need separate line for rules that are concatenated
            if (concatenatedRuleNames.indexOf(ruleName) === -1) {
                htmlRuleList += "<li id=\"" + ruleName + "\">" + ruleConfig.description + "</li>";
            }
        });

        const markupHtml = "<div class=\"password-checklist-box\" id=\"password-checklist\"><ul>"
            + htmlRuleList + "</ul></div>";
        formItem.innerHTML = markupHtml;

        this.passwordContainer.parentNode.insertBefore(formItem, this.passwordContainer.nextSibling);
    }

    private runChecklistBoxRules(passwordfield) {
        const $that = this;

        const checklistRuleStatus = {};
        // Initialize rule status as true. We don't keep a status for concatenated rules.
        Object.keys($that.checklistRulesConfig).forEach((ruleName) => {
            const concatenatedRuleNames = Object.keys($that.ruleConcatenations);
            if (concatenatedRuleNames.indexOf(ruleName) === -1) {
                checklistRuleStatus[ruleName] = true;
            }
        });

        // Run validations and update rules statuses
        Object.keys($that.checklistRulesConfig).forEach((ruleName) => {
            const ruleConfig = $that.checklistRulesConfig[ruleName];

            let ruleStatus;
            let statusKey = ruleName;
            const concatenatedRuleNames = Object.keys($that.ruleConcatenations);
            if (concatenatedRuleNames.indexOf(ruleName) > -1) {
                statusKey = $that.ruleConcatenations[ruleName];
            }

            ruleStatus = $that.executeValidationRule(ruleName, ruleConfig, passwordfield);
            checklistRuleStatus[statusKey] = ruleStatus && checklistRuleStatus[statusKey];
        });

        this.aggregatedStatus = true;
        // Update rule description style in checklist HTML
        Object.keys(checklistRuleStatus).forEach((ruleName) => {
            const ruleStatus = checklistRuleStatus[ruleName];
            this.aggregatedStatus = this.aggregatedStatus && ruleStatus;

            const checklistElement = document.getElementById(ruleName);

            if ((ruleName === "verify_password") && ($that.verifyPasswordField.value.length === 0)) {
                checklistElement.classList.remove("checklist-item-green");
                checklistElement.classList.remove("checklist-item-red");
                return;
            }
            if ((ruleName === "invalid_words") && !ruleStatus) {
                checklistElement.classList.remove("checklist-item-green");
                checklistElement.classList.remove("checklist-item-gray");
                checklistElement.classList.add("checklist-item-red");
                return;
            }
            if (($that.verifyPasswordField.value.length === 0) && ($that.newPasswordField.value.length === 0)) {
                checklistElement.classList.remove("checklist-item-green");
                checklistElement.classList.remove("checklist-item-gray");
                checklistElement.classList.remove("checklist-item-red");
                return;
            }
            if ((ruleName === "invalid_words") && ($that.newPasswordField.value.length === 0) && ruleStatus) {
                checklistElement.classList.remove("checklist-item-green");
                checklistElement.classList.remove("checklist-item-gray");
                checklistElement.classList.add("checklist-item-red");
                return;
            }
            if (ruleStatus) {
                checklistElement.classList.remove("checklist-item-gray");
                checklistElement.classList.remove("checklist-item-red");
                checklistElement.classList.add("checklist-item-green");
            } else {
                checklistElement.classList.remove("checklist-item-green");
                checklistElement.classList.remove("checklist-item-gray");
                checklistElement.classList.add("checklist-item-red");
            }

        });
        if ($that.currentPasswordField && $that.currentPasswordField.value === "") {
            $that.currentPasswordStatus = false;
        }
        this.checkEnableSubmitButton();
    }

    private checkEnableSubmitButton() {

        this.submitButton.setAttribute("disabled", "disabled");

        if (this.aggregatedStatus && this.currentPasswordStatus) {
            this.submitButton.removeAttribute("disabled");
        }
    }

    private executeValidationRule(ruleName, ruleConfig, passwordfield) {
        let ruleStatus;

        if (ruleName in this.customRules) {
            ruleStatus = this.customRules[ruleName](this);
        } else {
            let ruleArguments;
            if ("arguments" in ruleConfig) {
                ruleArguments = ruleConfig.arguments;
            } else {
                ruleArguments = [];
            }

            const callback = RuleFunctions[ruleName].callback;
            ruleStatus = callback(passwordfield.value, ruleArguments, passwordfield);
        }

        return ruleStatus;
    }

    private verifyBothPasswordFieldsAreEqual(passwordChecklistObj) {
        return (passwordChecklistObj.newPasswordField.value === passwordChecklistObj.verifyPasswordField.value);
    }

    private verifyPasswordNotSameAsUsername(passwordChecklistObj) {
        return (passwordChecklistObj.newPasswordField.value.toLowerCase() !==
        passwordChecklistObj.newPasswordField.dataset.username.toLowerCase());
    }

    private verifyPasswordNotSameAsCurrentPassword(passwordChecklistObj) {
        return (passwordChecklistObj.newPasswordField.value !== passwordChecklistObj.currentPasswordField.value);
    }
}
