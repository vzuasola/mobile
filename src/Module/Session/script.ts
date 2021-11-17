import * as utility from "@core/assets/js/components/utility";

import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

import {Session} from "./scripts/session";

export class SessionModule implements ModuleInterface {
    private session: Session;
    private isSessionStarted: boolean = false;
    private isLogin: boolean = false;
    private hash: string;
    private geoip: string;
    private hasLogout: boolean = false;

    onLoad(attachments: {authenticated: boolean, timeout: number, hash: string, geoip: string}) {
        const timeout = attachments.timeout ? attachments.timeout : 15;
        this.geoip = attachments.geoip;
        this.session = new Session(timeout * 60);

        if (attachments.authenticated) {
            this.enableSession();

            this.isLogin = true;
            this.hash = attachments.hash;
        }

        ComponentManager.subscribe("session.login", (event, src, data) => {
            this.enableSession();
        });

        ComponentManager.subscribe("session.prelogin", (event, src, data) => {
            this.isLogin = true;

            // update the hash on successful login with the new hash data
            this.hash = data.response.hash;
        });

        ComponentManager.subscribe("session.logout", (event, src) => {
            this.isLogin = false;
            this.hasLogout = true;
        });

        // allow us to transform the Router generated urls with a query
        // parameter flag. This allow us to properly set cache values for
        // post login pages
        Router.setOption("process-url-generators", (url: string, type: string) => {
            if (this.isLogin) {
                url = utility.addQueryParam(url, "authenticated", "true");

                if (this.hash) {
                    url = utility.addQueryParam(url, "hash", this.hash);
                }
            }

            if (this.hasLogout) {
                url = utility.addQueryParam(url, "authenticated", "false");
            }

            const affiliates = utility.getCookie("affiliates");

            if (affiliates) {
                url = utility.addQueryParam(url, "aff", utility.getAsciiSum(affiliates));
            }

            return url;
        });
    }

    private enableSession() {
        if (!this.isSessionStarted) {
            this.session.init();
            this.isSessionStarted = true;
        }
    }
}
