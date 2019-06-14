import * as utility from "@core/assets/js/components/utility";

import EqualHeight from "@app/assets/script/components/equal-height";
import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import Accordion from "@app/assets/script/components/accordion";

/**
 *
 */
export class DownloadComponent implements ComponentInterface {
    onLoad(element: HTMLElement, attachments: {}) {
        this.downloadsVisibility(element);
        this.equalizeDownloadHeight();
        this.accordion(element);
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.downloadsVisibility(element);
        this.equalizeDownloadHeight();
        this.accordion(element);
    }

    private downloadsVisibility(element) {
        const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);

        // device.setAttribute("data-useragent", navigator.userAgent);
        // device.setAttribute("data-platform", navigator.platform);
        // device.className += ((!!("ontouchstart" in window) || !!("onmsgesturechange" in window)) ? " touch" : "");
        // const android = /Android/.test(navigator.userAgent);

        if (ios) {
            utility.addClass(element.querySelector(".app-download-list.ios"), "hidden");
            // element.querySelector(".download").ios.remove();
        }
    }

    private equalizeDownloadHeight() {
        const equalDownload = new EqualHeight(".download-box");
        equalDownload.init();
    }

    private accordion(element) {
        const accordion = new Accordion(element);
    }
}
