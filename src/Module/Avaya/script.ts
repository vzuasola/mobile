import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {Avaya} from "./scripts/avaya";

import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

/**
 *
 */
export class AvayaModule implements ModuleInterface {
    onLoad(attachments: {authenticated: boolean}) {
        //
    }
}
