import * as utility from "@core/assets/js/components/utility";
import * as Handlebars from "handlebars/runtime";

import * as xhr from "@core/assets/js/vendor/reqwest";

import * as downloadTemplate from "./handlebars/download.handlebars";
import {Router} from "@core/src/Plugins/ComponentWidget/asset/router";

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
        this.getDownloads();
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.getDownloads();
    }

    private downloadsVisibility() {
        const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);

        return ios;
    }

    private equalizeDownloadHeight() {
        const equalDownload = new EqualHeight(".download-box");
        equalDownload.init();
    }

    private accordion(element) {
        const accordion = new Accordion(element, { openByDefault: 0});
    }

    private getDownloads() {
        xhr({
            url: Router.generateRoute("home_download", "downloads"),
            type: "json",
        }).then((response) => {
            this.downloadData = response;
            this.generateDownloadMarkup(this.downloadData);
            this.equalizeDownloadHeight();
            this.accordion(this.element);
            this.swapText();
        });
    }

    /**
     * Set the download in the template
     *
     */
    private generateDownloadMarkup(data) {
        const download: HTMLElement = this.element.querySelector("#downloads");
        data = this.procesMenu(data);
        const template = downloadTemplate({
            downloadData: data,
            menuClass: data.downloads_menu.length === 4 ? "col-3"
            : ((data.downloads_menu.length === 3)
            ? "app-download-col-3 push" : data.downloads_menu.length === 2
            ? "app-download-col-2" : data.downloads_menu.length  === 1
            ? "app-download-full-width" : "col-3"),
            // Show more List
            menuClassMore: data.downloads_menu.length === 5 ? "app-download-full-width"
            : ((data.downloads_menu.length === 6)
            ? "app-download-col-2" : data.downloads_menu.length === 7
            ? "app-download-col-3 push" : data.downloads_menu.length === 8
            ? "col-3" : "col-3"),
            allApptext: data.entrypage_config.all_apps_text,
            viewLesstext: data.entrypage_config.view_less_text,
            downloadApptext: data.entrypage_config.download_app_text,
        });

        download.innerHTML = template;
    }

    private procesMenu(data) {
        const menus = [];
        const download: HTMLElement = this.element.querySelector("#downloads");
        for (const menu in data.downloads_menu) {
            if (data.downloads_menu.hasOwnProperty(menu)) {
                const downloadData = data.downloads_menu[menu];
                if (!downloadData.attributes.device) {
                    utility.addClass(download, "download-background");
                    menus.push(downloadData);
                }

                if (this.downloadsVisibility() && downloadData.attributes.device === "ios") {
                    utility.addClass(download, "download-background");
                    menus.push(downloadData);
                }

                if (!this.downloadsVisibility() && downloadData.attributes.device === "android") {
                    utility.addClass(download, "download-background");
                    menus.push(downloadData);
                }
            }
        }

        data.downloads_menu = menus;
        return data;
    }

    private swapText() {
        ComponentManager.subscribe("click", (src, target) => {
            const element = this.element.querySelectorAll("dt")[0];
            if (utility.hasClass(target, "swap-text", true)) {
                const accordion = this.element.querySelector(".download .ckeditor-wrapper");
                if (utility.hasClass(accordion, "active", true)) {
                    element.innerText = element.getAttribute("data-text-swap");
                } else {
                    element.innerText = element.getAttribute("data-text-original");
                }
            }
        });
    }
}
