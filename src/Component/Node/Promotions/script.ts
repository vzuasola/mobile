import * as utility from "@core/assets/js/components/utility";

import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";

/**
 *
 */
export class PromotionsNodeComponent implements ComponentInterface {

    onLoad(element: HTMLElement, attachments: {countdown: string}) {
       this.getCountdown(element, attachments.countdown);
    }

    onReload(element: HTMLElement, attachments: {countdown: string}) {
       this.getCountdown(element, attachments.countdown);
    }

    private getCountdown(element, countdownFormat) {
        let elapsedStr: string = "";
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
                    elapsedStr = countdownFormat.replace("[days]", elapsed.days)
                        .replace("[hours]", elapsed.hours);

                    element.querySelector(".countdown-text").innerHTML = elapsedStr;
                    utility.removeClass(element.querySelector(".promotions-body-banner-scheduler"), "hidden");
                }
            }
        }
    }
}
