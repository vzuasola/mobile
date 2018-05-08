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
                    console.log("updated count");
                    utility.removeClass(countElement, "hidden");
                    utility.removeClass(element.querySelector(".mobile-menu-indicator"), "hidden");
                } else {
                    const notifCountElement = element.querySelector("#notification-count");
                    if (notifCountElement) {
                        const notifCount = notifCountElement.innerHTML;

                        if (notifCount < 0) {
                            utility.addClass(element.querySelector(".mobile-menu-indicator"), "hidden");
                        }
                    } else {
                        utility.addClass(element.querySelector(".mobile-menu-indicator"), "hidden");
                    }
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

                headerBalance.innerHTML = response.balance;
            }).fail((error, message) => {
                // do something
            });
        }
    }
}
