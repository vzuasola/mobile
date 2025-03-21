import * as utility from "@core/assets/js/components/utility";
import Storage from "@core/assets/js/components/utils/storage";

import * as xhr from "@core/assets/js/vendor/reqwest";

import * as announcementTemplate from "./handlebars/announcement.handlebars";

import {Modal} from "@app/assets/script/components/modal";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";

export class AnnouncementComponent implements ComponentInterface {
    private storage: Storage;
    private refreshInterval: number = 300000;
    private element: HTMLElement;
    private announcements: any;
    private timer: any;
    private showAnnouncementBar: boolean;
    private language: string;

    constructor() {
        this.storage = new Storage();
    }

    onLoad(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.showAnnouncementBar = true;
        this.language = ComponentManager.getAttribute("language");
        this.getAnnouncements();
        this.listenModalClose();
        this.listenAnnouncementLightbox();

        Router.on(RouterClass.afterNavigate, (event) => {
            if (this.language !== ComponentManager.getAttribute("language")) {
                this.showAnnouncementBar = true;
                this.language = ComponentManager.getAttribute("language");
            } else {
                this.showAnnouncementBar = false;
                this.getAnnouncements();
            }
        });
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.getAnnouncements();
    }

    private getAnnouncements() {
        xhr({
            url: Router.generateRoute("announcement", "announcements"),
            type: "json",
        }).then((response) => {
            this.generateAnnouncementMarkup(response);
        });
    }

    private generateAnnouncementMarkup(data) {
        const announcement: HTMLElement = this.element.querySelector("#announcements-container");
        const template = announcementTemplate({
            announcementData: data,
        });

        announcement.innerHTML = template;
        this.activateAnnouncementBar(this.element);
        this.bindDismissButton(this.element);

        // lightbox
        this.listenAutoRefresh(this.element);
        this.getUnread(this.element);
    }

    /**
     * Show announcement bar
     */
    private activateAnnouncementBar(element) {
        let readItems = [];
        let activeItem: any = element.querySelector(".announcement-list");
        if (activeItem) {
            this.showAnnouncementBar = false;
            readItems = this.getReadItems();
            activeItem = activeItem.getAttribute("data");
            if (readItems.length > 0 && readItems.indexOf(activeItem) > -1) {
                utility.addClass(element.querySelector(".mount-announcement"), "hidden");
            } else {
                utility.removeClass(element.querySelector(".mount-announcement"), "hidden");
            }
            this.readAnnounceBarItem();
        }
    }

    /**
     * Mark announcement as read
     */
    private bindDismissButton(element) {
        utility.delegate(element, ".btn-dismiss", "click", (event, src) => {
            event.preventDefault();
            this.showAnnouncementBar = false;
            this.readAnnounceBarItem();
            utility.addClass(this.element.querySelector(".mount-announcement"), "hidden");
            this.getUnread(this.element);
        }, true);
    }

    private readAnnounceBarItem() {
        const activeItem = this.element.querySelector(".announcement-list");
        if (activeItem && !this.showAnnouncementBar) {
            const activeItemID = activeItem.getAttribute("data");
            this.setReadItems(activeItemID);
        }
    }

    /**
     * Refresh announcements on background
     */
    private listenAutoRefresh(element) {

        if (this.timer !== null) {
            clearInterval(this.timer);
        }

        this.timer = setInterval(() => {
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
