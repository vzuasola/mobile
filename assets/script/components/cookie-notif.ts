import * as utility from "@core/assets/js/components/utility";
import Storage from "@core/assets/js/components/utils/storage";
import detectIE from "@core/assets/js/components/browser-detect";
import crosstab from "@app/assets/script/vendor/crosstab";

/**
 * Cookie Notification
 *
 * Style/SASS: core/assets/sass/components/_cookie-notif.scss
 */

export class CookieNotif {
    private isNotifDisabled;
    private notif;
    private closeButton;
    private geoip;
    private cookieNotif;
    private countryCode;
    private countryArray;

    constructor(options) {
        const storage = new Storage();
        this.isNotifDisabled = JSON.parse(storage.get("cookie-notif-disabled"));
        this.notif = document.querySelector(".cookie-notif");
        this.closeButton = document.querySelector(".cookie-notif-close");
        this.geoip = document.body.getAttribute("data-geoip") || options.geoIp;
        this.cookieNotif = document.querySelector(".cookie-notif");
        this.countryCode = this.cookieNotif.getAttribute("data-country-codes");
        this.countryArray = this.countryCode.split(",");

        // Check for EU geoip
        if (this.geoip && this.countryArray.indexOf(this.geoip) > -1) {
            utility.removeClass(this.notif, "hidden");
            this.eventListeners();
        }

        // Check if close button is already clicked
        if (!this.geoip || this.isNotifDisabled) {
            utility.addClass(this.notif, "hidden");
        }
    }

    eventListeners() {
        utility.addEventListener(this.closeButton, "click", (e) => {
            this.broadcast("cookie.notif.disable");
        });

        crosstab.on("cookie.notif.disable", function(message) {
            utility.addClass(this.notif, "hidden");
            this.storage.set("cookie-notif-disabled", true);
        });
    }

    /**
     * Broadcast the event to other tabs
     */
    broadcast(event, data = null, destination = null) {
        try {
            crosstab.broadcast(event, data, destination);
            if (detectIE() === 8) {
                setTimeout(() => {
                    crosstab.broadcast(event, data, destination);
                }, 300);
            }
        } catch (error) {
            // do nothing
        }
    }
}
