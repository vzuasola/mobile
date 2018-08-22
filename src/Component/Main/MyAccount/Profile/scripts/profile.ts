import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";
import {Loader} from "@app/assets/script/components/loader";
import {FormBase} from "@app/assets/script/components/form-base";
import {Router} from "@plugins/ComponentWidget/asset/router";
import {Modal} from "@app/assets/script/components/modal";
import * as verificationTemplate from "./../templates/handlebars/profile-changes.handlebars";

/**
 * Profile
 *
 * @param Node element component parent element
 * @param Object attachments
 */
export class Profile extends FormBase {
    private form: HTMLFormElement;
    private loader: Loader;
    private validator: any;
    private oldValues: any;
    private newValues: any;
    private modalSelector: string = "#profile-verification";

    constructor(element: HTMLElement, attachments: {}) {
        super(element, attachments);
    }

    init() {
        this.form = this.element.querySelector(".profile-form");
        this.validator = this.validateForm(this.form);
        this.oldValues = {...this.getValues()};
        this.handleSubmission();
    }

    private getValues() {
        return {
            gender: this.getGenderValue(),
            language: this.form.MyProfileForm_language.value,
            mobile: this.form.MyProfileForm_mobile_number_1.value,
            mobile1: this.form.MyProfileForm_mobile_number_2.value || "",
            address: this.form.MyProfileForm_address.value,
            city: this.form.MyProfileForm_city.value,
            postal_code: this.form.MyProfileForm_postal_code.value,
            receive_news: this.form.ProfileForm_contact_preference.checked ? "Yes" : "No",
        };
    }

    private getLabels() {
        return {
            gender: this.form.querySelector(".MyProfileForm_gender .form-label-text").textContent,
            language: this.form.querySelector(".MyProfileForm_language .form-label-text").textContent,
            mobile: this.form.querySelector(".MyProfileForm_mobile_number_1 .form-label-text").textContent,
            mobile1: this.form.querySelector(".MyProfileForm_mobile_number_1 .form-label-text").textContent,
            address: this.form.querySelector(".MyProfileForm_address .form-label-text").textContent,
            city: this.form.querySelector(".MyProfileForm_city .form-label-text").textContent,
            postal_code: this.form.querySelector(".MyProfileForm_postal_code .form-label-text").textContent,
            receive_news: this.form.querySelector(".MyProfileForm_preference_markup .label-inwrapper").textContent,
        };
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

            this.newValues = this.getValues();

            if (!this.validator.hasError) {
                if (this.hasChanges()) {
                    const tbody = this.element.querySelector(this.modalSelector + " tbody");
                    const data: any = this.getFilteredDifference(this.oldValues, this.newValues);

                    // Add labels to data
                    data.labels = this.getLabels();
                    console.log("data", data);

                    tbody.innerHTML = verificationTemplate(data);
                    Modal.open(this.modalSelector);
                } else {
                    // Add a notification message
                }
            }
        });
    }

    private isEquivalent(a: {}, b: {}) {
        // Create arrays of property names
        const aProps = Object.getOwnPropertyNames(a);
        const bProps = Object.getOwnPropertyNames(b);

        // If number of properties is different,
        // objects are not equivalent
        if (aProps.length !== bProps.length) {
            return false;
        }

        for (const propName of aProps) {
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
            // If values of same property are not equal,
            // objects are not equivalent
            if (a[propName] !== b[propName]) {
                old[propName] = a[propName];
                modified[propName] = b[propName];
            }
        }

        return {old, modified};
    }
}
