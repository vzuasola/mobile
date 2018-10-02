import * as utility from "@core/assets/js/components/utility";

import {ComponentManager, ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@core/src/Plugins/ComponentWidget/asset/router";

import {Loader} from "@app/assets/script/components/loader";

/**
 *
 */
export class LobbyComponent implements ComponentInterface {
    private loader: Loader;
    private isLogin: boolean = false;

    constructor() {
        this.loader = new Loader(document.body, true);
    }

    onLoad(element: HTMLElement, attachments: {authenticated: boolean}) {
        this.isLogin = attachments.authenticated;

        ComponentManager.subscribe("session.prelogin", (event, src, data) => {
            this.isLogin = true;
        });

        ComponentManager.subscribe("session.logout", (event) => {
            this.isLogin = false;
        });
        this.doLoginProcess(element);
    }

    onReload(element: HTMLElement, attachments: {authenticated: boolean}) {
        this.isLogin = attachments.authenticated;
        this.doLoginProcess(element);
    }

    private doLoginProcess(element) {
        if (Router.route() === "/login") {
            const product = utility.getParameterByName("product");
            ComponentManager.broadcast("direct.login", {srcElement: element, productCode: product});
        }
    }
}
