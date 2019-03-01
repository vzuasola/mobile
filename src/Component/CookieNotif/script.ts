import * as xhr from "@core/assets/js/vendor/reqwest";

import {CookieNotif} from "./scripts/cookie-notif";

import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

/**
 *
 */
export class CookieNotifComponent implements ComponentInterface {
    private element: HTMLElement;
    private geoIp: string;

    onLoad(element: HTMLElement, attachments: {}) {
        this.element = element;

        this.cookieNotif((geoIp) => {
            new CookieNotif({
                geoIp,
                element: this.element,
            });
        });
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.element = element;

        this.cookieNotif((geoIp) => {
            new CookieNotif({
                geoIp,
                element: this.element,
            });
        });
    }

    private cookieNotif(callback) {
        if (!this.geoIp) {
            xhr({
                url: Router.generateRoute("cookie_notification", "getGeoIp"),
                type: "json",
            }).then((response) => {
                this.geoIp = response.geo_ip;

                callback(response.geo_ip);
            });
        }

        callback(this.geoIp);
    }
}
