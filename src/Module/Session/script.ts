import * as utility from "@core/assets/js/components/utility";

import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

import {Session} from "./scripts/session";

export class SessionModule implements ModuleInterface {
    private session: Session;
    private isSessionStarted: boolean = false;
    private isLogin: boolean = false;

    onLoad(attachments: {authenticated: boolean, timeout: number, hash: string}) {
        const timeout = attachments.timeout ? attachments.timeout : 15;

        this.session = new Session(timeout * 60);

        if (attachments.authenticated) {
            this.enableSession();
            this.isLogin = true;
        }

        ComponentManager.subscribe("session.login", (event, src) => {
            this.enableSession();
        });

        ComponentManager.subscribe("session.prelogin", (event, src) => {
            this.isLogin = true;
        });

        ComponentManager.subscribe("session.logout", (event, src) => {
            this.isLogin = false;
        });

        // allow us to transform the Router generated urls with a query
        // parameter flag. This allow us to properly set cache values for
        // post login pages
        Router.setOption("process-url-generators", (url: string, type: string) => {
            if (this.isLogin) {
                url = utility.addQueryParam(url, "authenticated", "true");

                if (attachments.hash) {
                    url = utility.addQueryParam(url, "hash", attachments.hash);
                }
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
