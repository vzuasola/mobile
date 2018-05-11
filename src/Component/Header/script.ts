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

import mobileBalance from "@app/assets/script/components/balance-mobile";

/**
 *
 */
export class HeaderComponent implements ComponentInterface {
    private loader: Loader;
    private session: Session;
    private loginOrigin: HTMLElement;
    private errorMessageBlankUsername: string;
    private errorMessageBlankPassword: string;
    private errorMessageBlankPassname: string;
    private errorMessageInvalidPassname: string;
    private errorMessageServiceNotAvailable: string;
    private errorMessageAccountSuspended: string;
    private errorMessageAccountLocked: string;

    constructor() {
        this.loader = new Loader(document.body, true);
    }

    onLoad(element: HTMLElement, attachments: {
        authenticated: boolean,
        error_message_blank_username: string,
        error_message_blank_password: string,
        error_message_blank_passname: string,
        error_message_invalid_passname: string,
        error_message_service_not_available: string,
        error_message_account_suspended: string,
        error_message_account_locked: string,
    }) {
        this.errorMessageBlankUsername = attachments.error_message_blank_username;
        this.errorMessageBlankPassword = attachments.error_message_blank_password;
        this.errorMessageBlankPassname = attachments.error_message_blank_passname;
        this.errorMessageInvalidPassname = attachments.error_message_invalid_passname;
        this.errorMessageServiceNotAvailable = attachments.error_message_service_not_available;
        this.errorMessageAccountSuspended = attachments.error_message_account_suspended;
        this.errorMessageAccountLocked = attachments.error_message_account_locked;
        this.bindLoginValidation();
        this.activateLogin(element);
        this.bindLoginForm(element);
        this.bindLogout(attachments);
        this.bindSession(attachments);
        this.activatePasswordMask(element);

        this.listenLogin(attachments);
        this.listenLogout(attachments);
        this.getBalance(element, attachments);
        this.clearErrorMessage(element);
    }

    onReload(element: HTMLElement, attachments: {
        authenticated: boolean,
        error_message_blank_username: string,
        error_message_blank_password: string,
        error_message_blank_passname: string,
        error_message_invalid_passname: string,
        error_message_service_not_available: string,
        error_message_account_suspended: string,
        error_message_account_locked: string,
    }) {
        this.errorMessageBlankUsername = attachments.error_message_blank_username;
        this.errorMessageBlankPassword = attachments.error_message_blank_password;
        this.errorMessageBlankPassname = attachments.error_message_blank_passname;
        this.errorMessageInvalidPassname = attachments.error_message_invalid_passname;
        this.errorMessageServiceNotAvailable = attachments.error_message_service_not_available;
        this.errorMessageAccountSuspended = attachments.error_message_account_suspended;
        this.errorMessageAccountLocked = attachments.error_message_account_locked;
        this.bindLoginValidation();
        this.activateLogin(element);
        this.bindLoginForm(element);
        this.bindLogout(attachments);
        this.bindSession(attachments);
        this.activatePasswordMask(element);
        this.getBalance(element, attachments);
        this.clearErrorMessage(element);
    }

    private clearErrorMessage(element) {
        const form: HTMLElement = element.querySelector(".login-form");

        utility.listen(element, "click", (event, src) => {
            if (utility.hasClass(src, "modal-overlay") || utility.hasClass(src, "modal-close")) {
                form.querySelector(".login-error").innerHTML = "";
            }
        });
    }

    private activatePasswordMask(element) {
        passwordMask(element.querySelector(".login-field-password"));
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

                    ComponentManager.broadcast("session.login", this.loginOrigin);

                    ComponentManager.refreshComponents(["header", "main", "announcement", "push_notification"],
                    () => {
                        this.loader.hide();
                    });
                }).fail((error) => {
                    const resp = JSON.parse(error.response);
                    const errorMessage = {
                        401: this.errorMessageInvalidPassname,
                        402: this.errorMessageAccountSuspended,
                        403: this.errorMessageAccountLocked,
                        500: this.errorMessageServiceNotAvailable,
                    };

                    form.querySelector(".login-error").innerHTML = errorMessage[error.status];
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

    private listenLogin(attachments: {authenticated: boolean}) {
        ComponentManager.subscribe("header.login", (event, src) => {
            Modal.open("#login-lightbox");
        });

        if (!attachments.authenticated) {
            ComponentManager.subscribe("click", (event, src) => {
                const selector = "login-trigger";
                const el = utility.hasClass(src, selector, true);
                if (el) {
                    this.loginOrigin = el;
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
                mobileBalance(response.balance);
            }).fail((error, message) => {
              // do something
            });

        }
    }

    private bindLoginValidation() {
        const mobileRules = "callback_check_mobile_format|callback_min_length|callback_max_length";

        const validator = new FormValidator("login-form", [{
            name: "username",
            rules: "callback_user_required|" + mobileRules,
            args: {
                callback_min_length: ["3"],
                callback_max_length: ["15"],
            },
        }, {
            name: "password",
            rules: "callback_pass_required|" + mobileRules,
            args: {
                callback_min_length: ["6"],
                callback_max_length: ["10"],
            },
        }], (errors, event) => {
            if (errors.length > 0) {
                event.preventDefault();
                event.stopPropagation();

                const form = utility.getTarget(event);
                let errorMessage: string;
                let userFlag = false;
                let passFlag = false;
                for (const key in errors) {
                    if (errors.hasOwnProperty(key)) {

                        const error = errors[key];
                        if (error.rule === "user_required") {
                            errorMessage = error.message;
                            userFlag = true;
                        }
                        if (error.rule === "pass_required") {
                            errorMessage = error.message;
                            passFlag = true;
                        }
                        if (!userFlag) {
                            errorMessage = error.message;
                        }

                        if (userFlag && passFlag) {
                            errorMessage = this.errorMessageBlankPassname;
                        }
                    }
                }
                form.querySelector(".login-error").innerHTML = errorMessage;
            }
        });

        validator.registerCallback("user_required", (value, param, field) => {
            return (value !== null && value !== "");
        });
        validator.registerCallback("pass_required", (value, param, field) => {
            return (value !== null && value !== "");
        });
        validator.registerCallback("min_length", (value, param, field) => {
            return value.length >= param[0];
        });
        validator.registerCallback("max_length", (value, param, field) => {
            return value.length <= param[0];
        });
        validator.registerCallback("check_mobile_format", (value) => {
            const pattern =  /^\w+$/i;
            return pattern.test(value);
        });

        validator.setMessage("user_required", this.errorMessageBlankUsername);
        validator.setMessage("pass_required", this.errorMessageBlankPassword);
        validator.setMessage("min_length", this.errorMessageInvalidPassname);
        validator.setMessage("max_length", this.errorMessageInvalidPassname);
        validator.setMessage("check_mobile_format", this.errorMessageInvalidPassname);
    }
}
