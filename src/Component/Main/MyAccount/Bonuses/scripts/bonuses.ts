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

    private validator: any;
    private loader: Loader;

    constructor(element: HTMLElement, attachments: {}) {
        super(element, attachments);
        this.element = element;
        this.attachments = attachments;
    }

    init() {
        this.form = this.element.querySelector(".bonus-code-form");

        if (this.form) {
            this.bonusCodeField = this.form.BonusCodeForm_BonusCode;
            this.bonusCodeContainer = utility.hasClass(this.bonusCodeField, "form-item", true);

            this.loader = new Loader(utility.hasClass(this.bonusCodeContainer, "form-item", true), false, 0);
            this.validator = this.validateForm(this.form);
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
                const claimResponse = this.claimBonus(this.bonusType);
                if (claimResponse) {
                    this.showConfirmationMessage(this.form, ".api-success-message");
                } else {
                    this.showConfirmationMessage(this.form, ".api-failed-message");
                }
            } else {
                this.showMessage(this.bonusCodeContainer, "Invalid Bonus code");
            }
        })
        .fail((err, msg) => {
            this.showMessage(this.bonusCodeContainer, "Error retrieving data...");
        })
        .always((resp) => {
            this.loader.hide();
            this.enableFields(this.form);
        });
    }

    private claimBonus(bonusType) {
        let isSuccess = false;
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
                isSuccess = true;
            } else {
                isSuccess = false;
            }
        })
        .fail((err, msg) => {
            isSuccess = false;
        });
        return isSuccess;

    }

    private onFormReset(form) {
        resetForm(form);

        // enable fields
        utility.forEach(form.elements, (input) => {
            input.readOnly = false;
        });
    }
}
