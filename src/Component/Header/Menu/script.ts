import {ComponentInterface} from '@plugins/ComponentWidget/asset/component';

import menu from './scripts/menu';

/**
 *
 */
export class MenuComponent implements ComponentInterface {
    onLoad(element: HTMLElement, attachments: {}) {
        menu(element);
    }

    onReload(element: HTMLElement, attachments: {}) {
        menu(element);
    }
}
