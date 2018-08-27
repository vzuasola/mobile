import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";
import {Loader} from "@app/assets/script/components/loader";
import {Modal} from "@app/assets/script/components/modal";
import {Marker} from "@app/assets/script/components/marker";
import {Router} from "@plugins/ComponentWidget/asset/router";
import {VerificationCodeValidate} from "./verification-code-validate";
import {ComponentManager} from "@core/src/Plugins/ComponentWidget/asset/component";
import * as checkTemplate from "@app/templates/handlebars/icon-check-only.handlebars";

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
    private addNewMobile: any;
    private subTypeId: number;
    private verified: boolean;

    // construct
    constructor(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.attachments = attachments;
        this.loader = new Loader(document.body, true);
    }
    // init
    init() {
        this.mobile1Item = this.element.querySelector(".MyProfileForm_mobile_number_1");
        this.mobile2Item = this.element.querySelector(".MyProfileForm_mobile_number_2");
        this.verifyContainer = this.element.querySelector(".verification-container");
        this.verificationError = this.element.querySelector("#verification-error");
        this.addNewMobile = this.element.querySelector("#add-new-mobile").cloneNode(true);
        this.prepareElements();
        this.attachEvents();
        const verifCodeValidate = new VerificationCodeValidate(
            this.element,
            this.attachments,
        );
        verifCodeValidate.init();

        // Radio
        new Marker({
            parent: ".MyProfileForm_mobile_number_1",
        });
    }
    // prepare necessary elements for sms verification
    private prepareElements() {
        const primary = this.element.querySelector(".MyProfileForm_primary_number");
        // append verification button
        this.mobile1Item.appendChild(this.verifyContainer.cloneNode(true));
        this.mobile2Item.appendChild(this.verifyContainer.cloneNode(true));
        this.mobile1Item.insertBefore(
            primary,
            this.mobile1Item.querySelector(".form-field").nextElementSibling,
        );
        // check if mobile number 2 is empty on icore
        if (this.attachments.user.mobile_number_2 === "") {
            // add new mobile number link
            this.mobile1Item.appendChild(this.addNewMobile);
            utility.removeClass(this.addNewMobile, "hidden");
            this.element.querySelector("#MyProfileForm_mobile_number_2").setAttribute("disabled", "disabled");
            // hide mobile number 2 field
            utility.addClass(this.element.querySelector(".form-item.MyProfileForm_mobile_number_2"), "hidden");
            // add listener to add new mobile to unhide mobile 2 field
            utility.listen(this.element, "click", (event) => {
                this.addNewMobileNumber(event);
            });
        }

        const verif1Container = this.element.querySelector(".MyProfileForm_mobile_number_1 .verification-container");
        const verif2Container = this.element.querySelector(".MyProfileForm_mobile_number_2 .verification-container");

        // add verified icon on verified mobile number
        if (this.attachments.user.sms_1_verified) {
            this.addCheckIcon(verif1Container);
        }
        if (this.attachments.user.sms_2_verified) {
            this.addCheckIcon(verif2Container);
        }
        // Mobile 1 field alter
        utility.removeClass(verif1Container, "hidden");
        if (!this.attachments.user.sms_1_verified) {
            const verifyBtn = this.element.querySelector(".MyProfileForm_mobile_number_1 .verify-mobile-selector");
            utility.removeClass(verifyBtn , "hidden");
            utility.addClass(verifyBtn , "MyProfileForm_mobile_number_1_verify");
        }
        // Mobile 2 field alter
        utility.removeClass(verif2Container, "hidden");
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
            const mobileNumber2Field: HTMLInputElement = this.element.querySelector("#MyProfileForm_mobile_number_2");
            const mobileNumber2FieldValue = mobileNumber2Field.getAttribute("data-value");
            utility.removeClass(this.element.querySelector(".form-item.MyProfileForm_mobile_number_2"), "hidden");
            mobileNumber2Field.removeAttribute("disabled");
            mobileNumber2Field.value = mobileNumber2FieldValue;
            utility.addClass(e.target, "hidden");
            const mobile2Btn = this.element.querySelector(".MyProfileForm_mobile_number_2 .verify-mobile");
            utility.addClass(mobile2Btn, "hidden");
        }
    }

    // Method to send sms
    private sendVerificationCode(event) {
        this.verified = false;
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
                this.loader.hide();
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

        if (verifCode.length > 6 || verifCode.length < 6) {
            return;
        }

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
                utility.addClass(verificationError, "hidden");
                utility.removeClass(verificationSuccess, "hidden");
                verificationSuccess.innerHTML = res.message;
                This.checkSmsStatus(This);
            } else {
                utility.addClass(verificationSuccess, "hidden");
                utility.removeClass(verificationError, "hidden");
                verificationError.innerHTML = res.message;
                this.loader.hide();
            }
        });
    }

    // Check sms verification status
    private checkSmsStatus(parentThis) {
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
                            this.refreshProfileForm();
                        }
                    } else {
                        this.refreshProfileForm();
                    }
                });
            }
        }, 3000);
    }

    private refreshProfileForm() {
        this.verified = true;
        Modal.close("#verify-mobile-number");
        ComponentManager.refreshComponent(
            ["main"],
            () => {
                this.loader.hide();
            },
        );
    }

    // Open Lightbox after successful send sms code
    private launchLightBox() {
        Modal.open("#verify-mobile-number");
    }
}
