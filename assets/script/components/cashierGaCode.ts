import * as utility from "@core/assets/js/components/utility";

/**
 * cashier GA event code
 *
 * @param Node element component element
 * @param String className
 * @param String label GA eventLabel
 */

const cashierGaCode = (element: HTMLElement, className: string, label: string) => {
    utility.listen(element, "click", (event, src) => {
        const target =  utility.hasClass(src, className, true);

        if (target) {
            ga("send", "event", {
                eventCategory: "successpage",
                eventAction: "click",
                eventLabel: label,
            });
        }
    });
};

export default cashierGaCode;
