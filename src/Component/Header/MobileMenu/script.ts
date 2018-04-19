import {ComponentInterface} from '@plugins/ComponentWidget/asset/component';

import mobileMenu from '@app/assets/script/components/mobile-menu';

/**
 *
 */
export class MobileMenuComponent implements ComponentInterface {
    onLoad(element: HTMLElement, attachments: {}) {
        mobileMenu(element);
    }

    onReload(element: HTMLElement, attachments: {}) {
    }
}
