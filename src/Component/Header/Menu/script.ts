import * as utility from "@core/assets/js/components/utility";
import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";

import menu from "./scripts/menu";

/**
 *
 */
export class MenuComponent implements ComponentInterface {
    onLoad(element: HTMLElement, attachments: {}) {
        menu(element);
        this.listenAnnouncementCount(element);
        this.listenPushnxModal(element);
        this.listenPushnxCount(element);
        this.listenNewMessage(element);
    }

    onReload(element: HTMLElement, attachments: {}) {
        menu(element);
        this.listenPushnxModal(element);
    }

    private listenAnnouncementCount(element) {
        utility.listen(document, "announcement.update.count", (event) => {
            element.querySelector("#announcement-count").innerHTML = event.customData.count;
            if (event.customData.count > 0) {
                utility.removeClass(element.querySelector("#announcement-count"), "hidden");
            } else {
                utility.addClass(element.querySelector("#announcement-count"), "hidden");
            }
        });
    }

    /**
     * listen to "click" event on left nav pushnx menu
     */
    private listenPushnxModal(element) {
        let src = element.querySelector(".notification-trigger");
        console.log(src);
        // const menuNotif = element.querySelector(".quicklinks-notification");
        if (!utility.hasClass(element, ".notification-trigger")) {
            src = utility.findParent(element, ".notification-trigger", 2);
        }
        console.log(src);

        utility.listen(src, "click", (e) => {
            e.preventDefault();
            utility.invoke(document, "pushnx.open.modal");
            this.hideIndicator(element);
        });
    }

    /**
     * listen to message counter
     */
    private listenPushnxCount(element) {
        utility.listen(document, "pushnx.count.message", (event) => {
            if (!event.customData.count) {
                utility.invoke(document, "pushnx.close.modal");
            }

            this.renderMessageCounter(element, event.customData.count);
        });
    }

    /**
     * update message counter
     * @param ctr [number of messages]
     */
    private renderMessageCounter(element, ctr) {
        const notifCount = element.querySelector("#notification-count");
        if (notifCount && ctr > 0) {
            utility.removeClass(notifCount, "hidden");
            notifCount.innerHTML = ctr;
        } else {
            utility.addClass(notifCount, "hidden");
        }
    }

    /**
     * listen to new pushnx message
     */
    private listenNewMessage(element) {
        utility.listen(document, "pushnx.new.message", (event) => {
            if (event.customData.count) {
                this.showIndicator(element);
            }
        });
    }

    /**
     * display indicator for new message
     */
    private showIndicator(element) {
        const indicator = element.querySelector(".mobile-menu-indicator");
        utility.removeClass(indicator, "hidden");
    }

    /**
     * hide indicator after pushnx modal has opened
     */
    private hideIndicator(element) {
        const indicator = element.querySelector(".mobile-menu-indicator");
        utility.addClass(indicator, "hidden");
    }
}
