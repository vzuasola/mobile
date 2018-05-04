import * as utility from "@core/assets/js/components/utility";

import {Modal} from "@app/assets/script/components/modal";

import Storage from "@core/assets/js/components/utils/storage";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";

export class AnnouncementComponent implements ComponentInterface {
    private storage: Storage;
    private refreshInterval: number = 300000;

    constructor() {
        this.storage = new Storage();
    }

    onLoad(element: HTMLElement, attachments: {}) {
        this.activateAnnouncementBar(element);
        this.bindDismissButton(element);

        // lightbox
        this.bindAnnouncementLightbox();
        this.getUnread(element);
        this.markAllRead(element);
        this.autoRefreshCounter(element);
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.activateAnnouncementBar(element);
        this.bindDismissButton(element);

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
    private autoRefreshCounter(element) {
        setInterval(() => {
            if (!utility.hasClass(element.querySelector("#announcement-lightbox"), "modal-active")) {
                ComponentManager.refreshComponent("announcement");
            }
        }, this.refreshInterval);
    }

    private markAllRead(element) {
        utility.listen(document.body, "click", (event, src) => {
            const modalEl: HTMLElement = element.querySelector("#announcement-lightbox");

            const modalOverlay: HTMLElement = modalEl.querySelector(".modal-overlay");
            const negativeClass: HTMLElement = modalEl.querySelector(".modal-close");

            if (negativeClass === src ||  modalOverlay === src ||
                utility.hasClass(src, negativeClass) || utility.hasClass(src, "modal-close")
            ) {
                for (const item of element.querySelectorAll(".announcement-item")) {
                    const activeItem = item.getAttribute("data");
                    this.setReadItems(activeItem);
                }
                ComponentManager.refreshComponent("announcement");
            }
        });
    }

    private bindAnnouncementLightbox() {
        utility.listen(document, "click", (event, src) => {
            if (!utility.hasClass(src, "announcement-trigger")) {
                src = utility.findParent(src, ".announcement-trigger");
            }
            if (utility.hasClass(src, "announcement-trigger")) {
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

            if (readItems.indexOf(activeItem)  < 0) {
                counter++;
            }
        }

        utility.invoke(document, "announcement.update.count", {count: counter});
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
