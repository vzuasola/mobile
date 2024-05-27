import * as utility from "@core/assets/js/components/utility";
import Storage from "@core/assets/js/components/utils/storage";

/**
 * Cookie Notification
 *
 * Style/SASS: core/assets/sass/components/_cookie-notif.scss
 */

export class CookieNotif {
    private storage;
    private isNotifDisabled;
    private notif;
    private closeButton;

    constructor(options) {
        this.storage = new Storage();
        this.isNotifDisabled = JSON.parse(this.storage.get("cookie-notif-disabled"));
        this.notif = options.element.querySelector(".cookie-notif");
        this.closeButton = options.element.querySelector(".cookie-notif-close");

        utility.removeClass(this.notif, "hidden");
        this.eventListeners();

        // Check if close button is already clicked
        if (this.isNotifDisabled) {
            utility.addClass(this.notif, "hidden");
        }
    }

    eventListeners() {
        utility.listen(this.closeButton, "click", (e) => {
            utility.addClass(this.notif, "hidden");
            this.storage.set("cookie-notif-disabled", true);
        });
    }
}
