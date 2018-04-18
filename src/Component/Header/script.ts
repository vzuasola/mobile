import * as utility from '@core/assets/js/components/utility';
import * as xhr from '@core/assets/js/vendor/reqwest';

import {ComponentManager, ComponentInterface} from '@plugins/ComponentWidget/asset/component';
import {Router} from '@plugins/ComponentWidget/asset/router';

/**
 *
 */
export class HeaderComponent implements ComponentInterface {
    onLoad(element: HTMLElement, attachments: {}) {
        // this.bindLogin(element);
        // this.bindLogout(element);
    }

    onReload(element: HTMLElement, attachments: {}) {
        // this.bindLogin(element);
        // this.bindLogout(element);
    }

    /**
     *
     */
    private bindLogin(element: HTMLElement) {
        utility.delegate(element, 'button.login', 'click', (event: Event, src: HTMLElement) => {
            event.preventDefault();

            let input: any = element.querySelector('input[name="username"]');

            xhr({
                url: Router.generateRoute('header', 'submit'),
                type: 'json',
                method: 'post',
                data: {
                    'username': input.value,
                }
            }).then(response => {
                if (response['status']) {
                    ComponentManager.refreshComponent('header');
                    ComponentManager.refreshComponent('footer');
                }
            }).fail((error, message) => {

            });
        });
    }

    /**
     *
     */
    private bindLogout(element: HTMLElement) {
        utility.delegate(element, 'button.logout', 'click', (event: Event, src: HTMLElement) => {
            event.preventDefault();

            let input: any = element.querySelector('input[name="username"]');

            xhr({
                url: Router.generateRoute('header', 'logout'),
                type: 'json',
            }).then(response => {
                if (response['status']) {
                    ComponentManager.refreshComponent('header');
                    ComponentManager.refreshComponent('footer');
                }
            }).fail((error, message) => {

            });
        });
    }
}
