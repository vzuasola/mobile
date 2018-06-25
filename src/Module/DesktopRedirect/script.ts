import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

export class DesktopRedirectModule implements ModuleInterface {
    onLoad(attachments: {redirect: boolean}) {
        if (attachments.redirect) {
            window.location.href = utility.addQueryParam(
                window.location.href,
                "time",
                Date.now(),
            );
        }
    }
}
