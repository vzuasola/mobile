import * as utility from '@core/assets/js/components/utility';
import Storage from '@core/assets/js/components/utils/storage';

import {ComponentManager, ComponentInterface} from '@plugins/ComponentWidget/asset/component';

export class AnnouncementListComponent implements ComponentInterface {
    private storage: Storage;

    constructor() {
        this.storage = new Storage();
    }

    onLoad(element: HTMLElement, attachments: {}) {
      
    }

    onReload(element: HTMLElement, attachments: {}) {
        
    }

}
