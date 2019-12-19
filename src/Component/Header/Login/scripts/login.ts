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

import * as logoTemplate from "../handlebars/logo.handlebars";

export class Login {
    private loader: Loader;
    private sync: SyncEvents;
    private productCheckPreference: any = ["mobile-casino", "mobile-casino-gold"];
    private products: any = [];

    private isLogin: boolean;
    private element: HTMLElement;

    // stores the array of promises callbacks
    private loginEvents = [];

    private productVia: any = false;
    private srcElement: HTMLElement;
    private action: any = false;
    private logoData: any;
    private loginStyle: any;

    constructor() {
        this.loader = new Loader(document.body, true);
        this.sync = new SyncEvents();

        this.listenLoginEvents();
    }

    handleOnLoad(element: HTMLElement, attachments: {authenticated: boolean}) {
        this.element = element;
        this.isLogin = attachments.authenticated;

        this.listenLogin();
        this.listenLogout();

        this.activateLogin(element);
        this.bindLoginForm(element, attachments);
        this.updateLoginLayout();
    }

    handleOnReload(element: HTMLElement, attachments: {authenticated: boolean}) {
        this.element = element;

        this.activateLogin(element);
        this.bindLoginForm(element, attachments);
        this.updateLoginLayout();
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
                        let fromGameLaunch = "false";
                        if (form) {
                            fromGameLaunch = form.getAttribute("data-from-game-launch");
                        }
                        this.doGetCasinoPreference(username, fromGameLaunch, resolve);
                    });
                });

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
     * Get preferred casino of user.
     */
    private doGetCasinoPreference(username, fromGameLaunch, resolve) {
        if (this.productCheckPreference.includes(ComponentManager.getAttribute("product"))
            && fromGameLaunch !== "true") {
            xhr({
                url: Router.generateRoute("casino_option", "preferredProduct"),
                method: "post",
                data: {
                    username,
                },
                type: "json",
            }).then((response) => {
                if (response.preferredProduct) {
                    this.productVia = "mobile-casino";
                    if (response.preferredProduct === "casino_gold") {
                        this.productVia = "mobile-casino-gold";
                    }
                }
                resolve();
            }).fail((error, message) => {
                resolve();
            });
        } else {
            resolve();
        }
        return;
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
                        ["header", "menu", "main", "announcement", "push_notification", "marketing_space"],
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
                const product = ComponentManager.getAttribute("product");
                const loginModal = this.element.querySelector("#login-lightbox");

                if (element) {
                    utility.addClass(loginModal, product + "-modal");
                    event.preventDefault();
                    if (element.getAttribute("data-product-login-via")
                        && element.getAttribute("data-product-reg-via")) {
                        ComponentManager.broadcast("header.login", {
                            src: element,
                            productVia: element.getAttribute("data-product-login-via"),
                            regVia: element.getAttribute("data-product-reg-via"),
                            loginStyle: product,
                        });
                    } else {
                        ComponentManager.broadcast("header.login", {
                            src: element,
                            loginStyle: product,
                        });
                    }
                } else {
                    const modal = this.element.querySelector("#login-lightbox");
                    const closeElement = utility.hasClass(modal, "modal-active", true);
                    const gameLaunch = utility.hasClass(src, "game-list", true);

                    if (gameLaunch) {
                        utility.addClass(loginModal, product + "-modal");
                    }
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

            if (data && typeof data.fromGameLaunch !== "undefined") {
                if (form) {
                    form.setAttribute("data-from-game-launch", data.fromGameLaunch);
                }
            }

            if (data && typeof data.regVia !== "undefined" && data.regVia) {
                if (btnJoin) {
                    btnJoin.setAttribute("href", data.regVia);
                    btnJoin.setAttribute("data-join-url", data.regVia);
                }
            }

            if (data && typeof data.action !== "undefined") {
                this.action = data.action;
            }
            /*productStyle = "mobile-soda-casino";*/
            if (!this.isLogin) {
                Modal.open("#login-lightbox");
                this.getLogo(data.loginStyle);
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
                    ["header", "menu", "main", "announcement", "push_notification", "marketing_space"],
                    () => {
                        this.loader.hide();
                        ComponentManager.broadcast("session.logout.finished");
                    },
                );
            });
        });
    }
    /**
     * Set logo
     *
     */
    private generateLogoMarkup(data) {
        const logo: HTMLElement = this.element.querySelector("#login-logo");
        const template = logoTemplate({
            logoData: data,
        });
        logo.innerHTML = template;
    }

    private getLogo(loginStyle) {
        this.loginStyle = "mobile-entrypage";
        let currentProduct = ComponentManager.getAttribute("product");
        if (loginStyle && typeof loginStyle !== "undefined") {
            this.loginStyle = loginStyle;
            const loginModal = this.element.querySelector("#login-lightbox");
            utility.removeClass(loginModal, currentProduct + "-modal");
            if (this.loginStyle === "mobile-soda-casino") {
                currentProduct = this.loginStyle;
                utility.addClass(loginModal, currentProduct + "-modal");
            }
        }
        this.setIcon(this.loginStyle);

        xhr({
            url: Router.generateRoute("header", "getlogo"),
            type: "json",
            data: {
                product: currentProduct,
                language: ComponentManager.getAttribute("language"),
                style: loginStyle,
                route: ComponentManager.getAttribute("route"),
            },
        }).then((response) => {
            this.logoData = response;
            this.generateLogoMarkup(this.logoData);
        });
    }

     private setIcon(iconStyle: string) {
        const userIcon = this.element.querySelector("#user-login-svg");
        const passwordIcon = this.element.querySelector("#user-password-svg");
        const passwordMaskIcon = this.element.querySelector("#password-mask-svg");
        const passwordunMaskIcon = this.element.querySelector("#password-unmask-svg");
        const passwordStyle = this.element.querySelector("#login-field-password");
        passwordMaskIcon.setAttribute("xlink:href", "#password-mask");
        passwordunMaskIcon.setAttribute("xlink:href", "#password-unmask");
        utility.removeClass(passwordStyle, "login-field-password");
        if (iconStyle && typeof iconStyle !== "undefined" && iconStyle === "mobile-soda-casino" ) {
            userIcon.setAttribute("xlink:href", "#user-login-soda");
            passwordIcon.setAttribute("xlink:href", "#user-password-soda");
            passwordMaskIcon.setAttribute("xlink:href", "#password-mask-soda");
            passwordunMaskIcon.setAttribute("xlink:href", "#password-unmask-soda");
            utility.addClass(passwordStyle, "login-field-password");
        }
    }

    private updateLoginLayout() {
        ComponentManager.subscribe("login.update.layout.component", (event, src, data) => {
            const loginModal: HTMLElement = this.element.querySelector("#login-lightbox");
            setTimeout(() => {
              utility.removeClass(loginModal, "mobile-soda-casino-modal");
            }, 300);
        });
    }
}
