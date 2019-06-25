
import * as xhr from "@core/assets/js/vendor/reqwest";
import * as messageTemplate from "../handlebars/unsupported.handlebars";

import {ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Modal} from "@app/assets/script/components/modal";
import {Router} from "@plugins/ComponentWidget/asset/router";

export class ProviderMessageLightbox {
    private message: string;

    showMessage(moduleName, method, data, callback?, modalName = "#unsupported-lightbox") {
        const product = data.hasOwnProperty("currentProduct") ? data.currentProduct
            : ComponentManager.getAttribute("product");
        const currency = data.hasOwnProperty("currency") ? data.currency : null;
        const postData: any = {
            product,
        };
        if (currency) {
            postData.currency = currency;
        }
        xhr({
            url: Router.generateModuleRoute(moduleName, method),
            type: "json",
            method: "post",
            data: postData,
        }).then((response) => {
            if (response.status) {
                this.setMessage(response, data);
                const categoriesEl = document.querySelector(modalName);

                if (categoriesEl) {
                    categoriesEl.innerHTML = this.message;
                    Modal.open(modalName);
                }
            }

            if (callback) {
                callback(response);
            }
        }).fail((error, message) => {
            // Do nothing
        });
    }

    private setMessage(response, data) {
        let body = response.message;
        const provider = (data.hasOwnProperty("subprovider") && data.subprovider)
                ? data.subprovider : response.provider;
        body = body.replace("{game_name}", data.title);
        body = body.replace("{game_provider}", provider);
        const template = messageTemplate({
            title: response.title,
            message: body,
            button: response.button,
        });

        this.message = template;
    }
}
