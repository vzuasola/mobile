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
    private isLogin: boolean;

    constructor() {
        this.pushNotification = new PushNotification();
    }

    onLoad(element: HTMLElement, attachments: {authenticated: boolean}) {
        this.element = element;
        this.isLogin = attachments.authenticated;

        this.activateMenu(element);
        this.pushNotification.handleOnLoad(element, attachments);

        this.listenAnnouncementCount();
        this.listenBalance();

        ComponentManager.subscribe("session.prelogin", (event, src, data) => {
            this.isLogin = true;
        });

        ComponentManager.subscribe("session.logout", (event) => {
            this.isLogin = false;
        });

    }

    onReload(element: HTMLElement, attachments: {authenticated: boolean}) {
        this.element = element;

        this.activateMenu(element);
        this.pushNotification.handleOnLoad(element, attachments);
    }

    /**
     * Enable menu slide behavior
     */
    private activateMenu(element) {
        const menu = new Menu(element);
        menu.activate();
    }

    private listenBalance() {
        ComponentManager.subscribe("balance.fetch", (event, src, data: any) => {
            if (this.isLogin && typeof data.balance !== "undefined") {
                const headerBalance = this.element.querySelector(".mobile-menu-amount");
                let formatedBalance: string;

                formatedBalance = data.format;

                if (formatedBalance) {
                    formatedBalance = formatedBalance.replace("{currency}", data.currency);
                    formatedBalance = formatedBalance.replace("{total}", data.balance);

                    headerBalance.innerHTML = formatedBalance;
                }
            }
        });
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
                    const notifCount = notifCountElement ? parseInt(notifCountElement.innerHTML, 10) : 0;

                    if (notifCount <= 0) {
                        utility.addClass(this.element.querySelector(".mobile-menu-indicator"), "hidden");
                    }
                    utility.addClass(countElement, "hidden");
                }
            }
        });
    }
}
