import * as utility from '@core/assets/js/components/utility';
import {ComponentManager, ComponentInterface} from '@plugins/ComponentWidget/asset/component';
import Storage from '@core/assets/js/components/utils/storage';

export class AnnouncementBarComponent implements ComponentInterface {
	private storage: Storage;    

	constructor() {
		this.storage = new Storage();
	}

    onLoad(element: HTMLElement, attachments: {}) {
    	this.activateAnnouncementBar(element);
    	this.bindDismissButton(element);
    }

    onReload(element: HTMLElement, attachments: {}) {
    	console.log('test');
    	this.activateAnnouncementBar(element);
    	this.bindDismissButton(element);
    }

    /**
     * Show announcement bar     
     */
    private activateAnnouncementBar(element) {
    	let readItems = new Array();
    	let activeItem = element.querySelector('.announcement-list');
        if (activeItem != null) {
            readItems = this.getReadItems();
            activeItem = activeItem.getAttribute('data');
            if (readItems.length > 0 && readItems.indexOf(activeItem) >-1) {
                element.querySelector('.mount-announcement').style.display = 'none';
            }
        }
    }

    /**
     * Mark announcement as read     
     */
    private bindDismissButton(element) {    	
    	utility.delegate(document, '.btn-dismiss', 'click', (event, src) => {
            event.preventDefault();
    		
	    	let activeItem = element.querySelector('.announcement-list').getAttribute('data');

	    	this.setReadItems(activeItem);
	    	ComponentManager.refreshComponent('announcement_bar', (response) => {
				
            });
        }, true);
    	

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
