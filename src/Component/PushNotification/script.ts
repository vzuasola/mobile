import {ComponentInterface} from '@plugins/ComponentWidget/asset/component';

import {PushNotification} from './scripts/push-notification';

/**
 *
 */
export class PushNotificationComponent implements ComponentInterface {
    private pushnx;

    onLoad(element: HTMLElement, attachments: {}) {
        this.bindInstance(element, attachments);
    }

    onReload(element: HTMLElement, attachments: {}) {
    }

    private bindInstance(element, attachments) {
        this.pushnx = new PushNotification(element, attachments);
    }
}
