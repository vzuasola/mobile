import * as utility from "@core/assets/js/components/utility";

import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

import {Session} from "./scripts/session";

export class SessionModule implements ModuleInterface {
    private session: Session;
    private isSessionStarted: boolean = false;
    private isLogin: boolean = false;
    private hash: string;

    onLoad(attachments: {authenticated: boolean, timeout: number, hash: string}) {
        const timeout = attachments.timeout ? attachments.timeout : 15;

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
        });

        // allow us to transform the Router generated urls with a query
        // parameter flag. This allow us to properly set cache values for
        // post login pages
        Router.setOption("process-url-generators", (url: string, type: string) => {
            const hashCookie: any = {};

            if (this.isLogin) {
                hashCookie.authenticated = "true";

                url = utility.addQueryParam(url, "authenticated", "true");

                if (attachments.hash) {
                    hashCookie.hash = this.hash;

                    url = utility.addQueryParam(url, "hash", this.hash);
                }
            }

            const affiliates = utility.getCookie("affiliates");

            if (affiliates) {
                hashCookie.aff = utility.getAsciiSum(affiliates);

                url = utility.addQueryParam(url, "aff", utility.getAsciiSum(affiliates));
            }

            // create a cookie that will be used by the router navigation
            // AJAX endpoints on first load. We do this since no module is
            // initialized on page load during page construction
            utility.setCookie("routerhash", JSON.stringify(hashCookie));

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
