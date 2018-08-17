import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";
import {Loader} from "@app/assets/script/components/loader";
import {Modal} from "@app/assets/script/components/modal";

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

    constructor(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.attachments = attachments;
    }

    init() {
        console.log(this.attachments);
        // Mobile Number Post process
        this.mobile1Item = this.element.querySelector(".MyProfileForm_mobile_number_1 .form-field"),
        this.mobile2Item = this.element.querySelector(".MyProfileForm_mobile_number_2 .form-field"),
        this.verifyContainer = this.element.querySelector(".verification-container");
        console.log(this.mobile1Item);
        // check if mobile number 2 is empty on icore
        if (this.attachments.user.mobile_number_2 === "") {
            // add new mobile number link
            this.mobile1Item.appendChild(this.element.querySelector("#add-new-mobile").cloneNode(true));
            utility.removeClass(this.element.querySelector(".MyProfileForm_mobile_number_1 #add-new-mobile"), "hidden");
            this.element.querySelector("#ProfileForm_mobile_number_2").setAttribute("disabled", "disabled");
            // hide mobile number 2 field
            utility.addClass(this.element.querySelector(".form-item.ProfileForm_mobile_number_2"), "hidden");
            // add listener to add new mobile to unhide mobile 2 field
            utility.addEventListener(this.element, "click", function(e) {
                if (e.target && e.target.id === "add-new-mobile") {
                    e.preventDefault();
                    utility.removeClass(this.element.querySelector(".form-item.ProfileForm_mobile_number_2"), "hidden");
                    this.element.getElementById("ProfileForm_mobile_number_2").removeAttribute("disabled");
                    utility.addClass(e.target, "hidden");
                    const mobile2Btn = this.element.querySelector(".ProfileForm_mobile_number_2 .verify-mobile");
                    utility.addClass(mobile2Btn, "hidden");
                }
            });
        }
        this.mobile1Item.appendChild(this.verifyContainer.cloneNode(true));
        this.mobile2Item.appendChild(this.verifyContainer.cloneNode(true));
        if (this.attachments.user.sms_1_verified) {
            utility.removeClass(this.element.querySelector(".MyProfileForm_mobile_number_1 .verified-mobile"), "hidden");
        }
        if (this.attachments.user.sms_2_verified) {
            utility.removeClass(this.element.querySelector(".ProfileForm_mobile_number_2 .verified-mobile"), "hidden");
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
        const verif2Container = this.element.querySelector(".MyProfileForm_mobile_number_1 .verification-container");
        utility.removeClass(verif2Container, "hidden");
        if (!this.attachments.user.sms_2_verified) {
            this.verifyBtn  = this.element.querySelector(".ProfileForm_mobile_number_2 .verify-mobile-selector");
            utility.removeClass(this.verifyBtn, "hidden");
            utility.addClass(this.verifyBtn, "ProfileForm_mobile_number_2");
        }
    }
}
