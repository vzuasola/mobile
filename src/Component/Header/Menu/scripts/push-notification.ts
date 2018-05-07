import * as utility from "@core/assets/js/components/utility";

export class PushNotification {
    handleOnLoad(element: HTMLElement, attachments: {}) {
        this.listenPushnxCount(element);
        this.listenNewMessage(element);

        this.listenPushnxModal(element);
    }

    handleOnReload(element: HTMLElement, attachments: {}) {
        this.listenPushnxModal(element);
    }

    /**
     * listen to "click" event on left nav pushnx menu
     */
    private listenPushnxModal(element) {
        const src = element.querySelector(".notification-trigger");

        utility.listen(src, "click", (e) => {
            e.preventDefault();
            utility.invoke(document, "pushnx.open.modal");
            this.hideIndicator(element);
        });
    }

    /**
     * Listen to message counter
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
     * Update message counter
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
     * Listen to new pushnx message
     */
    private listenNewMessage(element) {
        utility.listen(document, "pushnx.new.message", (event) => {
            if (event.customData.count) {
                this.showIndicator(element);
            }
        });
    }

    /**
     * Display indicator for new message
     */
    private showIndicator(element) {
        const indicator = element.querySelector(".mobile-menu-indicator");
        utility.removeClass(indicator, "hidden");
    }

    /**
     * Hide indicator after pushnx modal has opened
     */
    private hideIndicator(element) {
        const indicator = element.querySelector(".mobile-menu-indicator");
        utility.addClass(indicator, "hidden");
    }
}
