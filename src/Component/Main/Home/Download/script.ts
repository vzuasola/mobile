import * as utility from "@core/assets/js/components/utility";

import EqualHeight from "@app/assets/script/components/equal-height";
import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";

/**
 *
 */
export class DownloadComponent implements ComponentInterface {
    onLoad(element: HTMLElement, attachments: {}) {
        this.downloadsVisibility(element);
        this.equalizeDownloadHeight();
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.downloadsVisibility(element);
        this.equalizeDownloadHeight();
    }

    private downloadsVisibility(element) {
        const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);

        if (ios) {
            utility.addClass(element.querySelector(".app-download"), "hidden");
        }
    }

    private equalizeDownloadHeight() {
        const equalDownload = new EqualHeight(".download-box");
        equalDownload.init();
    }
}
