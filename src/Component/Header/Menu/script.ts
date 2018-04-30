import {ComponentInterface} from '@plugins/ComponentWidget/asset/component';
import * as utility from '@core/assets/js/components/utility';

import menu from './scripts/menu';

/**
 *
 */
export class MenuComponent implements ComponentInterface {
    onLoad(element: HTMLElement, attachments: {}) {
        menu(element);
        this.updateAnnouncementCount(element);
    }

    onReload(element: HTMLElement, attachments: {}) {
        menu(element);
        this.updateAnnouncementCount(element);
    }

    private updateAnnouncementCount(element) {
		utility.listen(document, 'announcement.update.count', event => {			
			element.querySelector('#announcement-count').innerHTML = event.customData.count;
			if (event.customData.count > 0) {
				utility.removeClass(element.querySelector('#announcement-count'), "hidden");
			} else {
				utility.addClass(element.querySelector('#announcement-count'), "hidden");
			}
		});
	}
}
