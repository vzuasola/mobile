import * as utility from "@core/assets/js/components/utility";

import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import {Loader} from "@app/assets/script/components/loader";

/**
 *
 */
export class AccessDeniedComponent implements ComponentInterface {
    private loader: Loader;

    constructor() {
        this.loader = new Loader(document.body, true);
    }

    onLoad(element: HTMLElement, attachments: {}) {
        //
    }

    onReload(element: HTMLElement, attachments: {url: string}) {
        this.loader.show();
        window.location.replace(attachments.url);
    }
}
