import * as utility from "Base/utility";
import Storage from "Base/utils/storage";
import detectIE from "Base/browser-detect";
var crosstab = require("BaseVendor/crosstab");

/**
 * Cookie Notification
 *
 * Style/SASS: core/assets/sass/components/_cookie-notif.scss
 */

var storage = new Storage(),
    isNotifDisabled = JSON.parse(storage.get("cookie-notif-disabled")),
    notif = document.querySelector('.cookie-notif'),
    closeButton = document.querySelector('.cookie-notif-close'),
    geoip = document.body.getAttribute("data-geoip"),
    cookieNotif = document.querySelector(".cookie-notif"),
    countryCode = cookieNotif.getAttribute("data-country-codes"),
    countryArray = countryCode.split(",");

// Check for EU geoip
if (geoip && countryArray.indexOf(geoip) > -1) {
    utility.removeClass(notif, "hidden");
    eventListeners();
}

// Check if close button is already clicked
if (!geoip || isNotifDisabled) {
    utility.addClass(notif, "hidden");
}

function eventListeners() {
    utility.addEventListener(closeButton, "click", function () {
        broadcast("cookie.notif.disable");
    });

    crosstab.on('cookie.notif.disable', function (message) {
        utility.addClass(notif, "hidden");
        storage.set("cookie-notif-disabled", true);
    });
}

/**
 * Broadcast the event to other tabs
 */
function broadcast(event, data, destination) {
    try {
        crosstab.broadcast(event, data, destination);
        if (detectIE() === 8) {
            setTimeout(function () {
                crosstab.broadcast(event, data, destination);
            }, 300);
        }
    } catch (error) {
        // do nothing
    }
}
