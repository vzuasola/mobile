import * as Promise from "promise-polyfill";

import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import SyncEvents from "@core/assets/js/components/utils/sync-events";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

import {Loader} from "@app/assets/script/components/loader";
import {Modal} from "@app/assets/script/components/modal";

import {CheckboxStyler} from "@app/assets/script/components/checkbox-styler";
import {PasswordMask} from "@app/assets/script/components/password-mask";

export class Login {
    private loader: Loader;
    private sync: SyncEvents;

    private isLogin: boolean;
    private element: HTMLElement;

    // stores the array of promises callbacks
    private loginEvents = [];

    private productVia: any = false;
    private srcElement: HTMLElement;
    private action: any = false;

    constructor() {
        this.loader = new Loader(document.body, true);
        this.sync = new SyncEvents();
    }

    handleOnLoad(element: HTMLElement, attachments: {authenticated: boolean}) {
        this.element = element;
        this.isLogin = attachments.authenticated;

        this.listenLogin();
        this.listenLoginEvents();
        this.listenLogout();

        this.activateLogin(element);
        this.bindLoginForm(element, attachments);
    }

    handleOnReload(element: HTMLElement, attachments: {authenticated: boolean}) {
        this.element = element;

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

        utility.listen(form, "submit", (event, src: any) => {
            if (src.isValid) {
                const username: string = src.querySelector('[name="username"]').value;
                const password: string = src.querySelector('[name="password"]').value;

                event.preventDefault();

                Modal.close("#login-lightbox");
                this.loader.show();

                const events = this.loginEvents.slice(0);

                events.push(() => {
                    return new Promise((resolve, reject) => {
                        this.doLoginRequest(form, src);

                        resolve();
                    });
                });

                this.sync.executeWithArgs(events, [username, password]);
            }
        });
    }

    /**
     * Do the actual login request
     */
    private doLoginRequest(form, src) {
        const username: string = src.querySelector('[name="username"]').value;
        const password: string = src.querySelector('[name="password"]').value;
        const product = false;

        const data: any = {
            username,
            password,
        };

        if (this.productVia) {
            data.product = this.productVia;
        }

        xhr({
            url: Router.generateRoute("header_login", "authenticate"),
            type: "json",
            method: "post",
            data,
        }).then((response) => {
            if (response && response.success) {
                const remember = src.querySelector('[name="remember"]');

                if (remember) {
                    const isChecked = remember.checked;

                    utility.removeCookie("remember-username");

                    if (isChecked) {
                        utility.setCookie("remember-username", username, null, "/");
                    }
                }

                ComponentManager.broadcast("session.prelogin", {
                    src: this.srcElement,
                    username,
                    password,
                    response,
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
                        response,
                    });
                } else {
                    ComponentManager.refreshComponents(
                        ["header", "menu", "main", "announcement", "push_notification"],
                        () => {
                            ComponentManager.broadcast("session.login", {
                                src: this.srcElement,
                                username,
                                password,
                                response,
                            });

                            this.loader.hide();
                        },
                    );
                }
            }
        }).fail((error) => {
            Modal.open("#login-lightbox");

            ComponentManager.broadcast("session.failed", {error, form});

            this.loader.hide();
        });
    }

    /**
     * Listeners
     *
     */

    /**
     * Listen for events that the login form must wait before doing the
     * actual login
     */
    private listenLoginEvents() {
        // Allows you to push new loginEvents
        //
        // Available options
        //
        // event: closure => the actual encapsulated promise that will hold the event
        ComponentManager.subscribe("session.events.push", (event, src, data) => {
            if (data && typeof data.event !== "undefined") {
                this.loginEvents.push(data.event);
            }
        });
    }

    /**
     * Listen for login events
     */
    private listenLogin() {
        ComponentManager.subscribe("session.login", (event, src) => {
            this.isLogin = true;
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

        // Allows you to open the login form on demand
        //
        // You can pass custom data when you invoke the login event
        //
        // src: HTMLElement => The src element that has been clicked
        // productVia: string => The requesting product that made the request
        // regVia: string => A custom registration link for the login form
        // action: closure => A callback that will be executed after the login process
        ComponentManager.subscribe("header.login", (event, src, data: any) => {
            this.productVia = false;

            this.srcElement = null;
            this.action = false;

            // nullify join button since we are putting different reg via values
            // on it
            const form: HTMLElement = this.element.querySelector(".login-form");
            const btnJoin = this.element.querySelector(".btn-join");

            if (form) {
                form.removeAttribute("data-login-via");
            }

            if (btnJoin) {
                btnJoin.setAttribute("href", btnJoin.getAttribute("data-join-url"));
            }

            if (data && typeof data.src !== "undefined") {
                this.srcElement = data.src;
            }

            if (data && typeof data.productVia !== "undefined") {
                this.productVia = data.productVia;

                // this is not really necessary, just a flag to expose the
                // product via to show inspect element
                if (form) {
                    form.setAttribute("data-login-via", this.productVia);
                }
            }

            if (data && typeof data.regVia !== "undefined" && data.regVia) {
                if (btnJoin) {
                    btnJoin.setAttribute("href", data.regVia);
                }
            }

            if (data && typeof data.action !== "undefined") {
                this.action = data.action;
            }

            if (!this.isLogin) {
                Modal.open("#login-lightbox");
            }
        });
    }

    /**
     * Listen for logout events
     */
    private listenLogout() {
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
                url: Router.generateRoute("header_login", "logout"),
                type: "json",
                method: "get",
            }).always((response) => {
                ComponentManager.refreshComponents(
                    ["header", "menu", "main", "announcement", "push_notification"],
                    () => {
                        this.loader.hide();
                    },
                );
            });
        });
    }
}
