import * as utility from "@core/assets/js/components/utility";
import Storage from "@core/assets/js/components/utils/storage";

import {Modal} from "@app/assets/script/components/modal";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";

export class AnnouncementComponent implements ComponentInterface {
    private storage: Storage;
    private refreshInterval: number = 300000;
    private element: HTMLElement;

    constructor() {
        this.storage = new Storage();
    }

    onLoad(element: HTMLElement, attachments: {}) {
        this.element = element;

        this.activateAnnouncementBar(element);
        this.bindDismissButton(element);

        // lightbox
        this.listenAnnouncementLightbox();
        this.listenModalClose();
        this.listenAutoRefresh(element);

        this.getUnread(element);
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.element = element;

         // lightbox
        this.getUnread(element);
    }

    /**
     * Show announcement bar
     */
    private activateAnnouncementBar(element) {
        let readItems = [];
        let activeItem = element.querySelector(".announcement-list");

        if (activeItem) {
            readItems = this.getReadItems();
            activeItem = activeItem.getAttribute("data");

            if (readItems.length > 0 && readItems.indexOf(activeItem) > -1) {
                utility.addClass(element.querySelector(".mount-announcement"), "hidden");
            } else {
                utility.removeClass(element.querySelector(".mount-announcement"), "hidden");
            }
        }
    }

    /**
     * Mark announcement as read
     */
    private bindDismissButton(element) {
        let activeItem = element.querySelector(".announcement-list");

        if (activeItem) {
            utility.delegate(element, ".btn-dismiss", "click", (event, src) => {
                activeItem = activeItem.getAttribute("data");
                this.setReadItems(activeItem);
                ComponentManager.refreshComponent("announcement");
            }, true);
        }
    }

    /**
     * Refresh announcements on background
     */
    private listenAutoRefresh(element) {
        setInterval(() => {
            if (!utility.hasClass(element.querySelector("#announcement-lightbox"), "modal-active")) {
                ComponentManager.refreshComponent("announcement");
            }
        }, this.refreshInterval);
    }

    private listenModalClose() {
        ComponentManager.subscribe("modal.close", (event, src, data) => {
            if (utility.hasClass(data, "announcement")) {
                const items = this.element.querySelectorAll(".announcement-item");

                if (items) {
                    for (const key in items) {
                        if (items.hasOwnProperty(key)) {
                            const item = items[key];
                            const activeItem = item.getAttribute("data");

                            this.setReadItems(activeItem);
                        }
                    }

                    ComponentManager.refreshComponent("announcement");
                }
            }
        });
    }

    private listenAnnouncementLightbox() {
        ComponentManager.subscribe("click", (event: Event, src) => {
            if (utility.hasClass(src, "announcement-trigger", true)) {
                event.preventDefault();
                Modal.open("#announcement-lightbox");
            }
        });
    }

    /**
     * Get number of unread announcement and update announcement balloon counter
     */
    private getUnread(element) {
        let readItems = [];
        let counter = 0;

        for (const item of element.querySelectorAll(".announcement-item")) {
            const activeItem = item.getAttribute("data");

            readItems = this.getReadItems();

            if (readItems.indexOf(activeItem) < 0) {
                counter++;
            }
        }

        setTimeout (() => {
            ComponentManager.broadcast("announcement.update.count", {count: counter});
        }, 200);

    }

    /**
     * Get all Read Items
     */
    private getReadItems() {
        let data = [];

        if (this.storage.get("ReadItems")) {
            data = JSON.parse(this.storage.get("ReadItems"));
        }

        return data;
    }

    /**
     * Mark announcement as Read
     */
    private setReadItems(newItem) {
        let prevReadItems = [];

        prevReadItems = this.getReadItems();

        if (prevReadItems.indexOf(newItem) < 0) {
            prevReadItems.push(newItem);
            this.storage.set("ReadItems", JSON.stringify(prevReadItems));
        }
    }
}
