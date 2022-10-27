import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";
import {Router} from "@plugins/ComponentWidget/asset/router";
import {Loader} from "@app/assets/script/components/loader";
import {FormBase, resetForm} from "@app/assets/script/components/form-base";

/**
 * Bonus Code
 *
 * @param Node element component parent element
 * @param Object attachments
 */
export class Bonuses extends FormBase {
    private form: HTMLFormElement;
    private bonusCodeField: HTMLFormElement;
    private bonusCodeContainer: HTMLElement;
    private bonusType: any;
    private bonusClearButton: HTMLElement;
    private successMessage: HTMLElement;
    private validator: any;
    private loader: Loader;

    constructor(element: HTMLElement, attachments: {}) {
        super(element, attachments);
        this.element = element;
        this.attachments = attachments;
    }

    init() {
        this.form = this.element.querySelector(".bonus-code-form");
        this.successMessage = this.element.querySelector(".bonus-success-message");

        if (this.form) {
            this.bonusCodeField = this.form.BonusCodeForm_BonusCode;
            this.bonusCodeContainer = utility.hasClass(this.bonusCodeField, "form-item", true);

            this.loader = new Loader(utility.hasClass(this.bonusCodeContainer, "form-item", true), false, 0);
            this.validator = this.validateForm(this.form);
            if (!this.bonusClearButton) {
                const clearTextIcon = document.createElement("a");
                clearTextIcon.href = "#";
                clearTextIcon.innerHTML = "x";
                clearTextIcon.classList.add("clear-text");
                document.querySelector(".BonusCodeForm_BonusCode").querySelector(".form-field").append(clearTextIcon);
                clearTextIcon.style.display = "none";
                utility.addEventListener(this.form.BonusCodeForm_BonusCode, "input", (e) => {
                    if (this.form.BonusCodeForm_BonusCode.value.length >= 1) {
                        clearTextIcon.style.display = "block";
                    } else {
                        clearTextIcon.style.display = "none";
                    }
                    const submitButton = document.getElementById("#BonusCodeForm_submit");
                    if (utility.hasClass(this.bonusCodeField, "has-error", true)) {
                        console.log(submitButton);
                    } else if (utility.hasClass(this.bonusCodeField, "has-success", true)) {
                        console.log(submitButton);
                    }
                });
                utility.addEventListener(clearTextIcon, "click", (e) => {
                    e.preventDefault();
                    this.bonusCodeField.value = "";
                    clearTextIcon.style.display = "none";
                });
            }
            this.bindEvent();
        }
    }

    private bindEvent() {
        // Listen form on submit
        utility.listen(this.form, "submit", (event, src) => {
            event.preventDefault();

            if (!this.validator.hasError) {
                this.checkField();
            }
        });
    }

    private checkField() {
        // Remove/hide error message & Show loader
        this.loader.show();

        // Disable fields
        this.disableFields(this.form);

        xhr({
            url: Router.generateRoute("my_account", "validatebonuscode"),
            type: "json",
            method: "post",
            data: {
                bonus_code: this.bonusCodeField.value,
            },
        })
        .then((resp) => {
            this.bonusType = resp.data.type;
            if (resp.data.statusCode === "Success") {
                this.claimBonus(this.bonusType);
            } else {
                this.showMessage(this.bonusCodeContainer, this.attachments.invalid_bonus_code);
            }
        })
        .fail((err, msg) => {
            this.showMessage(this.bonusCodeContainer, this.attachments.default_error_message);
        })
        .always((resp) => {
            this.loader.hide();
            this.enableFields(this.form);
        });
    }

    private claimBonus(bonusType) {
        xhr({
            url: Router.generateRoute("my_account", "claimbonuscode"),
            type: "json",
            method: "post",
            data: {
                bonus_code: this.bonusCodeField.value,
                bonus_type: bonusType,
            },
        })
        .then((resp) => {
            if (resp.status === "CLAIM_BONUS_SUCCESS") {
                this.showSuccessMessage();
            } else {
                this.showMessage(this.bonusCodeContainer, this.attachments.invalid_bonus_code);
            }
        })
        .fail((err, msg) => {
            this.showMessage(this.bonusCodeContainer, this.attachments.invalid_bonus_code);
        });
    }

    private onFormReset(form) {
        resetForm(form);

        // enable fields
        utility.forEach(form.elements, (input) => {
            input.readOnly = false;
        });
        utility.addClass(this.successMessage, "hidden");
    }

    private showSuccessMessage() {
        utility.removeClass(this.successMessage, "hidden");
    }
}
