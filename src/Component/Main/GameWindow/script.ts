import * as utility from "@core/assets/js/components/utility";

import {ComponentManager, ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@core/src/Plugins/ComponentWidget/asset/router";

import {Loader} from "@app/assets/script/components/loader";

/**
 *
 */
export class GameWindowComponent implements ComponentInterface {
    private loader: Loader;
    private isLogin: boolean = false;
    private productAlias: any;
    private productDirectIntegration: any = [];

    constructor() {
        this.loader = new Loader(document.body, true);
    }

    onLoad(
        element: HTMLElement,
        attachments: {
            authenticated: boolean,
            product_alias: any,
            product_direct_integration: any,
        },
    ) {
        this.attachScript();
    }

    onReload(
        element: HTMLElement,
        attachments: {
            authenticated: boolean,
            product_alias: any,
            product_direct_integration: any,
        },
    ) {
        this.attachScript();
    }

    private attachScript() {
        const script = document.createElement("script");
        script.src = "https://jscdn.lttlapp.com/sdk/sdk.v1.js";
        document.body.appendChild(script);
    }
}
