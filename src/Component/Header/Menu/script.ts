import * as utility from "@core/assets/js/components/utility";
import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";

import menu from "./scripts/menu";
import {PushNotification} from "./scripts/push-notification";

/**
 *
 */
export class MenuComponent implements ComponentInterface {
    private pushNotification: PushNotification;

    constructor() {
        this.pushNotification = new PushNotification();
    }

    onLoad(element: HTMLElement, attachments: {}) {
        menu(element);
        this.pushNotification.handleOnLoad(element, attachments);

        this.listenAnnouncementCount(element);
    }

    onReload(element: HTMLElement, attachments: {}) {
        menu(element);
        this.pushNotification.handleOnReload(element, attachments);
    }

    /**
     * Listen to announcement pushes
     */
    private listenAnnouncementCount(element) {
        utility.listen(document, "announcement.update.count", (event, target, data) => {
            const countElement = element.querySelector("#announcement-count");

            if (countElement) {
                countElement.innerHTML = data.count;

                if (data.count > 0) {
                    utility.removeClass(countElement, "hidden");
                } else {
                    utility.addClass(countElement, "hidden");
                }
            }
        });
    }
}
