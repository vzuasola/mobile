import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";
import {Loader} from "@app/assets/script/components/loader";
import {Modal} from "@app/assets/script/components/modal";
import {Router} from "@plugins/ComponentWidget/asset/router";
import {VerificationCodeValidate} from "./verification-code-validate";

/**
 * SMS Verification
 *
 * @param Node element component parent element
 * @param Object attachments
 * @param String emailField selector to target for email
 * @param String passwordField selector to target for password
 */
export class Sms {
    private loader: Loader;
    private validator: any;
    private element: HTMLElement;
    private attachments: any;
    private mobile1Item: HTMLElement;
    private mobile2Item: HTMLElement;
    private verifyContainer: HTMLElement;
    private verifyBtn: HTMLElement;
    private verificationError: HTMLElement;
    private subTypeId: number;
    // construct
    constructor(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.attachments = attachments;
    }
    // init
    init() {
        this.mobile1Item = this.element.querySelector(".MyProfileForm_mobile_number_1 .form-field");
        this.mobile2Item = this.element.querySelector(".MyProfileForm_mobile_number_2 .form-field");
        this.verifyContainer = this.element.querySelector(".verification-container");
        this.verificationError = this.element.querySelector("#verification-error");
        this.prepareElements();
        this.attachEvents();
        const verifCodeValidate = new VerificationCodeValidate(
            this.element,
            this.attachments,
        );
        verifCodeValidate.init();
    }
    // prepare necessary elements for sms verification
    private prepareElements() {
        // append verification button
        this.mobile1Item.appendChild(this.verifyContainer.cloneNode(true));
        this.mobile2Item.appendChild(this.verifyContainer.cloneNode(true));
        // check if mobile number 2 is empty on icore
        if (this.attachments.user.mobile_number_2 === "") {
            // add new mobile number link
            this.mobile1Item.appendChild(this.element.querySelector("#add-new-mobile").cloneNode(true));
            utility.removeClass(this.element.querySelector(".MyProfileForm_mobile_number_1 #add-new-mobile"), "hidden");
            this.element.querySelector("#MyProfileForm_mobile_number_2").setAttribute("disabled", "disabled");
            // hide mobile number 2 field
            utility.addClass(this.element.querySelector(".form-item.MyProfileForm_mobile_number_2"), "hidden");
            // add listener to add new mobile to unhide mobile 2 field
            utility.listen(this.element, "click", (event) => {
                this.addNewMobileNumber(event);
            });
        }
        // add verified icon on verified mobile number
        if (this.attachments.user.sms_1_verified) {
            const verifiedElem = this.element.querySelector(".MyProfileForm_mobile_number_1 .verified-mobile");
            utility.removeClass(verifiedElem, "hidden");
        }
        if (this.attachments.user.sms_2_verified) {
            const verifiedElem2 = this.element.querySelector(".MyProfileForm_mobile_number_2 .verified-mobile");
            utility.removeClass(verifiedElem2, "hidden");
        }
        // Mobile 1 field alter
        const verif1Container = this.element.querySelector(".MyProfileForm_mobile_number_1 .verification-container");
        utility.removeClass(verif1Container, "hidden");
        if (!this.attachments.user.sms_1_verified) {
            this.verifyBtn = this.element.querySelector(".MyProfileForm_mobile_number_1 .verify-mobile-selector");
            utility.removeClass(this.verifyBtn , "hidden");
            utility.addClass(this.verifyBtn , "MyProfileForm_mobile_number_1");
        }
        // Mobile 2 field alter
        const verif2Container = this.element.querySelector(".MyProfileForm_mobile_number_2 .verification-container");
        utility.removeClass(verif2Container, "hidden");
        if (!this.attachments.user.sms_2_verified) {
            this.verifyBtn = this.element.querySelector(".MyProfileForm_mobile_number_2 .verify-mobile-selector");
            utility.removeClass(this.verifyBtn, "hidden");
            utility.addClass(this.verifyBtn, "ProfileForm_mobile_number_2");
        }
    }

    // Attach SMS Action Events
    private attachEvents() {
        utility.listen(this.mobile1Item.querySelector("#verify-mobile-modal"), "click", (event) => {
            this.sendVerificationCode(event);
        });
        utility.listen(this.mobile2Item.querySelector("#verify-mobile-modal"), "click", (event) => {
            this.sendVerificationCode(event);
        });
        utility.listen(this.element.querySelector("#verify-mobile-resend"), "click", (event) => {
            this.resendVerificationCode(event);
        });
        utility.listen(this.element.querySelector("#verify-mobile-submit"), "click", (event) => {
            this.submitVerificationCode(event);
        });
    }

    private addNewMobileNumber(e) {
        if (e.target && e.target.id === "add-new-mobile") {
            e.preventDefault();
            utility.removeClass(this.element.querySelector(".form-item.MyProfileForm_mobile_number_2"), "hidden");
            this.element.querySelector("#MyProfileForm_mobile_number_2").removeAttribute("disabled");
            utility.addClass(e.target, "hidden");
            const mobile2Btn = this.element.querySelector(".MyProfileForm_mobile_number_2 .verify-mobile");
            utility.addClass(mobile2Btn, "hidden");
        }
    }

    // Method to send sms
    private sendVerificationCode(event) {
        if (event.target && event.target.id === "verify-mobile-modal") {
            this.subTypeId = 2;

            if (utility.hasClass(event.target, "MyProfileForm_mobile_number_1")) {
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
                if (res.response_code === "SMS_VERIFICATION_SUCCESS") {
                    utility.addClass(this.verificationError, "hidden");
                    this.verificationError.innerHTML = "";
                    this.launchLightBox();
                } else {
                    utility.removeClass(this.verificationError, "hidden");
                    this.verificationError.innerHTML = res.message;
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
            } else {
                utility.addClass(verificationSuccess, "hidden");
                utility.removeClass(verificationError, "hidden");
                verificationError.innerHTML = res.message;
            }
        });
    }

    // Method to submit verification code from sms
    private submitVerificationCode(event) {
        event = event || window.event;
        utility.preventDefault(event);
        const This = this;
        const verifCodeField: HTMLInputElement = this.element.querySelector("#verification-code-field");
        const verifCode = verifCodeField.value;
        const verificationError = document.getElementById("modal-verification-error");
        const verificationSuccess = document.getElementById("modal-verification-success");

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
                utility.addClass(verificationError, "hidden");
                utility.removeClass(verificationSuccess, "hidden");
                verificationSuccess.innerHTML = res.message;
                This.checkSmsStatus(This);
            } else {
                utility.addClass(verificationSuccess, "hidden");
                utility.removeClass(verificationError, "hidden");
                verificationError.innerHTML = res.message;
            }
        });
    }

    // Check sms verification status
    private checkSmsStatus(parentThis) {
        const This = parentThis;
        let checkStatusCounter = 0;
        setInterval((e) => {
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
                        This.checkSmsStatus;
                    } else {
                        location.reload();
                    }
                }
            });
        }, 3000);
    }

    // Open Lightbox after successful send sms code
    private launchLightBox() {
        Modal.open("#verify-mobile-number");
    }
}
