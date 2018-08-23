import * as utility from "@core/assets/js/components/utility";
import * as closeButtonTemplate from "@app/templates/handlebars/close-button.handlebars";

/**
 * Notification
 *
 * @param Node parent parent element of notification to insert to
 * @param String className
 * @param Boolean enableButton add close button to notification
 */
export default class Notification {
    private parent: HTMLElement;
    private className: string;
    private notification: HTMLElement;
    private closeButton: HTMLElement;

    constructor(parent: HTMLElement, className: string, private enableButton: boolean = false) {
        this.parent = parent;
        this.className = className;
    }

    show(message): void {
        const oldNotification = this.parent.querySelector("." + this.className);

        this.createNotification(message);
        this.createButton();
        this.bindEvent();

        if (oldNotification) {
            oldNotification.remove();
        }
    }

    hide(parentElem, className): void {
        if (this.notification) {
            this.notification.remove();
        }
    }

    private bindEvent() {
        if (this.enableButton) {
            utility.listen(this.notification, "click", this.removeNotification);
        }
    }

    private removeNotification = (event, src) => {
        if (utility.hasClass(src, "close-button", true)) {
            utility.removeEventListener(this.notification, "click", this.removeNotification);
            this.notification.remove();
        }
    }

    private createNotification(message) {
        this.notification = utility.createElem("div", this.className, this.parent);

        this.notification.innerHTML = message;
    }

    private createButton() {
        if (this.enableButton) {
            this.closeButton = utility.createElem("span", "close-button", this.notification);
            this.closeButton.innerHTML = closeButtonTemplate();
        }
    }
}
