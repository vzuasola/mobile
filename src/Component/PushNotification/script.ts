import {ComponentInterface} from '@plugins/ComponentWidget/asset/component';

import pushnx from './scripts/push_notification';

/**
 *
 */
export class PushNotificationComponent implements ComponentInterface {
    onLoad(element: HTMLElement, attachments: {}) {
        pushnx(element, attachments);
    }

    onReload(element: HTMLElement, attachments: {}) {
        pushnx(element, attachments);
    }
}
