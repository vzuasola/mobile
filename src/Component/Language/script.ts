import * as utility from "@core/assets/js/components/utility";

import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";

import {Modal} from "@app/assets/script/components/modal";

/**
 *
 */
export class LanguageComponent implements ComponentInterface {
    private modal: Modal;

    constructor() {
        this.modal = new Modal({
            closeOverlayClick: false,
            escapeClose: false,
            id : "language-lightbox",
        });
    }

    onLoad(element: HTMLElement, attachments: {}) {
        this.modal.open();
    }

    onReload(element: HTMLElement, attachments: {}) {
        //
    }
}
