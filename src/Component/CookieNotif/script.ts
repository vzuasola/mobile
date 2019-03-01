import * as xhr from "@core/assets/js/vendor/reqwest";

import {CookieNotif} from "./scripts/cookie-notif";

import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

/**
 *
 */
export class CookieNotifComponent implements ComponentInterface {
    private element: HTMLElement;
    private originalUrl: string;

    onLoad(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.cookieNotif();
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.cookieNotif();
    }

    private cookieNotif() {
        xhr({
            url: Router.generateRoute("cookie_notification", "getGeoIp"),
            type: "json",
        }).then((response) => {

            if (response.geo_ip) {
                new CookieNotif({
                    geoIp: response.geo_ip,
                    element: this.element,
                });
            }
        });
    }
}
