import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";
import {Loader} from "@app/assets/script/components/loader";
import {FormBase, resetForm} from "@app/assets/script/components/form-base";
import Notification from "@app/assets/script/components/notification";
import {Router} from "@plugins/ComponentWidget/asset/router";
import {ComponentManager} from "@core/src/Plugins/ComponentWidget/asset/component";

/**
 * Verify Password
 *
 * @param Node element component parent element
 * @param Object attachments
 */
export class VerifyPassword extends FormBase {
    private passwordContainer: HTMLElement;
    private form: HTMLFormElement;
    private loader: Loader;
    private updateProfileLoader: HTMLElement;
    private validator: any;
    private password: HTMLFormElement;
    private oldValues: any;
    private formValues: any;
    private errorNotification: any;
    private successNotification: any;
    private profileForm: HTMLFormElement;

    constructor(element: HTMLElement, attachments: {}) {
        super(element, attachments);
        this.password = this.element.querySelector("#VerifyPasswordForm_verify_password");
        this.profileForm = document.querySelector(".profile-form");
    }

    init() {
        if (this.password) {
            this.form = utility.findParent(this.password, "form");
            this.passwordContainer = utility.hasClass(this.password, "form-item", true);
            this.loader = new Loader(utility.hasClass(this.password, "form-item", true), false, 0);
            this.updateProfileLoader = document.querySelector("body > .loader");
            this.validator = this.validateForm(this.form);
            this.errorNotification = new Notification(
                document.body,
                "notification-error",
                true,
                this.attachments.messageTimeout,
            );
            this.successNotification = new Notification(
                document.body,
                "notification-success",
                true,
                this.attachments.messageTimeout,
            );
            this.oldValues = {...this.getValues(true)};
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

    /**
     * @param Boolean initialLoad flag to indicate for initial load to cache the initial value on Document ready
     */
    private getValues(initialLoad?) {
        const profileForm = this.profileForm;
        const fnameField = profileForm.MyProfileForm_first_name;
        const lnameField = profileForm.MyProfileForm_last_name;
        const birthdateField = profileForm.MyProfileForm_birthdate;

        return {
            gender: this.getGenderValue(),
            language: profileForm.MyProfileForm_language.value,
            mobile: profileForm.MyProfileForm_mobile_number_1.value,
            mobile1: profileForm.MyProfileForm_mobile_number_2.value || "",
            address: profileForm.MyProfileForm_address.value,
            city: profileForm.MyProfileForm_city.value,
            postal_code: profileForm.MyProfileForm_postal_code.value,
            receive_news: profileForm.ProfileForm_contact_preference.checked,
            firstName: (this.attachments.isFastReg || initialLoad) ? fnameField.value : this.oldValues.firstName,
            lastName: (this.attachments.isFastReg || initialLoad) ? lnameField.value : this.oldValues.lastName,
            birthdate: (this.attachments.isFastReg || initialLoad) ? birthdateField.value : this.oldValues.birthdate,
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
            },
        })
            .then((resp) => {
                if (resp.success) {
                    callback();
                } else {
                    resetForm(this.form);
                    this.closeModal();

                    if (resp.status === "ERROR_MID_DOWN") {
                        this.errorNotification.show(this.attachments.messages.ERROR_MID_DOWN);
                    } else {
                        this.errorNotification.show(this.attachments.messages.UPDATE_PROFILE_FAILED);
                    }
                }
            })
            .fail((err, msg) => {
                this.onError(this.attachments.messages.INTERNAL_ERROR);
            })
            .always((resp) => {
                this.loader.hide();
                this.enableFields(this.form);
            });
    }

    private udpateProfile = () => {
        this.closeModal();
        utility.removeClass(this.updateProfileLoader, "hidden");
        this.formValues.birthdate = this.standardizeDateFormat(
            this.formValues.birthdate.split("/"),
            this.profileForm.MyProfileForm_birthdate.getAttribute("date-format").split("/"),
        );

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
                    this.onSuccess(this.attachments.messages.UPDATE_PROFILE_SUCCESS);
                } else {
                    this.onError(this.attachments.messages.UPDATE_PROFILE_FAILED);
                }
            })
            .fail((err, msg) => {
                this.onError(this.attachments.messages.UPDATE_PROFILE_FAILED);
                utility.addClass(this.updateProfileLoader, "hidden");
            })
            .always((resp) => {
                this.enableFields(this.form);
            });
    }

    private onSuccess(message) {
        this.closeModal();
        this.successNotification.show(message);
        this.refreshComponent(true);

    }

    private onError(message) {
        this.closeModal();
        this.errorNotification.show(message);
        this.refreshComponent();
    }

    private closeModal() {
        utility.triggerEvent(document.querySelector("#profile-verification .modal-close-button"), "click");
    }

    private refreshComponent(isSuccess?) {
        const profileSubmitButton = document.querySelector("#MyProfileForm_submit");
        const isFastReg = profileSubmitButton.getAttribute("data-redirect");

        if (isSuccess && isFastReg) {
            let myUrl = window.location.href;

            if (myUrl.indexOf("?") > -1 && (isFastReg !== "0")) {
                myUrl += "&redirect=1";
            } else if (myUrl.indexOf("?") === -1 && (isFastReg !== "0")) {
                myUrl += "?redirect=1";
            }

            window.history.replaceState({}, document.title, myUrl);
        }

        ComponentManager.refreshComponent(
            ["main"],
            () => {
                utility.addClass(this.updateProfileLoader, "hidden");
            },
        );
    }

    private standardizeDateFormat(date, format) {
        const currentFormat = format;
        const dateSelected = date;
        const dateToSubmit = [0, 0, 0];

        for (let i = 0; i < currentFormat.length; i++) {
            switch (currentFormat[i].toLowerCase()) {
                case "m":
                    dateToSubmit[0] = dateSelected[i];
                    break;
                case "d":
                    dateToSubmit[1] = dateSelected[i];
                    break;
                case "y":
                    dateToSubmit[2] = dateSelected[i];
                    break;
                default:
                    break;
            }
        }

        return new Date(dateToSubmit.join("/") + " GMT+0").getTime();
    }

}
