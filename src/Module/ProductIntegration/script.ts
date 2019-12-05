import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

export class ProductIntegrationModule implements ModuleInterface {

    private attachments: any;

    onLoad(attachments: {authenticated: boolean, productMapping: any, matrix: boolean}) {
        this.attachments = attachments;
        this.playerMatrixRedirect();
        this.onLoggedInListener();
    }

    private playerMatrixRedirect() {
        if (this.attachments.matrix && Router.route() !== "/sports-df" &&
            this.attachments.productMapping[ComponentManager.getAttribute("product")]
        ) {
            const url = "/" + ComponentManager.getAttribute("language") + "/"
                + this.attachments.productMapping[ComponentManager.getAttribute("product")];

            // Redirect to als on load if player matrix
            window.location.href = url;
        }
    }

    private onLoggedInListener() {
        ComponentManager.subscribe("session.login", (event, src, data) => {
            if (data.response.matrix &&
                this.attachments.productMapping[ComponentManager.getAttribute("product")]
            ) {
                const url = "/" + ComponentManager.getAttribute("language") + "/"
                    + this.attachments.productMapping[ComponentManager.getAttribute("product")];
                window.location.href = url;
            }
        });
    }
}
