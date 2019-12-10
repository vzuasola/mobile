import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

export class ProductIntegrationModule implements ModuleInterface {
    onLoad(attachments: {authenticated: boolean, matrix: boolean}) {

        // Redirect to als on load if player matrix
        const url = "/" + ComponentManager.getAttribute("language") + "/sports-df";
        if (attachments.matrix && Router.route() !== "/sports-df") {
            window.location.href = url;
        }
    }
}
