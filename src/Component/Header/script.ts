import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

import {Session} from "./scripts/session";

import {CheckboxStyler} from "@app/assets/script/components/checkbox-styler";
import {Loader} from "@app/assets/script/components/loader";
import {Modal} from "@app/assets/script/components/modal";
import {passwordMask} from "@app/assets/script/components/password-mask";

/**
 *
 */
export class HeaderComponent implements ComponentInterface {
    private modal: Modal;
    private loader: Loader;
    private session: Session;

    constructor() {
        this.modal = new Modal();
        this.loader = new Loader(document.body, true);
    }

    onLoad(element: HTMLElement, attachments: {authenticated: boolean}) {
        this.activateLogin(element);
        this.bindLoginForm(element);
        this.bindLogout(attachments);
        this.bindSession(attachments);
        this.activatePasswordMask(element);

        this.listenLogout(attachments);
    }

    onReload(element: HTMLElement, attachments: {authenticated: boolean}) {
        this.activateLogin(element);
        this.bindLoginForm(element);
        this.bindLogout(attachments);
        this.bindSession(attachments);
        this.activatePasswordMask(element);
    }

    private activatePasswordMask(element) {
        passwordMask(element.querySelector(".login-field-password"));
    }

    /**
     * Activates the login modal
     */
    private activateLogin(element) {
        const rememberUsername: HTMLElement = element.querySelector(".login-remember-username input");

        if (rememberUsername) {
            const checkbox = new CheckboxStyler(rememberUsername);
            checkbox.init();
        }
    }

    /**
     * Binds the login form to send data to the login handler
     */
    private bindLoginForm(element) {
        const form: HTMLElement = element.querySelector(".login-form");

        utility.listen(form, "submit", (event, src) => {
            event.preventDefault();

            const username: string = src.querySelector('[name="username"]').value;
            const password: string = src.querySelector('[name="password"]').value;

            xhr({
                  url: Router.generateRoute("header", "authenticate"),
                  type: "json",
                  method: "post",
                  data: {
                      username,
                      password,
                  },
            }).then((response) => {
                this.modal.close();
                this.loader.show();

                utility.invoke(document, "session.login");

                ComponentManager.refreshComponent("announcement_bar");
                ComponentManager.refreshComponent("announcement_lightbox");
                ComponentManager.refreshComponent("header", () => {
                  this.loader.hide();
                });
                ComponentManager.refreshComponent("main", () => {
                  this.loader.hide();
                });
            });
        });
    }

    /**
     * Binds any logout click event to logout the site
     */
    private bindLogout(attachments: {authenticated: boolean}) {
        if (attachments.authenticated) {
            utility.delegate(document, ".btn-logout", "click", (event, src) => {
                utility.invoke(document, "session.logout");
            }, true);
        }
    }

    /**
     * Bind the session handler object
     */
    private bindSession(attachments: {authenticated: boolean}) {
        if (attachments.authenticated && !this.session) {
            this.session = new Session(300);
            this.session.init();
        }
    }

    /**
     * Listeners
     *
     */

    /**
     * Listen for logout events
     */
    private listenLogout(attachments) {
        utility.listen(document, "session.logout", (event) => {
            this.loader.show();

            xhr({
                url: Router.generateRoute("header", "logout"),
                type: "json",
                method: "get",
            }).always(() => {
                ComponentManager.refreshComponent("announcement_lightbox");
                ComponentManager.refreshComponent("announcement_bar");
                ComponentManager.refreshComponent("header", () => {
                    this.loader.hide();
                });
                ComponentManager.refreshComponent("main", () => {
                    this.loader.hide();
                });
            });
        });
    }
}
