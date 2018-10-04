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
    private emailField: HTMLFormElement;
    private passwordContainer: HTMLElement;
    private form: HTMLFormElement;
    private loader: Loader;
    private updateProfileLoader: HTMLElement;
    private validator: any;
    private password: HTMLFormElement;
    private formValues: any;
    private errorNotification: any;
    private successNotification: any;
    private config: any;

    constructor(element: HTMLElement, attachments: {}) {
        super(element, attachments);
        this.password = this.element.querySelector("#VerifyPasswordForm_verify_password");
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
            receive_news: profileForm.ProfileForm_contact_preference.checked,
            firstName: profileForm.MyProfileForm_first_name.value,
            lastName: profileForm.MyProfileForm_last_name.value,
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
                    resetForm(this.form);
                    this.closeModal();
                    this.errorNotification.show(this.attachments.messages.UPDATE_PROFILE_FAILED);
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
            })
            .always((resp) => {
                utility.addClass(this.updateProfileLoader, "hidden");
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

            if (myUrl.indexOf("?") > -1 && isFastReg) {
                myUrl += "&redirect=1";
            } else if (myUrl.indexOf("?") === -1 && isFastReg) {
                myUrl += "?redirect=1";
            }

            window.history.replaceState({}, document.title, myUrl);
        }

        ComponentManager.refreshComponent(
            ["main"],
        );
    }
}
