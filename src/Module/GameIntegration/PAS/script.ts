import * as Promise from "promise-polyfill";

import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";
import PopupWindow from "@app/assets/script/components/popup";

import Storage from "@core/assets/js/components/utils/storage";

import SyncEvents from "@core/assets/js/components/utils/sync-events";

import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";

import {Modal} from "@app/assets/script/components/modal";
import {DafaConnect} from "@app/assets/script/dafa-connect";

import * as uclTemplate from "../handlebars/unsupported.handlebars";

import {GameInterface} from "./../scripts/game.interface";

/**
 * Combined class implementation for the PAS module and the
 * actual PAS
 */
export class PASModule implements ModuleInterface, GameInterface {
    private key: string = "pas";

    private futurama: boolean;
    private username: string;
    private token: string;
    private languages: any;
    private windowObject: any;
    private gameLink: string;

    private store: Storage = new Storage();
    private sync: SyncEvents = new SyncEvents();

    private isSessionAlive: boolean;
    private timer = null;

    private iapiconfOverride: {} = {};
    private iapiConfs: any = {};

    private keepSessionTime = (1000 * 60) * 15;
    private sessionFlag = "pas.session.flag";
    private languageMap: any;
    private pasErrorConfig: any;
    private lang: string;

    private isGold: boolean;

    private pasLoginResponse: any;

    onLoad(attachments: {
        futurama: boolean,
        authenticated: boolean,
        username: string,
        token: string,
        iapiconfOverride: {},
        lang: string,
        langguageMap: {[name: string]: string},
        iapiConfigs: any,
        isGold: boolean,
        languages: any,
        pasErrorConfig: any,
    }) {
        this.futurama = attachments.futurama;
        this.isSessionAlive = attachments.authenticated;
        this.iapiconfOverride = attachments.iapiconfOverride;
        this.lang = attachments.lang;
        this.languageMap = attachments.langguageMap;
        this.iapiConfs = attachments.iapiConfigs;
        this.isGold = attachments.isGold;
        this.keepAliveTrigger();
        this.listenSessionLogin();
        this.pasErrorConfig = attachments.pasErrorConfig;
        if (attachments.username) {
            this.username = attachments.username.toUpperCase();
        }
        this.token = attachments.token;

        console.log(attachments.iapiconfOverride);
    }

    init() {
        this.pasLoginResponse = {
            errorCode: false,
        };
        if (typeof iapiSetCallout !== "undefined") {
            iapiSetCallout("Logout", this.onLogout);
        }

        if (this.isSessionAlive) {
            this.sessionPersist();
        }
    }

    login(username, password) {
        this.isSessionAlive = true;
        return new Promise((resolve, reject) => {
            const user = username.toUpperCase();
            const real = 1;
            const language = this.getLanguageMap(this.lang);
            const uri = Router.generateModuleRoute("pas_integration", "subaccounts");

            xhr({
                url: utility.addQueryParam(uri, "username", user),
            }).then((response) => {
                let ctr = 0;
                const promises = [];
                for (const key in this.iapiConfs) {
                    if (this.iapiConfs.hasOwnProperty(key)) {
                        if (this.futurama && key !== "dafagold") {
                            continue;
                        }

                        this.isGold = response.provisioned;

                        if (this.checkIapiConfig(key)) {
                            continue;
                        }

                        ++ ctr;
                        const promise = () => {
                            return new Promise((resolvePromise, rejectPromise) => {
                                setTimeout(() => {
                                    iapiConf = this.iapiConfs[key];

                                    // Set the callback for the PAS login
                                    iapiSetCallout("Login", this.onLogin(user, resolvePromise));

                                    iapiLogin(user, password, real, language);
                                    // after n seconds, nothing still happen, I'll let the other
                                    // hooks to proceed
                                    setTimeout(() => {
                                        resolvePromise();
                                    }, 10 * 1000);
                                }, 1.5 * 500 * ctr);
                            });
                        };
                        promises.push(promise);
                    }
                }

                const lastPromise = () => {
                    return new Promise((prom, rej) => {
                        resolve();
                        prom();
                    });
                };

                promises.push(lastPromise);

                this.sync.executeWithArgs(promises, []);
            });

        });
    }

    prelaunch() {
        // not implemented
    }

    launch(options) {
        if (options.provider === this.key) {

            // remap language
            const lang = Router.getLanguage();
            const language = this.getLanguageMap(lang);

            if (this.futurama) {

                let key = "dafa888";
                if (DafaConnect.isDafaconnect()) {
                    key = "dafaconnect";
                }
                iapiConf = this.iapiConfs[key];

                // Get Login if not login, login, then launch
                // Before login, check if there are cookies on PTs end
                iapiSetCallout("GetLoggedInPlayer", (GetLoggedInPlayeResponse) => {
                    // Set the callback for the PAS login
                    iapiSetCallout("Login", this.onLogin(this.username.toUpperCase(), () => {
                        this.pasLaunch(options);
                        return;
                    }));

                    if (this.verifyGetLoggedIn(GetLoggedInPlayeResponse)) {
                        this.pasLaunch(options);
                        return;
                    } else {
                        iapiLoginUsernameExternalToken(this.username.toUpperCase(), this.token, 1, language);
                        // iapiLogin(username, password, real, language);
                    }
                });

                this.doCheckSession();
            }

            if (!this.futurama) {
                this.pasLaunch(options);
            }

        }
    }

    logout() {
        this.doLogout();
    }

    private pasLaunch(options) {
        console.log(this.pasLoginResponse);
        if (!this.futurama || this.pasLoginResponse.errorCode === 0) {
            // remap language
            const lang = Router.getLanguage();
            const language = this.getLanguageMap(lang);
            xhr({
                url: Router.generateModuleRoute("pas_integration", "launch"),
                type: "json",
                method: "post",
                data: {
                    lang,
                    language,
                    options,
                },
            }).then((response) => {
                if (response.gameurl) {
                    this.launchGame(options.target);
                    this.updatePopupWindow(response.gameurl);
                }

                if (!response.currency) {
                    this.unsupportedCurrency(options);
                }
            }).fail((error, message) => {
                // Do nothing
            });

        }

        if (this.futurama && this.pasLoginResponse.errorCode !== 0) {
            // Do Error mapping modal
            this.pasErrorMessage();
        }
    }

    private pasErrorMessage() {
        const errorMap = this.pasErrorConfig.errorMap;
        let body = errorMap.all;

        if (errorMap[this.pasLoginResponse.errorCode]) {
            body = errorMap[this.pasLoginResponse.errorCode];
        }

        const template = uclTemplate({
            title: this.pasErrorConfig.errorTitle,
            message: "<p>" + body + "</p>",
            button: this.pasErrorConfig.errorButton,
        });

        const categoriesEl = document.querySelector("#unsupported-lightbox");

        if (categoriesEl) {
            categoriesEl.innerHTML = template;
            Modal.open("#unsupported-lightbox");
        }
    }

    /**
     * Check if iapiconfig will be used for loggin in
     */
    private checkIapiConfig(key) {
        let ret = false;
        if (key === "dafagold" && !this.isGold) {
            ret = true;
        }

        if (key === "dafa888" && DafaConnect.isDafaconnect()) {
            ret = true;
        }

        if (key === "dafaconnect" && !DafaConnect.isDafaconnect()) {
            ret = true;
        }

        return ret;
    }

    private keepAliveTrigger() {
        Router.on(RouterClass.afterNavigate, (event) => {
            if (this.isSessionAlive) {
                this.sessionPersist();
            }
        });
    }

    private setiApiConfOverride() {
        for (const k in iapiConf) {
            if (typeof this.iapiconfOverride[k] !== "undefined") {
                iapiConf[k] = this.iapiconfOverride[k];
            }
        }
    }

    /**
     * Logout handler
     */
    private onLogout(response) {
        clearTimeout(this.timer);
    }

    /**
     * Persist session on post-login
     */
    private sessionPersist() {
        this.doKeepAlive();

        if (this.timer === null) {
            this.timer = setTimeout(function() {
                this.timer = null;
                this.sessionPersist();
            }, this.keepSessionTime);
        }
    }

    /**
     * Listen to session login
     */
    private listenSessionLogin() {
        ComponentManager.subscribe("session.login", (event, src, data) => {
            if (this.futurama) {
                xhr({
                    url: Router.generateModuleRoute("pas_integration", "updateToken"),
                    type: "json",
                    method: "post",
                }).then((response) => {
                    if (response.status) {
                        this.username = response.username.toUpperCase();
                        this.token = response.token;
                    }
                }).fail((error, message) => {
                    // Do nothing
                });
            }
            if (!this.futurama) {
                this.sessionPersist();
            }
        });
    }

    /**
     * Call the keep alive iapi method, keepSessionTime is configured to 15mins
     * IMS default session timeout is configured to 30mins
     */
    private doKeepAlive() {
        let ctr = 0;
        const promises = [];
        for (const key in this.iapiConfs) {
            if (this.iapiConfs.hasOwnProperty(key)) {
                if (this.futurama && key !== "dafagold") {
                    continue;
                }

                if (this.checkIapiConfig(key)) {
                    continue;
                }
                ++ ctr;
                const promise = () => {
                    return new Promise((resolve, reject) => {
                        setTimeout(() => {
                            iapiConf = this.iapiConfs[key];
                            // Set the callback for the PAS login
                            iapiSetCallout("KeepAlive", (response) => {
                                if (response.errorCode !== 0) {
                                    clearTimeout(this.timer);
                                }
                                resolve();
                            });
                            iapiKeepAlive(1, this.keepSessionTime);

                            // after n seconds, nothing still happen, I'll let the other
                            // hooks to proceed
                            setTimeout(() => {
                                resolve();
                            }, 10 * 1000);
                        }, 1.5 * 500 * ctr);
                    });
                };
                promises.push(promise);
            }
        }
        this.sync.executeWithArgs(promises, []);
    }

    /**
     * Check the getLoggedInPlayer response
     */
    private verifyGetLoggedIn(res) {
        this.pasLoginResponse = res;
        if (res.errorCode === 0 &&
            (res.username === this.username.toUpperCase() && res.username.length > 0)
        ) {
            return true;
        }

        return false;
    }

    /**
     * Checks the PAS session, checks if the player is logged-in in PT or not
     */
    private doCheckSession() {
        iapiGetLoggedInPlayer(1);
    }

    /**
     * Logs out the PAS session
     */
    private doLogout() {
        this.isSessionAlive = false;
        let ctr = 0;
        const promises = [];
        for (const key in this.iapiConfs) {
            if (this.iapiConfs.hasOwnProperty(key)) {
                if (this.checkIapiConfig(key)) {
                    continue;
                }
                ++ ctr;
                const promise = () => {
                    return new Promise((resolve, reject) => {
                        setTimeout(() => {
                            iapiConf = this.iapiConfs[key];
                            // Set the callback for the PAS login
                            iapiSetCallout("Logout", (response) => {
                                resolve();
                            });
                            iapiLogout(1, 1);

                            // after n seconds, nothing still happen, I'll let the other
                            // hooks to proceed
                            setTimeout(() => {
                                resolve();
                            }, 10 * 1000);
                        }, 1.5 * 500 * ctr);
                    });
                };
                promises.push(promise);
            }
        }
        this.sync.executeWithArgs(promises, []);
    }

    /**
     * Gets the language mapping
     */
    private getLanguageMap(lang) {
        const map = this.languageMap;

        return map && typeof map[lang] !== "undefined" ? map[lang] : lang;
    }

    /**
     * Callback on login process
     */
    private onLogin(username, resolve) {
        return (response) => {
            if (0 === response.errorCode) {
                // Flag for detecting if the player is still logged-in on PAS
                this.store.set(this.sessionFlag, "1");
                this.pasLoginResponse = response;
                if (response.sessionValidationData !== undefined &&
                    response.sessionValidationData.SessionValidationByTCVersionData !== undefined
                ) {
                    // Change the ValidateLoginSession callback to handle the TC validation
                    iapiSetCallout("ValidateLoginSession", this.onTCVersionValidation(username, resolve));
                    // Auto validate the TC version
                    iapiValidateTCVersion(
                        response.sessionValidationData.SessionValidationByTCVersionData[0].termVersionReference,
                        1,
                        1,
                    );
                } else {
                    resolve();
                }

                return;
            }
            this.pasLoginResponse = response;
            resolve();
        };
    }

    /**
     * Handle the TCVersion response during login
     */
    private onTCVersionValidation(username, resolve) {
        return (response) => {
            if (0 === response.errorCode) {
                resolve();
                return;
            }

            resolve();
        };
    }

    /**
     * Define user parameters
     */
    private setClientParams(parameters) {
        // remap language
        const lang = Router.getLanguage();
        const language = this.getLanguageMap(lang);
        const defaults = {
            language,
            advertiser: "ptt",
            fixedsize: 1,
        };
        const params = parameters || {};

        // Set defaults
        for (const name in defaults) {
            if (params[name] === undefined) {
                params[name] = defaults[name];
            }
        }

        return params;
    }

    private launchGame(target) {
        if (target === "_self" || target === "_top") {
            this.windowObject = window;
        } else {
            const prop = {
                width: 360,
                height: 720,
                scrollbars: 1,
                scrollable: 1,
                resizable: 1,
            };
            try {
                if (this.windowObject &&
                    !this.windowObject.closed &&
                    this.windowObject.location.href !== "about:blank"
                ) {
                    this.windowObject.focus();
                } else {
                    this.windowObject = PopupWindow("", "gameWindow", prop);
                }
            } catch (e) {
                if (this.windowObject) {
                    this.windowObject.focus();
                }
            }
        }
    }

    private updatePopupWindow(url) {
        try {
            if (this.windowObject.location.href !== "about:blank" &&
                url === this.gameLink &&
                !this.windowObject.closed
            ) {
                this.windowObject.focus();
            } else {
                this.gameLink = url;
                this.windowObject.location.href = url;
            }
        } catch (e) {
            if (url !== this.gameLink) {
                this.gameLink = url;
                this.windowObject.location.href = url;
            }

            if (this.windowObject) {
                this.windowObject.focus();
            }
        }
    }

    private unsupportedCurrency(data) {
        xhr({
            url: Router.generateModuleRoute("pas_integration", "unsupported"),
            type: "json",
            method: "get",
        }).then((response) => {
            if (response.status) {
                let body = response.message;
                body = body.replace("{game_name}", data.title);
                body = body.replace("{game_provider}", response.provider);
                const template = uclTemplate({
                    title: response.title,
                    message: body,
                    button: response.button,
                });

                const categoriesEl = document.querySelector("#unsupported-lightbox");

                if (categoriesEl) {
                    categoriesEl.innerHTML = template;
                    Modal.open("#unsupported-lightbox");
                }
            }
        }).fail((error, message) => {
            // Do nothing
        });
    }
}
