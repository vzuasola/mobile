import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {Loader} from "@app/assets/script/components/loader";
import {Modal} from "@app/assets/script/components/modal";

import {CheckboxStyler} from "@app/assets/script/components/checkbox-styler";
import {PasswordMask} from "@app/assets/script/components/password-mask";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

export class Login {
    private loader: Loader;
    private srcElement: HTMLElement;

    constructor() {
        this.loader = new Loader(document.body, true);
    }

    handleOnLoad(element: HTMLElement, attachments: {authenticated: boolean}) {
        this.listenLogin(attachments);
        this.listenLogout(attachments);

        this.activateLogin(element);
        this.bindLoginForm(element, attachments);
        this.bindLogout(attachments);
    }

    handleOnReload(element: HTMLElement, attachments: {authenticated: boolean}) {
        this.activateLogin(element);
        this.bindLoginForm(element, attachments);
        this.bindLogout(attachments);
    }

    /**
     * Activates the login modal
     */
    private activateLogin(element) {
        const rememberUsername: HTMLElement = element.querySelector(".login-remember-username input");
        const username: HTMLInputElement = element.querySelector('[name="username"]');
        const remember: HTMLInputElement = element.querySelector('[name="remember"]');

        if (utility.getCookie("remember-username") && username && remember) {
            username.value = utility.getCookie("remember-username");
            remember.checked = true;
        }

        if (rememberUsername) {
            const checkbox = new CheckboxStyler(rememberUsername);
            checkbox.init();
        }

        PasswordMask(element.querySelector(".login-field-password"));
    }

    /**
     * Binds the login form to send data to the login handler
     */
    private bindLoginForm(element, attachments) {
        const form: HTMLElement = element.querySelector(".login-form");

        utility.listen(form, "submit", (event, src) => {
            event.preventDefault();

            if (src.isValid) {
                const username: string = src.querySelector('[name="username"]').value;
                const password: string = src.querySelector('[name="password"]').value;

                xhr({
                    url: Router.generateRoute("header_login", "authenticate"),
                    type: "json",
                    method: "post",
                    data: {
                        username,
                        password,
                    },
                }).then((response) => {
                    const remember = src.querySelector('[name="remember"]');

                    if (remember) {
                        const isChecked = remember.checked;

                        utility.removeCookie("remember-username");
                        if (isChecked) {
                            utility.setCookie("remember-username", username, null, "/");
                        }
                    }

                    Modal.close("#login-lightbox");
                    this.loader.show();

                    ComponentManager.broadcast("session.login", {
                        src: this.srcElement,
                    });

                    ComponentManager.refreshComponents(
                        ["header", "main", "announcement", "push_notification"],
                        () => {
                            this.loader.hide();
                        },
                    );
                }).fail((error) => {
                    ComponentManager.broadcast("session.failed", {error, form});
                });
            }
        });
    }

    /**
     * Binds any logout click event to logout the site
     */
    private bindLogout(attachments: {authenticated: boolean}) {
        if (attachments.authenticated) {
            utility.delegate(document, ".btn-logout", "click", (event, src) => {
                ComponentManager.broadcast("session.logout");
            }, true);
        }
    }

    /**
     * Listeners
     *
     */

    /**
     * Listen for login events
     */
    private listenLogin(attachments: {authenticated: boolean}) {
        ComponentManager.subscribe("header.login", (event, src) => {
            Modal.open("#login-lightbox");
        });

        if (!attachments.authenticated) {
            ComponentManager.subscribe("click", (event, src) => {
                const element = utility.hasClass(src, "login-trigger", true);

                if (element) {
                    this.srcElement = element;

                    ComponentManager.broadcast("header.login");
                    event.preventDefault();
                }
            });
        }
    }

    /**
     * Listen for logout events
     */
    private listenLogout(attachments) {
        ComponentManager.subscribe("session.logout", (event) => {
            this.loader.show();

            xhr({
                url: Router.generateRoute("header", "logout"),
                type: "json",
                method: "get",
            }).always(() => {
                ComponentManager.refreshComponents(
                    ["header", "main", "announcement", "push_notification"],
                    () => {
                        this.loader.hide();
                    },
                );
            });
        });
    }
}
