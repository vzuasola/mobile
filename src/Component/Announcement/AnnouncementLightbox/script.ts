import * as utility from '@core/assets/js/components/utility';
import Storage from '@core/assets/js/components/utils/storage';

import {ComponentManager, ComponentInterface} from '@plugins/ComponentWidget/asset/component';
import {Modal} from '@app/assets/script/components/modal';

export class AnnouncementLightboxComponent implements ComponentInterface {
    private storage: Storage;
    private modal: Modal;

    constructor() {
        this.storage = new Storage();
        this.modal = new Modal();
    }

    onLoad(element: HTMLElement, attachments: {}) {
    	this.getUnread(element);
    	this.markAllRead(element);

    }

    onReload(element: HTMLElement, attachments: {}) {
        this.markAllRead(element);
    }

    private markAllRead(element) {
    	
    	utility.listen(document.body, 'click', (event, src) => {
			let modalEl:HTMLElement = document.getElementById('announcement-lightbox');
			let modalOverlay:HTMLElement = modalEl.querySelector('.modal-overlay');
			let negativeClass:HTMLElement = modalEl.querySelector('.modal-close');
	            
	        let e = event || window.event;
	        let target = e.target || e.srcElement;

			if (negativeClass === target || modalOverlay === target) {
				let counter:number = 0;
				let currentCount:number = document.getElementById('announcement-count').innerHTML;

				for(let item of element.querySelectorAll('.announcement-item')) {
					let activeItem = item.getAttribute('data');
					this.setReadItems(activeItem);
					counter++;
		        }
		        
		        ComponentManager.refreshComponent('announcement_bar');
		        ComponentManager.refreshComponent('announcement_lightbox');
	        }
        });
    }

    private getUnread(element) {
    	let readItems = [];
    	let counter:number = 0;
    	for(let item of element.querySelectorAll('.announcement-item')) {
			let activeItem = item.getAttribute('data');
			readItems = this.getReadItems();
			if (readItems.indexOf(activeItem)  < 1) {
				counter++;
			}
		}

		document.getElementById('announcement-count').innerHTML = counter;
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
        if (prevReadItems.indexOf(newItem) < 0) {
			prevReadItems.push(newItem);
			this.storage.set('ReadItems', JSON.stringify(prevReadItems));
		}
    }

}
