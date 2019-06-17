import * as utility from "@core/assets/js/components/utility";
import * as Handlebars from "handlebars/runtime";

import * as xhr from "@core/assets/js/vendor/reqwest";

import * as downloadTemplate from "./handlebars/download.handlebars";
import { Router } from "@core/src/Plugins/ComponentWidget/asset/router";

import EqualHeight from "@app/assets/script/components/equal-height";
import {ComponentManager, ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import Accordion from "@app/assets/script/components/accordion";

/**
 *
 */
export class DownloadComponent implements ComponentInterface {
    private element: HTMLElement;
    private downloadData: any;
    onLoad(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.equalizeDownloadHeight();
        this.accordion(element);
        this.getDownloads();
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.equalizeDownloadHeight();
        this.accordion(element);
        this.getDownloads();
    }

    private equalizeDownloadHeight() {
        const equalDownload = new EqualHeight(".download-box");
        equalDownload.init();
    }

    private accordion(element) {
        const accordion = new Accordion(element);
    }

    private getDownloads() {
        const download = ComponentManager.getAttribute("downloads");

        xhr({
            url: Router.generateRoute("home_download", "downloads"),
            type: "json",
            data: {
                download,
            },
        }).then((response) => {
            console.log(response);
            this.downloadData = response;
            this.generateDownloadMarkup(this.downloadData);
        });
    }

    /**
     * Set the download in the template
     *
     */
    private generateDownloadMarkup(data) {
        const download: HTMLElement = this.element.querySelector("#downloads");

        const template = downloadTemplate({
            downloadData: data,
        });

        download.innerHTML = template;
    }

}
