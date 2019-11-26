import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import {Redirectable} from "../scripts/redirectable";
import { Router, RouterClass } from "@plugins/ComponentWidget/asset/router";

export class ALSIntegrationModule extends Redirectable implements ModuleInterface {
    protected code = "als";
    protected module = "als_integration";

    constructor() {
        super();
        this.init();
    }

    init() {
        ComponentManager.subscribe("session.login", (event, src, data) => {
            if (data.response.matrix) {
                window.location.href = "/sports-df";
            }
        });

    }
}
