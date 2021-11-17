import * as utility from "@core/assets/js/components/utility";
import * as Handlebars from "handlebars/runtime";

import * as xhr from "@core/assets/js/vendor/reqwest";

import * as downloadTemplate from "./handlebars/download.handlebars";
import * as downloadlightboxTemplate from "./handlebars/downloadLightbox.handlebars";
import {Router} from "@core/src/Plugins/ComponentWidget/asset/router";

import {Modal} from "@app/assets/script/components/modal";
import EqualHeight from "@app/assets/script/components/equal-height";
import {ComponentManager, ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import Accordion from "@app/assets/script/components/accordion";

/**
 *
 */
export class DownloadComponent implements ComponentInterface {
    private element: HTMLElement;
    private downloadData: any;
    private timer;
    onLoad(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.filterDownloads();
        this.equalizeDownloadHeight();
        this.accordion(this.element);
        this.swapText();
        this.bindDownloadLightbox();
        this.downloadLaunch(element);
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.filterDownloads();
        this.equalizeDownloadHeight();
        this.accordion(this.element);
        this.swapText();
        this.bindDownloadLightbox();
        this.downloadLaunch(element);
    }

    private downloadsVisibility() {
        return [
            "iPad Simulator",
            "iPhone Simulator",
            "iPod Simulator",
            "iPad",
            "iPhone",
            "iPod",
        ].indexOf(navigator.platform) !== -1
        // iPad on iOS 13 detection
        || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
    }

    private equalizeDownloadHeight() {
        const equalDownload = new EqualHeight(".download-box");
        equalDownload.init();
    }

    private equalizeDownloadButton() {
        const equalDownload = new EqualHeight(".download-box-btn");
        equalDownload.init();
    }

    private accordion(element) {
        const accordion = new Accordion(element, { openByDefault: 0});
    }

    private filterDownloads() {
        const isIOS = this.downloadsVisibility();
        const appDownload = this.element.querySelector(".app-download");
        const downloadAccordion = this.element.querySelector(".download-accordion");
        const dlContainer: HTMLElement = this.element.querySelector("#downloads");
        const downloadItems = this.element.querySelectorAll(".app-download-list a");
        if (typeof downloadItems !== "undefined") {
            for (const key in downloadItems) {
                if (downloadItems.hasOwnProperty(key)) {
                    const parentEl = utility.findParent(downloadItems[key], "li");
                    if ((!isIOS && utility.hasClass(downloadItems[key], "ios")) ||
                    (isIOS && utility.hasClass(downloadItems[key], "android"))) {
                        parentEl.remove();
                    }

                    if (utility.hasClass(downloadItems[key], "android")) {
                        utility.addClass(this.element.querySelector("#download-lightbox"), "android-device");
                    }
                }
            }

            this.rearrange();
            this.applyMenuStyle(".app-download .app-download-list");
            this.applyMenuStyle(".download-accordion .app-download-list");

            if (downloadAccordion
                && !this.element.querySelectorAll(".app-download-accordion .app-download-list").length) {
                downloadAccordion.remove();
            }

            if (this.element.querySelectorAll(".app-download-list a").length) {
                utility.addClass(dlContainer, "download-background");
            } else {
                dlContainer.remove();
            }
        }
    }

    private rearrange() {
        const downloadItems = this.element.querySelectorAll(".app-download-list");
        const appDownload = this.element.querySelector(".app-download");
        const downloadAccordion = this.element.querySelector(".app-download-accordion");

        // clear all lists first
        if (appDownload) {
            appDownload.innerHTML = "";
        }

        if (downloadAccordion) {
            downloadAccordion.innerHTML = "";
        }

        for (let i = 0; i < downloadItems.length; i++) {
            if (downloadItems.hasOwnProperty(i)) {
                console.log(i);
                if (i <= 3) {
                    appDownload.append(downloadItems[i]);
                } else {
                    downloadAccordion.append(downloadItems[i]);
                }
            }
        }
    }

    private applyMenuStyle(menuList) {
        const downloadItems = this.element.querySelectorAll(menuList);
        const menuClass = [];
        menuClass[1] = "app-download-full-width";
        menuClass[2] = "app-download-col-2";
        menuClass[3] = "app-download-col-3";
        menuClass[4] = "col-3";
        const newItem: any = [];

        for (let i = 0; i < downloadItems.length; i++) {
            if (downloadItems.hasOwnProperty(i)) {
                const itemClass = (typeof menuClass[downloadItems.length] !== "undefined")
                    ? menuClass[downloadItems.length] : "col-3";
                utility.addClass(downloadItems[i], itemClass);
                if (i === 3) {
                    utility.addClass(downloadItems[i], "push");
                }
            }
        }
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

    private bindDownloadLightbox() {
        ComponentManager.subscribe("click", (event, src) => {
            if (src && utility.hasClass(src, "download-trigger", true)) {
                event.preventDefault();
                Modal.open("#download-lightbox");
                this.equalizeDownloadHeight();
                this.equalizeDownloadButton();
            }
        });
    }

    private downloadLaunch(element) {
        utility.delegate(element, ".btn-launch", "click", (event, src) => {
            setTimeout(() => {
                event.preventDefault();
                utility.removeClass(this.element.querySelector(".full-width"), "hidden");
                utility.addClass(this.element.querySelector(".half-width"), "hidden");
            }, 200);

            this.timer = setTimeout(() => {
                Modal.close("#download-lightbox");
                utility.removeClass(this.element.querySelector(".half-width"), "hidden");
                utility.addClass(this.element.querySelector(".full-width"), "hidden");
            }, 50000);
        }, true);

        utility.listen(element, "click", (event, src) => {
            if (utility.hasClass(src, "modal-overlay") || utility.hasClass(src, "modal-close")) {
                if (this.timer !== null) {
                    clearTimeout(this.timer);
                }
                setTimeout(() => {
                    utility.removeClass(this.element.querySelector(".half-width"), "hidden");
                    utility.addClass(this.element.querySelector(".full-width"), "hidden");
                }, 200);
            }
        });
    }
}
