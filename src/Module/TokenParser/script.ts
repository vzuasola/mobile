import * as utility from "@core/assets/js/components/utility";

import { ComponentManager, ModuleInterface } from "@plugins/ComponentWidget/asset/component";

export class TokenParserModule implements ModuleInterface {

    private token: any;

    private methods: any = {
        parseLink: (element, selector) => {
            this.parseLink(element, selector);
        },
    };

    onLoad(attachments: { authenticated: boolean, token: string }) {

        if (attachments.authenticated) {
            this.token = attachments.token;
        }

        ComponentManager.subscribe("token.parse", (event, src, data) => {
            this.methods[data.method](data.element, data.selector);
        });

        ComponentManager.subscribe("session.prelogin", (event, src, data) => {
            // update the token on successful login with the new token data
            this.token = data.response.token;
        });

        ComponentManager.subscribe("session.logout", (event, src) => {
            this.token = false;
        });

    }

    private parseLink(element, selector) {
        const els = element.querySelectorAll(selector);
        if (els) {
            els.forEach((el) => {
                el.href = decodeURIComponent(el.href).replace("{ticket.token}", this.token);
            });
        }
    }

}
