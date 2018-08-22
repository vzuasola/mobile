import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";
import {Loader} from "@app/assets/script/components/loader";
import {FormBase} from "@app/assets/script/components/form-base";
import {Router} from "@plugins/ComponentWidget/asset/router";

/**
 * Verify Password
 *
 * @param Node element component parent element
 * @param Object attachments
 * @param String password selector to target for password
 */
export class VerifyPassword extends FormBase {
    private emailField: HTMLFormElement;
    private passwordContainer: HTMLElement;
    private form: HTMLFormElement;
    private loader: Loader;
    private validator: any;
    private password: HTMLFormElement;
    private formValues: any;

    constructor(element: HTMLElement, attachments: {}) {
        super(element, attachments);
        this.password = this.element.querySelector("#VerifyPasswordForm_verify_password");
    }

    init() {
        if (this.password) {
            this.form = utility.findParent(this.password, "form");
            this.passwordContainer = utility.hasClass(this.password, "form-item", true);
            this.loader = new Loader(utility.hasClass(this.password, "form-item", true), false, 0);
            this.validator = this.validateForm(this.form);
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
                    console.log("Incorrect password");
                    this.showMessage(document.getElementById("my-account"), "status: " + resp.status);
                }
            })
            .fail((err, msg) => {
                this.showMessage(this.passwordContainer, msg);
            })
            .always((resp) => {
                this.loader.hide();
                this.enableFields(this.form);
            });
    }

    private udpateProfile = () => {
        xhr({
            url: Router.generateRoute("my_account", "updateprofile"),
            type: "json",
            method: "post",
            data: this.formValues,
        })
            .then((resp) => {
                console.log("resp", resp);
                if (resp.success) {
                    console.log("Changes successfull..");
                } else {
                    console.log("Changes failed...");
                }
            })
            .fail((err, msg) => {
                this.showMessage(this.passwordContainer, "Error retrieving data...");
            })
            .always((resp) => {
                this.loader.hide();
                this.enableFields(this.form);
            });
    }
}
