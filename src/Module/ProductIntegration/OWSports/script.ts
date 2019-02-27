import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

import {Redirectable} from "../scripts/redirectable";

export class OWSportsIntegrationModule extends Redirectable implements ModuleInterface {
    protected code = "sports";
    protected module = "owsports_integration";
    protected isLoginOnly = false;
}
