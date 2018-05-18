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
    private isLogin: boolean;

    private srcElement: HTMLElement;
    private action: any = false;

    constructor() {
        this.loader = new Loader(document.body, true);
    }

    handleOnLoad(element: HTMLElement, attachments: {authenticated: boolean}) {
        this.isLogin = attachments.authenticated;

        ComponentManager.subscribe("session.login", (event, src) => {
            this.isLogin = true;
        });

        this.listenLogin(attachments);
        this.listenLogout(attachments);

        this.activateLogin(element);
        this.bindLoginForm(element, attachments);
    }

    handleOnReload(element: HTMLElement, attachments: {authenticated: boolean}) {
        this.activateLogin(element);
        this.bindLoginForm(element, attachments);
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
                const product = false;

                xhr({
                    url: Router.generateRoute("header_login", "authenticate"),
                    type: "json",
                    method: "post",
                    data: {
                        username,
                        password,
                        product,
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

                    ComponentManager.broadcast("session.prelogin", {
                        src: this.srcElement,
                        username,
                        password,
                    });

                    // the action property defines what to do when a login process
                    // invoked, this is used if you want to override the after login
                    // step
                    if (this.action) {
                        const handler = this.action;

                        handler(this.srcElement, username, password);

                        ComponentManager.broadcast("session.login", {
                            src: this.srcElement,
                            username,
                            password,
                        });
                    } else {
                        this.loader.show();

                        ComponentManager.refreshComponents(
                            ["header", "main", "announcement", "push_notification"],
                            () => {
                                ComponentManager.broadcast("session.login", {
                                    src: this.srcElement,
                                    username,
                                    password,
                                });

                                this.loader.hide();
                            },
                        );
                    }

                }).fail((error) => {
                    ComponentManager.broadcast("session.failed", {error, form});
                });
            }
        });
    }

    /**
     * Listeners
     *
     */

    /**
     * Listen for login events
     */
    private listenLogin(attachments: {authenticated: boolean}) {
        ComponentManager.subscribe("header.login", (event, src, data: any) => {
            this.srcElement = null;
            this.action = false;

            if (typeof data.src !== "undefined") {
                this.srcElement = data.src;
            }

            if (typeof data.action !== "undefined") {
                this.action = data.action;
            }

            Modal.open("#login-lightbox");
        });

        ComponentManager.subscribe("click", (event, src) => {
            if (!this.isLogin) {
                const element = utility.hasClass(src, "login-trigger", true);

                if (element) {
                    event.preventDefault();

                    ComponentManager.broadcast("header.login", {
                        src: element,
                    });
                }
            }
        });
    }

    /**
     * Listen for logout events
     */
    private listenLogout(attachments) {
        ComponentManager.subscribe("click", (event, src) => {
            if (this.isLogin) {
                const element = utility.hasClass(src, "btn-logout", true);

                if (element) {
                    event.preventDefault();

                    ComponentManager.broadcast("session.logout", {
                        src: element,
                    });
                }
            }
        });

        ComponentManager.subscribe("session.logout", (event) => {
            this.isLogin = false;
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
