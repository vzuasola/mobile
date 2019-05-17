import * as utility from "@core/assets/js/components/utility";
import {ComponentInterface} from "@core/src/Plugins/ComponentWidget/asset/component";
import {Profile} from "./scripts/profile";
import {SmsVerification} from "./scripts/verify-sms";

/**
 *
 */
export class MyAccountProfileComponent implements ComponentInterface {
    private profile: Profile;
    private smsVerification: SmsVerification;

    onLoad(element: HTMLElement, attachments: {}) {
        // console.log(element);
        this.activateProfile(element, attachments);
        this.activeSmsVerification(element, attachments);
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.activateProfile(element, attachments);
        this.activeSmsVerification(element, attachments);
    }

    /**
     * Activate Forgot Password
     */
    private activateProfile(element, attachments) {
        this.profile = new Profile(
            element,
            attachments,
        );
        this.profile.init();
    }

    /**
     * Activate SMS Verification
     */
    private activeSmsVerification(element, attachments) {
        this.smsVerification = new SmsVerification(
            element,
            attachments,
        );
        this.smsVerification.init();
    }
}
