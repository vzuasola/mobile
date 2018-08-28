import * as utility from "@core/assets/js/components/utility";
import {FormBase} from "@app/assets/script/components/form-base";
import {Modal} from "@app/assets/script/components/modal";
import Notification from "@app/assets/script/components/notification";
import * as verificationTemplate from "./../templates/handlebars/profile-changes.handlebars";
import {Loader} from "@app/assets/script/components/loader";
import {ComponentManager} from "@core/src/Plugins/ComponentWidget/asset/component";
import EqualHeight from "@app/assets/script/components/equal-height";

/**
 * Profile
 *
 * @param Node element component parent element
 * @param Object attachments
 */
export class Profile extends FormBase {
    private form: HTMLFormElement;
    private oldValues: any;
    private newValues: any;
    private modalSelector: string = "#profile-verification";
    private notification: any;
    private loader: Loader;

    constructor(element: HTMLElement, attachments: {}) {
        super(element, attachments);
        this.loader = new Loader(document.body, true);
    }

    init() {
        this.form = this.element.querySelector(".profile-form");
        this.notification = new Notification(
            document.body,
            "password-message-error",
            true,
            this.attachments.messageTimeout,
        );
        this.contactPreference();
        this.oldValues = {...this.getValues()};
        // we check if mobile 1 had a value and add the a required validation
        if (this.oldValues.mobile1) {
            const rules = JSON.parse(this.form.getAttribute("data-validations"));
            const callbackRequired = rules.MyProfileForm.mobile_number_1.rules.callback_required;
            const reversedRules = Object.assign(
                {callback_required: callbackRequired},
                rules.MyProfileForm.mobile_number_2.rules,
            );
            rules.MyProfileForm.mobile_number_2.rules = reversedRules;
            this.form.setAttribute("data-validations", JSON.stringify(rules));
        }
        this.validateForm(this.form);
        this.handleSubmission();
        this.equalizeActionButtonHeight();
    }

    private contactPreference() {
        const checkbox: HTMLFormElement = this.element.querySelector("#ProfileForm_contact_preference");
        if (this.attachments.user.receive_news) {
            checkbox.checked = true;
        }

    }

    private getValues() {
        return {
            gender: this.getGenderValue(),
            language: this.getLanguageText(),
            mobile: this.form.MyProfileForm_mobile_number_1.value,
            mobile1: this.form.MyProfileForm_mobile_number_2.value || "",
            address: this.form.MyProfileForm_address.value,
            city: this.form.MyProfileForm_city.value,
            postal_code: this.form.MyProfileForm_postal_code.value,
            receive_news: this.form.ProfileForm_contact_preference.checked
                ? this.attachments.contactPreferenceYes
                : this.attachments.contactPreferenceNo,
        };
    }

    private getLabels() {
        return {
            gender: this.form.querySelector(".MyProfileForm_gender .form-label-text").textContent,
            language: this.form.querySelector(".MyProfileForm_language .form-label-text").textContent,
            mobile: this.form.querySelector(".MyProfileForm_mobile_number_1 .form-label-text").textContent,
            mobile1: this.getMobile2Value(),
            address: this.form.querySelector(".MyProfileForm_address .form-label-text").textContent,
            city: this.form.querySelector(".MyProfileForm_city .form-label-text").textContent,
            postal_code: this.form.querySelector(".MyProfileForm_postal_code .form-label-text").textContent,
            receive_news: this.form.querySelector(".MyProfileForm_preference_markup .label-inwrapper").textContent,
        };
    }

    private getLanguageText() {
        const select = this.form.MyProfileForm_language;
        return select.options[select.selectedIndex].text;
    }

    private getMobile2Value() {
        const mobile1 = this.form.querySelector(".MyProfileForm_mobile_number_2 .form-label-text") ?
            this.form.querySelector(".MyProfileForm_mobile_number_2 .form-label-text").textContent :
            this.form.querySelector(".MyProfileForm_mobile_number_2 .form-label").textContent;
        return mobile1;
    }

    private getGenderValue() {
        const genderElems: any = document.getElementsByName("MyProfileForm[gender]");
        let gender;

        for (let i = 0, length = genderElems.length; i < length; i++) {
            if (genderElems[i].checked) {
                gender = genderElems[i].value;
                break;
            }
        }

        return gender;
    }

    private hasChanges() {
        return !this.isEquivalent(this.oldValues, this.newValues);
    }

    private handleSubmission() {
        // Listen form on submit
        utility.listen(this.form, "submit", (event, src) => {
            event.preventDefault();
            const hasError = this.form.querySelectorAll(".has-error").length;

            this.newValues = this.getValues();
            if (!hasError) {
                if (this.hasChanges()) {
                    const profileChangesContainer = this.element.querySelector(this.modalSelector + " .changes");
                    const data: any = this.getFilteredDifference(this.oldValues, this.newValues);

                    // Add labels to data
                    data.labels = this.getLabels();
                    data.config = this.attachments;

                    profileChangesContainer.innerHTML = verificationTemplate(data);
                    Modal.open(this.modalSelector);
                } else {
                    this.notification.show(this.attachments.noUpdateDetected);
                }
            }
        });

        // listen on cancel button
        utility.listen(this.element.querySelector("#MyProfileForm_button_cancel"), "click", (event, src) => {
            event.preventDefault();
            this.loader.show();

            ComponentManager.refreshComponent(
                ["main"],
                () => {
                    this.loader.hide();
                },
            );
        });
    }

    private isEquivalent(a: {}, b: {}) {
        // If number of properties is different,
        // objects are not equivalent
        if (Object.getOwnPropertyNames(a).length !== Object.getOwnPropertyNames(b).length) {
            return false;
        }

        for (const propName of Object.getOwnPropertyNames(a)) {
            // If values of same property are not equal,
            // objects are not equivalent
            if (a[propName] !== b[propName]) {
                return false;
            }
        }

        // If we made it this far, objects
        // are considered equivalent
        return true;
    }

    private getFilteredDifference(a: {}, b: {}) {
        // Create arrays of property names
        const aProps = Object.getOwnPropertyNames(a);
        const bProps = Object.getOwnPropertyNames(b);
        const old = {};
        const modified = {};

        for (const propName of aProps) {
            if (a[propName] !== b[propName]) {
                old[propName] = a[propName];
                modified[propName] = b[propName];
            }
        }

        return {old, modified};
    }

    private equalizeActionButtonHeight() {
        const equalize = new EqualHeight("#MyProfileForm_submit, #MyProfileForm_button_cancel");
        equalize.init();
    }
}
