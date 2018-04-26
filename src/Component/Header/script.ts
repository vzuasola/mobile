import * as utility from '@core/assets/js/components/utility';
import * as xhr from '@core/assets/js/vendor/reqwest';

import {ComponentManager, ComponentInterface} from '@plugins/ComponentWidget/asset/component';
import {Router} from '@plugins/ComponentWidget/asset/router';

import {Loader} from '@app/assets/script/components/loader';
import {CheckboxStyler} from '@app/assets/script/components/checkbox-styler';
import {Modal} from '@app/assets/script/components/modal';

/**
 *
 */
export class HeaderComponent implements ComponentInterface {
    private modal: Modal;
    private loader: Loader;

    constructor() {
        this.modal = new Modal();
        this.loader = new Loader(document.body, true);
    }

    onLoad(element: HTMLElement, attachments: {}) {
        this.activateLogin(element);
        this.bindLoginForm(element);
        this.bindLogout(attachments);
    }

    onReload(element: HTMLElement, attachments: {}) {        
        this.activateLogin(element);
        this.bindLoginForm(element);
        this.bindLogout(attachments);
    }

    /**
     * Activates the login modal
     */
    private activateLogin(element) {
        let rememberUsername: HTMLElement = element.querySelector('.login-remember-username input');

        if (rememberUsername) {
            let checkbox = new CheckboxStyler(rememberUsername);
            checkbox.init();
        }
    }

    /**
     * Binds the login form to send data to the login handler
     */
    private bindLoginForm(element) {
        let form: HTMLElement = element.querySelector('.login-form');

        utility.listen(form, 'submit', (event, src) => {
            event.preventDefault();

            let username: string = src.querySelector('[name="username"]').value;
            let password: string = src.querySelector('[name="password"]').value;

            xhr({
                  url: Router.generateRoute('header', 'authenticate'),
                  type: 'json',
                  method: 'post',
                  data: {
                      username: username,
                      password: password,
                  }
            }).then(response => {
                this.modal.close();
                this.loader.show();

                ComponentManager.refreshComponent('header', () => {
                  this.loader.hide();
                });
                ComponentManager.refreshComponent('main', () => {
                  this.loader.hide();
                });
            });
        });
    }

    /**
     * Binds any logout click event to logout the site
     */
    private bindLogout(attachments) {
        if (attachments.authenticated) {
            utility.delegate(document, '.btn-logout', 'click', (event, src) => {
                event.preventDefault();

                this.loader.show();

                xhr({
                    url: Router.generateRoute('header', 'logout'),
                    type: 'json',
                    method: 'get',
                }).always(() => {
                    ComponentManager.refreshComponent('header', () => {
                        this.loader.hide();
                    });
                    ComponentManager.refreshComponent('main', () => {
                        this.loader.hide();
                    });
                });
            }, true);
        }
    }
}
