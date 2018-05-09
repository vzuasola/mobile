import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";
import * as FormValidator from "@core/assets/js/vendor/validate";

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
        this.bindLoginValidation();
        this.activateLogin(element);
        this.bindLoginForm(element);
        this.bindLogout(attachments);
        this.bindSession(attachments);
        this.activatePasswordMask(element);

        this.listenLogin();
        this.listenLogout(attachments);
        this.getBalance(element, attachments);
    }

    onReload(element: HTMLElement, attachments: {authenticated: boolean}) {
        this.bindLoginValidation();
        this.activateLogin(element);
        this.bindLoginForm(element);
        this.bindLogout(attachments);
        this.bindSession(attachments);
        this.activatePasswordMask(element);
        this.getBalance(element, attachments);
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
            if (src.isValid) {
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

                    ComponentManager.broadcast("session.login");

                    ComponentManager.refreshComponents(["header", "main", "announcement", "push_notification"],
                    () => {
                        this.loader.hide();
                    });
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
        ComponentManager.subscribe("header.login", (event, src) => {
            Modal.open("#login-lightbox");
        });

        ComponentManager.subscribe("click", (event, src) => {
            const selector = "login-trigger";

            if (utility.hasClass(src, selector, true)) {
                ComponentManager.broadcast("header.login");
                event.preventDefault();
            }
        });
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
                });
            });
        });
    }

    private getBalance(element, attachments) {
        if (attachments.authenticated) {
            xhr({
                url: Router.generateRoute("balance", "balances"),
                type: "json",
            }).then((response) => {
                const headerBalance = element.querySelector(".account-balance-amount");
                headerBalance.innerHTML = response.balance;
            }).fail((error, message) => {
              // do something
            });

        }
    }

    private bindLoginValidation() {
        const mobileRules = "required|callback_check_mobile_format|callback_min_length|callback_max_length";

        const validator = new FormValidator("login-form", [{
            name: "username",
            rules: mobileRules,
            args: {
                callback_max_length: ["50"],
                callback_min_length: ["2"],
            },
        }, {
            name: "password",
            rules: mobileRules,
            args: {
                callback_max_length: ["50"],
                callback_min_length: ["2"],
            },
        }], (errors, event) => {
            if (errors.length > 0) {
                event.preventDefault();
                event.stopPropagation();

                const form = utility.getTarget(event);
                form.querySelector(".login-error").innerHTML = errors[0].message;

            }
        });

        validator.registerCallback("min_length", (value, param, field) => {
            return value.length >= param[0];
        });
        validator.registerCallback("max_length", (value, param, field) => {
            return value.length <= param[0];
        });
        validator.registerCallback("check_mobile_format", (value) => {
            const pattern =  /^(?!\s)[0-9\.\+\-\(\)]*$/;
            return pattern.test(value);
        });

        validator.setMessage("min_length", "Min Lenght");
        validator.setMessage("max_length", "Max Lenght");
        validator.setMessage("check_mobile_format", "Format Error");
    }
}
