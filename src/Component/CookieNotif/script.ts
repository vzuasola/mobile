import * as utility from "@core/assets/js/components/utility";

import {CookieNotif} from "@app/assets/script/components/cookie-notif";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";

/**
 *
 */
export class CookieNotifComponent implements ComponentInterface {
    private element: HTMLElement;
    private originalUrl: string;

    onLoad(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.cookieNotif();

        Router.on(RouterClass.afterNavigate, (event) => {
            ComponentManager.refreshComponent("cookie_notification");
        });
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.cookieNotif();
    }

    private cookieNotif() {
        const notif: HTMLElement = this.element.querySelector(".cookie-notif");

        if (notif) {
            const geoIp = notif.getAttribute("data-geoip");
            const cookienotif = new CookieNotif({ geoIp });
        }
    }
}
