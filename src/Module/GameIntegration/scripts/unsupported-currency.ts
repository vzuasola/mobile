
import * as xhr from "@core/assets/js/vendor/reqwest";
import * as uclTemplate from "../handlebars/unsupported.handlebars";

import {Modal} from "@app/assets/script/components/modal";
import {Router} from "@plugins/ComponentWidget/asset/router";

export class UnsupportedCurrency {

    showUnsupportedCurrency(moduleName, data) {
        xhr({
            url: Router.generateModuleRoute(moduleName, "unsupported"),
            type: "json",
            method: "get",
        }).then((response) => {
            if (response.status) {
                let body = response.message;
                const provider = (data.hasOwnProperty("subprovider") && data.subprovider)
                    ? data.subprovider : response.provider;
                body = body.replace("{game_name}", data.title);
                body = body.replace("{game_provider}", provider);
                const template = uclTemplate({
                    title: response.title,
                    message: body,
                    button: response.button,
                });

                const categoriesEl = document.querySelector("#unsupported-lightbox");

                if (categoriesEl) {
                    categoriesEl.innerHTML = template;
                    Modal.open("#unsupported-lightbox");
                }
            }
        }).fail((error, message) => {
            // Do nothing
        });
    }
}
