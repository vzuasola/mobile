import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

import {Menu} from "./scripts/menu";
import {PushNotification} from "./scripts/push-notification";

/**
 *
 */
export class MenuComponent implements ComponentInterface {
    private pushNotification: PushNotification;
    private element: HTMLElement;

    constructor() {
        this.pushNotification = new PushNotification();
    }

    onLoad(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.activateMenu(element);
        this.pushNotification.handleOnLoad(element, attachments);

        this.listenAnnouncementCount();
        this.getBalance(element, attachments);
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.activateMenu(element);
        this.pushNotification.handleOnLoad(element, attachments);

        this.getBalance(element, attachments);
    }

    /**
     * Enable menu slide behavior
     */
    private activateMenu(element) {
        const menu = new Menu(element);
        menu.activate();
    }

    /**
     * Listen to announcement pushes
     */
    private listenAnnouncementCount() {
        ComponentManager.subscribe("announcement.update.count", (event, target, data) => {
            const countElement = this.element.querySelector("#announcement-count");

            if (countElement) {
                countElement.innerHTML = data.count;

                if (parseInt(data.count, 10) > 0) {
                    utility.removeClass(countElement, "hidden");
                    utility.removeClass(this.element.querySelector(".mobile-menu-indicator"), "hidden");
                } else {
                    const notifCountElement = this.element.querySelector("#notification-count");

                    if (notifCountElement) {
                        const notifCount = notifCountElement.innerHTML;

                        if (parseInt(notifCount, 10) <= 0) {
                            utility.addClass(this.element.querySelector(".mobile-menu-indicator"), "hidden");
                        }
                    } else {
                        utility.addClass(this.element.querySelector(".mobile-menu-indicator"), "hidden");
                    }
                    utility.addClass(countElement, "hidden");
                }
            }
        });
    }

    private getBalance(element, attachments) {
        if (attachments.authenticated) {
            xhr({
                url: Router.generateModuleRoute("balance", "balances"),
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
