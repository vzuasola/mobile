import * as utility from "@core/assets/js/components/utility";

import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";

import {PushNotification} from "./scripts/push-notification";

/**
 *
 */
export class PushNotificationComponent implements ComponentInterface {
    private pushnx;

    onLoad(element: HTMLElement, attachments: {}) {
        this.bindInstance(element, attachments);
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.bindInstance(element, attachments);
    }

    private bindInstance(element, attachments) {
        this.pushnx = new PushNotification(element, attachments);
    }

    private cleanCookie() {
        utility.removeCookie("pnxInitialLogin");
    }
}
