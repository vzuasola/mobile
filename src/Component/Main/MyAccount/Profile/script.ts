import * as utility from "@core/assets/js/components/utility";
import {ComponentInterface} from "@core/src/Plugins/ComponentWidget/asset/component";
import {Profile} from "./scripts/profile";

/**
 *
 */
export class MyAccountProfileComponent implements ComponentInterface {
    private profile: Profile;

    onLoad(element: HTMLElement, attachments: {}) {
        this.activateProfile(element, attachments);
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.activateProfile(element, attachments);
    }

    /**
     * Activate Forgot Password
     */
    private activateProfile(element, attachments) {
        this.profile = new Profile(
            element,
            attachments);
        this.profile.init();
    }
}
