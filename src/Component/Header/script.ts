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

                    utility.invoke(document, "session.login");

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
        const clientError = {
            postal_code_max_length_value_field: "asdasd",
        };
        let mobileRules = "required|callback_check_mobile_format|callback_min_length|callback_max_length";
        const mobileVerified =
            utility.hasClass(document.getElementById("MyProfileForm_mobile_number_field"), "verified");
        if (mobileVerified) {
            mobileRules = "callback_always_true";
        }

        const validator = new FormValidator("login-form", [{
            name: "username",
            rules: "required",
            args: {
                callback_max_length: ["50"],
                callback_min_length: ["2"],
            },
        }, {
            name: "MyProfileForm[mobile_number_field]",
            display: "Mobile",
            rules: mobileRules,
            id: "MyProfileForm_mobile_number_field",
            args: {
                callback_max_length: ["14"],
                callback_min_length: ["11"],
            },
        }, {
            name: "MyProfileForm[address_field]",
            display: "Address",
            rules: "required|callback_check_address_format|callback_min_length|callback_max_length",
            id: "MyProfileForm_address_field",
            args: {
                callback_max_length: ["100"],
                callback_min_length: ["2"],
            },
        }, {
            name: "MyProfileForm[city_field]",
            display: "City",
            rules: "required|callback_check_city_format|callback_min_length|callback_max_length",
            id: "MyProfileForm_city_field",
            args: {
                callback_max_length: ["50"],
                callback_min_length: ["2"],
            },
        }, {
            name: "MyProfileForm[postal_code_field]",
            display: "City",
            rules: "callback_check_postal_format|callback_max_length",
            id: "MyProfileForm_postal_code_field",
            args: {
                callback_max_length: [clientError.postal_code_max_length_value_field],
            },
        }], (errors, event) => {
            if (errors.length > 0) {
                event.preventDefault();
                event.stopPropagation();

                console.log(event);
            }
        });

        validator.registerCallback("min_length", (value, param, field) => {
            return value.length >= param[0];
        });
    }
}
