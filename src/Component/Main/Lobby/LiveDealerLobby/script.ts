
import {ComponentManager, ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import {Router, RouterClass} from "@core/src/Plugins/ComponentWidget/asset/router";

/**
 *
 */
export class LiveDealerLobbyComponent implements ComponentInterface {

    onLoad(element: HTMLElement, attachments: {
            authenticated: boolean,
            product: any[],
        }) {
        // Do nothing
    }

    onReload(element: HTMLElement, attachments: {
            authenticated: boolean,
            product: any[],
        }) {
        // Do nothing
    }
}
