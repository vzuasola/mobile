import * as utility from '@core/assets/js/components/utility';
import Storage from '@core/assets/js/components/utils/storage';

import {ComponentManager, ComponentInterface} from '@plugins/ComponentWidget/asset/component';

export class AnnouncementLightboxComponent implements ComponentInterface {
    private storage: Storage;

    constructor() {
        this.storage = new Storage();
    }

    onLoad(element: HTMLElement, attachments: {}) {
    	this.markAllRead(element);
    }

    onReload(element: HTMLElement, attachments: {}) {
        
    }

    private markAllRead(element) {
    	utility.forEach(element.querySelectorAll('.announcement-item'), function (item) {
    		activeItem = item.getAttribute('data');
    		
        });
    	
    }

     /**
     *  Get all Read Items
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
     * 
     */
    private setReadItems(newItem) {
        let prevReadItems = [];

        prevReadItems = this.getReadItems();
        prevReadItems.push(newItem);

        this.storage.set('ReadItems', JSON.stringify(prevReadItems));
    }

}
