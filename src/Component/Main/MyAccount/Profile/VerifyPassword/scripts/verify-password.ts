import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";
import {Loader} from "@app/assets/script/components/loader";
import {FormBase} from "@app/assets/script/components/form-base";
import Notification from "@app/assets/script/components/notification";
import {Router} from "@plugins/ComponentWidget/asset/router";

/**
 * Verify Password
 *
 * @param Node element component parent element
 * @param Object attachments
 */
export class VerifyPassword extends FormBase {
    private emailField: HTMLFormElement;
    private passwordContainer: HTMLElement;
    private form: HTMLFormElement;
    private loader: Loader;
    private updateProfileLoader: Loader;
    private validator: any;
    private password: HTMLFormElement;
    private formValues: any;
    private errorNotification: any;
    private successNotification: any;

    constructor(element: HTMLElement, attachments: {}) {
        super(element, attachments);
        this.password = this.element.querySelector("#VerifyPasswordForm_verify_password");
    }

    init() {
        if (this.password) {
            this.form = utility.findParent(this.password, "form");
            this.passwordContainer = utility.hasClass(this.password, "form-item", true);
            this.loader = new Loader(utility.hasClass(this.password, "form-item", true), false, 0);
            this.updateProfileLoader = new Loader(document.body, false, 0);
            this.validator = this.validateForm(this.form);
            this.errorNotification = new Notification(document.getElementById("my-account"),
                "password-message-error", true, 3);
            this.successNotification = new Notification(document.getElementById("my-account"),
                "password-message-success", true, 3);
            this.bindEvent();
        }
    }

    private bindEvent() {
        // Listen form on submit
        utility.listen(this.form, "submit", (event, src) => {
            event.preventDefault();

            if (!this.validator.hasError) {
                this.formValues = this.getValues();
                this.checkField(this.udpateProfile);
            }
        });
    }

    private getValues() {
        const profileForm: HTMLFormElement = document.querySelector(".profile-form");

        return {
            gender: this.getGenderValue(),
            language: profileForm.MyProfileForm_language.value,
            mobile: profileForm.MyProfileForm_mobile_number_1.value,
            mobile1: profileForm.MyProfileForm_mobile_number_2.value || "",
            address: profileForm.MyProfileForm_address.value,
            city: profileForm.MyProfileForm_city.value,
            postal_code: profileForm.MyProfileForm_postal_code.value,
            receive_news: profileForm.ProfileForm_contact_preference.checked ? "Yes" : "No",
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

    private checkField(callback) {
        // Remove/hide error message & Show loader
        this.hideMessage(this.passwordContainer);
        this.loader.show();

        // Disable fields
        this.disableFields(this.form);

        const usernameField: HTMLFormElement = document.querySelector("#MyProfileForm_username");

        xhr({
            url: Router.generateRoute("my_account", "verifypassword"),
            type: "json",
            method: "post",
            data: {
                password: this.password.value,
                username: usernameField.value,
            },
        })
            .then((resp) => {
                if (resp.success) {
                    callback();
                } else {
                    this.onError("Error validating password");
                }
            })
            .fail((err, msg) => {
                this.onError("Error validating password");
            })
            .always((resp) => {
                this.loader.hide();
                this.enableFields(this.form);
            });
    }

    private udpateProfile = () => {
        this.updateProfileLoader.show();

        // Disable fields
        this.disableFields(this.form);

        xhr({
            url: Router.generateRoute("my_account", "updateprofile"),
            type: "json",
            method: "post",
            data: this.formValues,
        })
            .then((resp) => {
                if (resp.success) {
                    this.onSuccess("Changes saved!!");
                } else {
                    this.onError("Error saving data!!");
                }
            })
            .fail((err, msg) => {
                this.onError("Error saving data!!");
            })
            .always((resp) => {
                this.updateProfileLoader.hide();
                this.enableFields(this.form);
            });
    }

    private onSuccess(message) {
        this.closeModal();
        this.successNotification.show(message);
    }

    private onError(message) {
        this.closeModal();
        this.errorNotification.show(message);
    }

    private closeModal() {
        utility.triggerEvent(document.querySelector("#profile-verification .modal-close-button"), "click");
    }
}
