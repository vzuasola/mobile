import * as utility from "@core/assets/js/components/utility";

import {ComponentManager} from "@plugins/ComponentWidget/asset/component";

export class PushNotification {
    private count: 0;
    private element;

    handleOnLoad(element: HTMLElement, attachments: {authenticated: boolean}) {
        this.element = element;
        this.count = 0;

        if (attachments.authenticated) {
            this.listenPushnxCount();
            this.listenNewMessage();

            this.listenPushnxModal();
        } else {
            this.unbindListener();
        }
    }

    /**
     * listen to "click" event on left nav pushnx menu
     */
    private listenPushnxModal() {
        const src = this.element.querySelector(".notification-trigger");

        utility.listen(src, "click", (e) => {
            e.preventDefault();
            ComponentManager.broadcast("pushnx.open.modal");

            if (this.count <= 0) {
                this.hideIndicator();
            }
        });
    }

    /**
     * Listen to message counter
     */
    private listenPushnxCount() {
        ComponentManager.subscribe("pushnx.count.message", (event) => {
            if (!event.customData.count) {
                ComponentManager.broadcast("pushnx.close.modal");
            }

            this.count = event.customData.count;
            this.renderMessageCounter(this.count);
        });
    }

    /**
     * Update message counter
     */
    private renderMessageCounter( ctr) {
        const notifCount = this.element.querySelector("#notification-count");
        if (notifCount && ctr > 0) {
            utility.removeClass(notifCount, "hidden");
            notifCount.innerHTML = ctr;
        } else {
            this.hideIndicator();
            utility.addClass(notifCount, "hidden");
        }
    }

    /**
     * Listen to new pushnx message
     */
    private listenNewMessage() {
        ComponentManager.subscribe("pushnx.new.message", (event) => {
            if (event.customData.count) {
                this.showIndicator();
            }
        });
    }

    /**
     * Display indicator for new message
     */
    private showIndicator() {
        const indicator = this.element.querySelector(".mobile-menu-indicator");
        utility.removeClass(indicator, "hidden");
    }

    /**
     * Hide indicator
     */
    private hideIndicator() {
        const announcementCount = this.element.querySelector("#announcement-count");
        const indicator = this.element.querySelector(".mobile-menu-indicator");

        if (this.count <= 0 && announcementCount.innerHTML <= 0) {
            utility.addClass(indicator, "hidden");
        }
    }

    private unbindListener() {
        ComponentManager.unsubscribe("pushnx.count.message");
        ComponentManager.unsubscribe("pushnx.new.message");
    }
}
