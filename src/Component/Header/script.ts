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
    private loader: Loader;
    private session: Session;

    constructor() {
        this.loader = new Loader(document.body, true);
    }

    onLoad(element: HTMLElement, attachments: {authenticated: boolean}) {
        this.activateLogin(element);
        this.bindLoginForm(element);
        this.bindLogout(attachments);
        this.bindSession(attachments);
        this.activatePasswordMask(element);

        this.listenLogin();
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
                Modal.close("#login-lightbox");
                this.loader.show();

                utility.invoke(document, "session.login");

                ComponentManager.refreshComponent(["header", "main", "announcement", "push_notification"],
                () => {
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

    private listenLogin() {
        utility.listen(document, "header.login", (event, src) => {
            Modal.open("#login-lightbox");
        });

        utility.listen(document, "click", (event, src) => {
            const selector = "login-trigger";

            if (!utility.hasClass(src, selector)) {
                src = utility.findParent(src, `.${selector}`, 2);
            }

            if (utility.hasClass(src, selector)) {
                utility.invoke(document, "header.login");
                event.preventDefault();
            }
        });
    }

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
                ComponentManager.refreshComponent(
                ["header", "main", "announcement", "push_notification"],
                () => {
                    this.loader.hide();
                });
            });
        });
    }
}
