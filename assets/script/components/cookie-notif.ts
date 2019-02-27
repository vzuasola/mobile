import * as utility from "@core/assets/js/components/utility";
import Storage from "@core/assets/js/components/utils/storage";

import {ComponentManager} from "@plugins/ComponentWidget/asset/component";

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
    private geoip;
    private cookieNotif;
    private countryCode;
    private countryArray;

    constructor(options) {
        this.storage = new Storage();
        this.isNotifDisabled = JSON.parse(this.storage.get("cookie-notif-disabled"));
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
        ComponentManager.subscribe("click", (event, src) => {
            if (utility.hasClass(src, "cookie-notif-close", 1)) {
                utility.addClass(this.notif, "hidden");
                this.storage.set("cookie-notif-disabled", true);
            }
        });
    }
}
