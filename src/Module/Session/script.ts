import * as utility from "@core/assets/js/components/utility";

import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";

import {Session} from "./scripts/session";

export class SessionModule implements ModuleInterface {
    private session: Session;
    private isSessionStarted: boolean = false;

    onLoad(attachments: {authenticated: boolean}) {
        this.session = new Session(300);

        if (attachments.authenticated) {
            this.enableSession();
        }

        ComponentManager.subscribe("session.login", (event, src) => {
            this.enableSession();
        });
    }

    private enableSession() {
        if (!this.isSessionStarted) {
            this.session.init();
            this.isSessionStarted = true;
        }
    }
}
