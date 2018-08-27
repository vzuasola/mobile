import * as utility from "@core/assets/js/components/utility";
import {ComponentInterface} from "@core/src/Plugins/ComponentWidget/asset/component";
import {Profile} from "./scripts/profile";
import {Sms} from "./scripts/sms";

/**
 *
 */
export class MyAccountProfileComponent implements ComponentInterface {
    private profile: Profile;
    private sms: Sms;

    onLoad(element: HTMLElement, attachments: {}) {
        this.activateProfile(element, attachments);
        this.enableSms(element, attachments);
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.activateProfile(element, attachments);
        this.enableSms(element, attachments);
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

    private enableSms(element, attachments) {
        this.sms = new Sms(
            element,
            attachments,
        );
        this.sms.init();
    }
}
