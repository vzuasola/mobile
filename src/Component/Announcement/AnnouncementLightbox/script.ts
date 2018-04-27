import * as utility from '@core/assets/js/components/utility';
import Storage from '@core/assets/js/components/utils/storage';

import {ComponentManager, ComponentInterface} from '@plugins/ComponentWidget/asset/component';

export class AnnouncementLightboxComponent implements ComponentInterface {
    private storage: Storage;
    private refreshInterval: number = 300000;

    constructor() {
        this.storage = new Storage();
    }

    onLoad(element: HTMLElement, attachments: {}) {
        this.getUnread(element);
        this.markAllRead(element);
        this.autoRefreshCounter(element);
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.getUnread(element);
        this.markAllRead(element);
        this.autoRefreshCounter(element);
    }

    /**
     * Refresh announcements on background
     */
    private autoRefreshCounter (element) {
        setInterval(function () {
            if (!utility.hasClass(element.querySelector('#announcement-lightbox'), 'modal-active')) {
                ComponentManager.refreshComponent('announcement_lightbox');
            }
        }, this.refreshInterval);
    };

    private markAllRead(element) {
        utility.listen(document.body, 'click', (event, src) => {
            let modalEl: HTMLElement = element.querySelector('#announcement-lightbox');

            let modalOverlay: HTMLElement = modalEl.querySelector('.modal-overlay');
            let negativeClass: HTMLElement = modalEl.querySelector('.modal-close');

            if (negativeClass === src || modalOverlay === src) {
                for (let item of element.querySelectorAll('.announcement-item')) {
                    let activeItem = item.getAttribute('data');
                    this.setReadItems(activeItem);
                }

                ComponentManager.refreshComponent('announcement_bar');
                ComponentManager.refreshComponent('announcement_lightbox');
            }
        });
    }

    /**
     * Get number of unread announcement and update announcement balloon counter
     */
    private getUnread(element) {
        let readItems = [];
        let counter = 0;

        for (let item of element.querySelectorAll('.announcement-item')) {
            let activeItem = item.getAttribute('data');

            readItems = this.getReadItems();

            if (readItems.indexOf(activeItem)  < 0) {
                counter++;
            }
        }

        // TODO please no cross component DOM manipulation
        document.getElementById('announcement-count').innerHTML = counter.toString();
    }

    /**
     * Get all Read Items
     */
    private getReadItems() {
        let data = [];

        if (this.storage.get('ReadItems')) {
            data = JSON.parse(this.storage.get('ReadItems'));
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
            this.storage.set('ReadItems', JSON.stringify(prevReadItems));
        }
    }

}
