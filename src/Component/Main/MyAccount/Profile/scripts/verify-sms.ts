import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";
import {FormBase, resetForm} from "@app/assets/script/components/form-base";
import {Loader} from "@app/assets/script/components/loader";
import {Modal} from "@app/assets/script/components/modal";
import {Marker} from "@app/assets/script/components/marker";
import {Router} from "@plugins/ComponentWidget/asset/router";
import {ComponentManager} from "@core/src/Plugins/ComponentWidget/asset/component";
import Notification from "@app/assets/script/components/notification";
import * as checkTemplate from "@app/templates/handlebars/icon-check-only.handlebars";

/**
 * SMS Verification
 *
 * @param Node element component parent element
 * @param Object attachments
 * @param String emailField selector to target for email
 * @param String passwordField selector to target for password
 */
export class SmsVerification extends FormBase {
    private loader: Loader;
    private validator: any;
    private mobile1Parent: HTMLElement;
    private mobile1Div: HTMLElement;
    private mobile2Parent: HTMLElement;
    private mobile2Div: HTMLElement;
    private mobile1Item: HTMLElement;
    private mobile2Item: HTMLElement;
    private verifyContainer: HTMLElement;
    private verifyBtn: HTMLElement;
    private verificationError: HTMLElement;
    private addNewMobile: any;
    private subTypeId: number;
    private verified: boolean;
    private mobile1Input: HTMLInputElement;
    private mobile2Input: HTMLInputElement;
    private mobile1InputValue: string;
    private mobile2InputValue: string;
    private errorNotification: any;
    private successNotification: any;
    private form: HTMLFormElement;

    // construct
    constructor(element: HTMLElement, attachments: {}) {
        super(element, attachments);
        this.element = element;
        this.attachments = attachments;
        this.form = element.querySelector("#verify-sms-form");
        this.loader = new Loader(document.body, true);
    }
    // init
    init() {
        this.validator = this.validateForm(this.form);
        this.mobile1Parent = this.element.querySelector(".mobile1_parent");
        this.mobile1Div = this.element.querySelector(".MyProfileForm_mobile_number_1 .form-field");
        this.mobile2Parent = this.element.querySelector(".mobile2_parent");
        this.mobile2Div = this.element.querySelector(".MyProfileForm_mobile_number_2 .form-field");

        this.mobile1Item = this.element.querySelector(".MyProfileForm_mobile_number_1");
        this.mobile2Item = this.element.querySelector(".MyProfileForm_mobile_number_2");
        this.mobile1Input = this.element.querySelector("#MyProfileForm_mobile_number_1");
        this.mobile2Input = this.element.querySelector("#MyProfileForm_mobile_number_2");
        this.mobile1InputValue = this.mobile1Input.value;
        this.mobile2InputValue = this.mobile2Input.value;
        this.verifyContainer = this.element.querySelector(".verification-container");
        this.verificationError = this.element.querySelector("#verification-error");
        this.addNewMobile = this.element.querySelector("#add-new-mobile").cloneNode(true);
        this.prepareElements();
        this.attachEvents();
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

        // Radio
        new Marker({
            parent: ".MyProfileForm_mobile_number_1",
        });
    }
    // prepare necessary elements for sms verification
    private prepareElements() {
        const primary = this.element.querySelector(".MyProfileForm_primary_number");

        let verif1Container: any;
        let verif2Container: any;
        if (this.attachments.enableMobileAnnotation === 0) {

            this.mobile1Item.appendChild(this.verifyContainer.cloneNode(true));
            this.mobile2Item.appendChild(this.verifyContainer.cloneNode(true));
            verif1Container = this.element.querySelector(".MyProfileForm_mobile_number_1 .verification-container");
            verif2Container = this.element.querySelector(".MyProfileForm_mobile_number_2 .verification-container");
            utility.removeClass(verif1Container, "hidden");
            utility.removeClass(verif2Container, "hidden");
            this.mobile1Item.insertBefore(
                primary,
                this.mobile1Item.querySelector(".form-field").nextElementSibling,
            );
        } else {
            const errorContainer = document.createElement("div");
            const errorContainer2 = document.createElement("div");
            utility.addClass(errorContainer, "error-container");
            utility.addClass(errorContainer2, "error-container");

            this.mobile1Input.setAttribute("data-parent-annotation", ".mobile1_parent");
            this.mobile1Parent.appendChild(this.mobile1Div);
            this.mobile1Parent.appendChild(primary);
            this.mobile1Parent.appendChild(this.verifyContainer.cloneNode(true));

            this.mobile2Input.setAttribute("data-parent-annotation", ".mobile2_parent");
            this.mobile2Parent.appendChild(this.mobile2Div);
            this.mobile2Parent.appendChild(this.verifyContainer.cloneNode(true));

            verif1Container = this.element.querySelector(".mobile1_parent .verification-container");
            verif2Container = this.element.querySelector(".mobile2_parent .verification-container");
            utility.removeClass(verif1Container, "hidden");
            utility.removeClass(verif2Container, "hidden");
            this.mobile1Item.appendChild(this.mobile1Parent);
            this.mobile1Item.appendChild(errorContainer);

            this.mobile2Item.appendChild(this.mobile2Parent);
            this.mobile2Item.appendChild(errorContainer2);

        }

        // check if mobile number 2 is empty on icore
        if (this.attachments.user.hidden_sms_2) {
            // add new mobile number link
            this.mobile1Item.appendChild(this.addNewMobile);
            utility.removeClass(this.addNewMobile, "hidden");
            this.element.querySelector("#MyProfileForm_mobile_number_2").setAttribute("disabled", "disabled");
            // hide mobile number 2 field
            utility.addClass(this.element.querySelector(".form-item.MyProfileForm_mobile_number_2"), "hidden");
            utility.addClass(verif2Container, "hidden");
            // add listener to add new mobile to unhide mobile 2 field
            utility.listen(this.element, "click", (event, src) => {
                this.addNewMobileNumber(event, src);
            });
            // add listener to remove verify button
            utility.listen(this.element.querySelector("#MyProfileForm_mobile_number_2"), "keyup", (event) => {
                this.hideUnhideVerify(event, this.mobile2Item, this.mobile2InputValue);
            });
        }
        // add verified icon on verified mobile number
        if (this.attachments.user.sms_1_verified) {
            this.addCheckIcon(verif1Container);
        }
        if (this.attachments.user.sms_2_verified) {
            this.addCheckIcon(verif2Container);
        }
        // Mobile 1 field alter
        if (!this.attachments.user.sms_1_verified) {
            const verifyBtn = this.element.querySelector(".MyProfileForm_mobile_number_1 .verify-mobile-selector");
            utility.removeClass(verifyBtn , "hidden");
            utility.addClass(verifyBtn , "MyProfileForm_mobile_number_1_verify");
        }
        // Mobile 2 field alter
        if (!this.attachments.user.sms_2_verified) {
            const verifyBtn2 = this.element.querySelector(".MyProfileForm_mobile_number_2 .verify-mobile-selector");
            utility.removeClass(verifyBtn2, "hidden");
            utility.addClass(verifyBtn2 , "MyProfileForm_mobile_number_2_verify");
        }
    }

    private addCheckIcon(container) {
        container.innerHTML = "";
        const checkContainer = utility.createElem("span", "icon-verified-mobile", container);
        checkContainer.innerHTML = checkTemplate();
    }

    // Attach SMS Action Events
    private attachEvents() {
        const mItem1 = this.mobile1Item.querySelector("#verify-mobile-modal");
        this.verifyButtonEvent(mItem1);

        const mItem2 = this.mobile2Item.querySelector("#verify-mobile-modal");
        this.verifyButtonEvent(mItem2);

        utility.listen(this.element.querySelector("#verify-mobile-resend"), "click", (event) => {
            event.preventDefault(event);
            this.resendVerificationCode(event);
        });
        utility.listen(this.element.querySelector("#MyProfileForm_mobile_number_1"), "keyup", (event) => {
            this.hideUnhideVerify(event, this.mobile1Item, this.mobile1InputValue);
        });
        utility.listen(this.element.querySelector("#MyProfileForm_mobile_number_2"), "keyup", (event) => {
            this.hideUnhideVerify(event, this.mobile2Item, this.mobile2InputValue);
        });

        utility.listen(this.form, "submit", (event) => {
            event.preventDefault(event);

            if (!this.validator.hasError) {
                this.submitVerificationCode(event);
            }
        });
    }

    private verifyButtonEvent(el) {
        utility.listen(el, "click", (event) => {
            resetForm(this.form);
            event.preventDefault(event);
            this.sendVerificationCode(event);
        });
    }

    private addNewMobileNumber(e, src) {
        const addNewMobile = utility.hasClass(src, "add-new-mobile", true);
        if (addNewMobile) {
            e.preventDefault();
            const mobileNumber2FieldValue = this.mobile2Input.getAttribute("data-value");
            utility.removeClass(this.element.querySelector(".form-item.MyProfileForm_mobile_number_2"), "hidden");
            this.mobile2Input.removeAttribute("disabled");
            this.mobile2Input.value = mobileNumber2FieldValue;
            utility.addClass(addNewMobile, "hidden");
        }
    }

    // Method to send sms
    private sendVerificationCode(event) {
        this.verified = false;
        const verificationError = document.getElementById("modal-verification-error");
        const verificationSuccess = document.getElementById("modal-verification-success");

        if (event.target && event.target.id === "verify-mobile-modal") {
            this.subTypeId = 2;

            if (utility.hasClass(event.target, "MyProfileForm_mobile_number_1_verify")) {
                this.subTypeId = 1;
            }

            event = event || window.event;
            utility.preventDefault(event);
            xhr({
                url: Router.generateRoute("my_account", "sendverificationcode"),
                type: "json",
                method: "post",
                data: {
                    data: this.subTypeId,
                },
            }).then((res) => {
                if (res.response_code === "SMS_VERIFICATION_SUCCESS" || res.response_code === "SUCCESS1" ) {
                    utility.addClass(verificationError, "hidden");
                    verificationError.innerHTML = "";

                    utility.addClass(verificationSuccess, "hidden");
                    verificationSuccess.innerHTML = "";

                    this.launchLightBox();
                } else {
                    this.errorNotification.show(res.message);
                }
            });
        }
    }

    // Method to resend SMS
    private resendVerificationCode(event) {
        event = event || window.event;
        utility.preventDefault(event);
        const verificationError = document.getElementById("modal-verification-error");
        const verificationSuccess = document.getElementById("modal-verification-success");

        xhr({
            url: Router.generateRoute("my_account", "sendverificationcode"),
            type: "json",
            method: "post",
            data: {
                data: this.subTypeId,
            },
        }).then((res) => {
            if (res.response_code === "SMS_VERIFICATION_SUCCESS") {
                utility.addClass(verificationError, "hidden");
                utility.removeClass(verificationSuccess, "hidden");
                verificationSuccess.innerHTML = res.message;
            } else if (res.response_code === "SUCCESS1") {
                utility.addClass(verificationSuccess, "hidden");
                utility.removeClass(verificationError, "hidden");
                verificationError.innerHTML = res.message;
            } else {
                utility.addClass(verificationSuccess, "hidden");
                utility.removeClass(verificationError, "hidden");
                verificationError.innerHTML = res.message;
                this.loader.hide();
            }
        });
    }

    // Method to submit verification code from sms
    private submitVerificationCode(event) {
        event = event || window.event;
        utility.preventDefault(event);
        const This = this;
        const verifCodeField: HTMLInputElement = this.element.querySelector("#SmsVerificationForm_verification_code");
        const verifCode = verifCodeField.value;
        const verificationError = document.getElementById("modal-verification-error");
        const verificationSuccess = document.getElementById("modal-verification-success");

        this.loader.show();

        xhr({
            url: Router.generateRoute("my_account", "submitverificationcode"),
            type: "json",
            method: "post",
            data: {
                data: {
                    code : verifCode,
                    subtypeId: this.subTypeId,
                },
            },
        }).then((res) => {
            if (res.response_code === "SMS_VERIFICATION_SUBMIT_SUCCESS") {
                This.checkSmsStatus(This, res.message);
            } else {
                utility.addClass(verificationSuccess, "hidden");
                utility.removeClass(verificationError, "hidden");
                verificationError.innerHTML = res.message;
                this.loader.hide();
            }
        });
    }

    // Check sms verification status
    private checkSmsStatus(parentThis, message) {
        const This = parentThis;
        let checkStatusCounter = 0;
        setInterval((e) => {
            if (this.verified === false) {
                xhr({
                    url: Router.generateRoute("my_account", "checksmsstatus"),
                    type: "json",
                    method: "post",
                    data: {
                        subtypeId: This.subTypeId,
                    },
                }).then((res) => {
                    if (res.response_code === "CHECK_SMS_STATUS_NOT_VERIFIED") {
                        // Trigger checking of sms code for 2 minutes
                        if (checkStatusCounter < 40) {
                            checkStatusCounter++;
                            This.checkSmsStatus(parentThis);
                        } else {
                            this.refreshProfileForm(message);
                        }
                    } else {
                        this.refreshProfileForm(message);
                    }
                });
            }
        }, 3000);
    }

    private refreshProfileForm(message) {
        this.verified = true;
        Modal.close("#verify-mobile-number");
        ComponentManager.refreshComponent(
            ["main"],
            () => {
                this.loader.hide();
                this.successNotification.show(message);
            },
        );
    }

    // Open Lightbox after successful send sms code
    private launchLightBox() {
        const verificationError = this.element.querySelector("#modal-verification-error");
        const fieldWrapper = this.element.querySelector(".verification-code-field-wrapper");

        utility.addClass(verificationError, "hidden");
        verificationError.innerHTML = "";

        utility.removeClass(fieldWrapper, "has-error");
        utility.removeClass(fieldWrapper, "has-success");

        Modal.open("#verify-mobile-number");
    }

    private hideUnhideVerify(e, elem, value) {
        if (value && e.target.value !== value) {
            utility.addClass(elem.querySelector(".verification-container"), "hidden");
        }

        if (value && e.target.value === value) {
            utility.removeClass(elem.querySelector(".verification-container"), "hidden");
        }
    }
}
