import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import {Redirectable} from "../scripts/redirectable";

export class ALSIntegrationModule extends Redirectable implements ModuleInterface {
    protected code = "als";
    protected module = "als_integration";
}
