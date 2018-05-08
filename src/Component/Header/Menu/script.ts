import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";
import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

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
        this.getBalance(element, attachments);
    }

    onReload(element: HTMLElement, attachments: {}) {
        menu(element);
        this.pushNotification.handleOnReload(element, attachments);

        this.getBalance(element, attachments);
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

    private getBalance(element, attachments) {
        if (attachments.authenticated) {
            xhr({
                url: Router.generateRoute("balance", "balances"),
                type: "json",
            }).then((response) => {
                const headerBalance = element.querySelector(".mobile-menu-amount");
                let formatedBalance: string;
                formatedBalance = response.format;
                formatedBalance = formatedBalance.replace("{currency}", response.currency);
                formatedBalance = formatedBalance.replace("{total}", response.balance);
                headerBalance.innerHTML = formatedBalance;
            }).fail((error, message) => {
                // do something
            });
        }
    }
}
