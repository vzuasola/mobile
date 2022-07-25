import * as utility from "@core/assets/js/components/utility";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";

/**
 *
 */
export class PromotionsNodeComponent implements ComponentInterface {
    onLoad(element: HTMLElement, attachments: {countdown: string}) {
        this.getCountdown(element, attachments.countdown);
        this.componentFinish(element);
        this.refreshPreviousPage();
    }

    onReload(element: HTMLElement, attachments: {countdown: string}) {
        this.getCountdown(element, attachments.countdown);
        this.componentFinish(element);
        this.refreshPreviousPage();
    }

    private getCountdown(element, countdownFormat) {
        if (element.querySelector(".countdown-text")) {
            const endTime = element.querySelector(".countdown-text").getAttribute("data-end-time");

            if (endTime) {
                const startTime =  new Date().getTime();
                const timeDiff = (new Date(endTime).getTime() - startTime) / 1000;

                if (timeDiff > 0) {
                    const elapsed = {
                        days: Math.floor(timeDiff / 86400),
                        hours: Math.floor(timeDiff / 3600 % 24),
                    };

                    if (elapsed.days > 0 || elapsed.hours > 0) {
                        const elapsedStr = countdownFormat.replace("[days]", elapsed.days)
                            .replace("[hours]", elapsed.hours);

                        element.querySelector(".countdown-text").innerHTML = elapsedStr;
                        utility.removeClass(element.querySelector(".promotions-body-banner-scheduler"), "hidden");
                    }
                }
            }
        }
    }

    private componentFinish(element) {
        ComponentManager.broadcast("token.parse", {
            element,
            method: "parseLink",
            selector: "[href*=ticket\\.token]",
        });
    }

    private refreshPreviousPage() {
        const button = document.getElementById("refreshButton");
        button.onclick = () => {
            window.history.go(-1);
            setTimeout(() => {
                window.location.reload();
            }, 200);
        };
    }
}
