import * as utility from '@core/assets/js/components/utility';
import * as xhr from '@core/assets/js/vendor/reqwest';

import {ComponentManager, ComponentInterface} from '@plugins/ComponentWidget/asset/component';
import {Router} from '@plugins/ComponentWidget/asset/router';

import {CheckboxStyler} from '@app/assets/script/components/checkbox-styler';
import {modal} from '@app/assets/script/components/modal';

/**
 *
 */
export class HeaderComponent implements ComponentInterface {
    onLoad(element: HTMLElement, attachments: {}) {
        new CheckboxStyler(element.querySelector(".login-remember-username input"));
        new modal();
    }

    onReload(element: HTMLElement, attachments: {}) {
        new CheckboxStyler(element.querySelector(".login-remember-username input"));
        new modal();
    }
}
