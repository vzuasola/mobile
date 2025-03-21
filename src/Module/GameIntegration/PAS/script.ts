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
import {ProviderMessageLightbox} from "../scripts/provider-message-lightbox";
import {ErrorMessageLightbox} from "../scripts/error-message-lightbox";

/**
 * Combined class implementation for the PAS module and the
 * actual PAS
 */
export class PASModule implements ModuleInterface, GameInterface {
    private key: string = "pas";
    private moduleName: string = "pas_integration";
    private asset: any;
    private username: string;
    private currency: string;
    private playerId: string;
    private token: string;
    private languages: any;
    private windowObject: any;
    private gameLink: string;
    private currentScriptKey: string;
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
    private messageLightbox: ProviderMessageLightbox;
    private errorMessageLightbox: ErrorMessageLightbox;

    onLoad(attachments: {
        asset: any,
        authenticated: boolean,
        username: string,
        playerId: string,
        currency: string,
        token: string,
        iapiconfOverride: {},
        lang: string,
        langguageMap: {[name: string]: string},
        iapiConfigs: any,
        isGold: boolean,
        languages: any,
        pasErrorConfig: any,
    }) {
        this.asset = attachments.asset;
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
            this.playerId = attachments.playerId;
            this.currency = attachments.currency;
        }
        this.token = attachments.token;
        this.messageLightbox = new ProviderMessageLightbox();
        this.errorMessageLightbox = new ErrorMessageLightbox();
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
        // not implemented
    }

    prelaunch(options) {
        // not implemented
    }

    async launch(options) {
        let product = ComponentManager.getAttribute("product");
        if (options.currentProduct) {
            product = options.currentProduct;
        }

        if (options.provider === this.key) {

            // remap language
            const lang = Router.getLanguage();
            const language = this.getLanguageMap(lang);
            // If there is no playerId attachment, this means that there is no session available.
            if (!this.username) {
                this.messageLightbox.showMessage(
                    this.moduleName,
                    "unsupported",
                    options,
                );
            }

            const key = this.getKeyByProduct(product);

            this.attachPTScript(key, () => {
                iapiConf = this.iapiConfs[key];

                // Get Login if not login, login, then launch
                // Before login, check if there are cookies on PTs end
                iapiSetCallout("GetLoggedInPlayer", async (GetLoggedInPlayeResponse) => {
                    // Set the callback for the PAS login
                    iapiSetCallout("Login", this.onLogin(this.username.toUpperCase(), async () => {
                        await this.pasLaunch(options);
                        this.pasErrorMessage(options);
                        return;
                    }));

                    if (this.verifyGetLoggedIn(GetLoggedInPlayeResponse)) {
                        await this.pasLaunch(options);
                        this.pasErrorMessage(options);
                        return;
                    } else {
                        if (key !== "dafabetgames") {
                            iapiLoginUsernameExternalToken(this.username.toUpperCase(), this.token, 1, language);
                        } else {
                            iapiLogin(this.username.toUpperCase(), this.token + "@" + this.playerId + "@mobile",
                                1, language);
                        }
                    }
                });

                this.doCheckSession();
            });

        }
    }

    logout() {
        this.doLogout();
    }

    private getProduct(options) {
        let product = ComponentManager.getAttribute("product");
        if (options.currentProduct) {
            product = options.currentProduct;
        }
        if (DafaConnect.isDafaconnect()) {
            if (product === "mobile-soda-casino") {
                product = "sodaconnect";
            } else {
                product = "dafaconnect";
            }
        }

        return product;
    }

    private pasLaunch(options) {
        return new Promise(async (resolve) => {
            const product = this.getProduct(options);
            if (this.pasLoginResponse.errorCode === 0 || this.pasLoginResponse.errorCode === 2) {
                if (options.maintenance === "true") {
                    await this.messageLightbox.showMessage(
                        this.moduleName,
                        "maintenance",
                        options,
                    );
                    resolve();
                }

                // remap language
                const lang = Router.getLanguage();
                const language = this.getLanguageMap(lang);
                const configProduct = options.hasOwnProperty("currentProduct") ? options.currentProduct
                    : ComponentManager.getAttribute("product");

                const launchUrl = Router.generateModuleRoute(this.moduleName, "launch");
                const launchData = {
                    product: configProduct,
                    lang,
                    language,
                    provider: options.provider || "",
                    launch: options.launch || false,
                    platform: options.platform || "",
                    lobby: options.lobby || false,
                    gameCode: options.code || "",
                    extGameId: options.extgameid || "",
                    keywords: options.keywords || "",
                    title: options.title || "",
                    target: options.target || "",
                    filters: options.filters || "",
                    sort: options.sort || "",
                    loader: options.loader || false,
                    currentProduct: options.currentProduct || "",
                    loaderFlag: options.loaderFlag || false,
                    currency: this.currency,
                    productMap: product,
                    launchAlias: options.tablename,
                };

                xhr({
                    url: launchUrl,
                    type: "json",
                    method: "post",
                    data: launchData,
                }).then(async (response) => {
                    if (this.pasLoginResponse.errorCode === 2 && !response.currency && !response.gameurl) {
                        await this.messageLightbox.showMessage(
                            this.moduleName,
                            "unsupported",
                            options,
                        );
                        resolve();
                    } else {
                        if (response.gameurl && this.pasLoginResponse.errorCode === 0) {
                            if (typeof options.onSuccess === "function") {
                                options.onSuccess.apply(null, [response, options.element]);
                                return;
                            }

                            if (options.loader === "true") {
                                window.location.href = response.gameurl;
                            } else {
                                this.launchGame(options.target);
                                this.updatePopupWindow(response.gameurl);
                            }
                        }

                        if (response.errors) {
                            this.errorMessageLightbox.showMessage(
                                response,
                            );
                            return;
                        }

                        options.currency = this.currency;
                        if (!response.currency) {
                            await this.messageLightbox.showMessage(
                                this.moduleName,
                                "unsupported",
                                options,
                            );
                        }

                        // connection timeout handling when launching via iframe
                        const isConnectionTimeout: boolean = (!response.gameurl &&
                            (typeof options.onFail === "function"));
                        if (isConnectionTimeout) {
                            options.onFail.apply(null, [options.element]);
                        }
                    }
                    resolve();
                }).fail((error, message) => {
                    // Do nothing
                    if (typeof options.onFail === "function") {
                        options.onFail.apply(null, [options.element]);
                        return;
                    }
                    console.log("FAILED: ", error, message);
                    resolve();
                });
            }

            resolve();
        });
    }

    private pasErrorMessage(options) {
        const product = this.getProduct(options);
        if (this.pasLoginResponse.errorCode !== 0) {
            // Do Error mapping modal
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

            if (categoriesEl && !utility.hasClass(categoriesEl,  "modal-active")) {
                categoriesEl.innerHTML = template;
                Modal.open("#unsupported-lightbox");
            }
        }
    }

    /**
     * Check if iapiconfig will be used for loggin in
     */
    private checkIapiConfig(key) {
        let ret = false; // if false do keepalive
        if (key === "dafagold" && !this.isGold) {
            ret = true;
        }

        if (key === "dafa888" && DafaConnect.isDafaconnect()) {
            ret = true;
        }

        if (key === "soda" && DafaConnect.isDafaconnect()) {
            ret = true;
        }

        if (key === "dafabetgames" && DafaConnect.isDafaconnect()) {
            ret = true;
        }

        if (key === "dafaconnect" && !DafaConnect.isDafaconnect()) {
            ret = true;
        }

        if (key === "sodaconnect" && !DafaConnect.isDafaconnect()) {
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
        if (Router.route() !== "/game/loader") {
            this.doKeepAlive();
            if (this.timer === null) {
                this.timer = setTimeout(function() {
                    this.timer = null;
                    this.sessionPersist();
                }, this.keepSessionTime);
            }
        }
    }

    /**
     * Listen to session login
     */
    private listenSessionLogin() {
        ComponentManager.subscribe("session.login", (event, src, data) => {
            xhr({
                url: Router.generateModuleRoute(this.moduleName, "updateToken"),
                type: "json",
                method: "post",
            }).then((response) => {
                if (response.status) {
                    this.username = response.username.toUpperCase();
                    this.token = response.token;
                    this.currency = response.currency;
                    this.playerId = response.playerId;
                }
            }).fail((error, message) => {
                // Do nothing
                this.username = null;
            });
        });
    }

    /**
     * Call the keep alive iapi method, keepSessionTime is configured to 15mins
     * IMS default session timeout is configured to 30mins
     */
    private doKeepAlive() {
        // not implemented
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
                            if (typeof(iapiConf) === "undefined") {
                                // iapiConf is not defined,
                                // it is possible that the player did not launch any PT game.
                                // therefore, there is no reason for the player to logout on provider
                                return;
                            }
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

    private attachPTScript(key, callback?: any) {
        const pasScriptTag = document.querySelector("script.pt");

        if (this.currentScriptKey !== key || this.currentScriptKey !== null) {
            if (pasScriptTag) {
                pasScriptTag.remove();
            }

            this.createPTScript(key, callback);
        }
    }

    private createPTScript(key, callback?: any) {
        const pasScript = document.createElement("script");
        const head = document.getElementsByTagName("head").item(0);
        pasScript.setAttribute("type", "text/javascript");
        pasScript.setAttribute("src", this.asset[key]);
        pasScript.setAttribute("class", "pt");
        head.appendChild(pasScript);
        this.currentScriptKey = key;
        if (callback) {
            pasScript.addEventListener("load", () => {
                ComponentManager.broadcast("pt.load");
                setTimeout(() => {
                    callback();
                }, 200);
            });
        }
    }

    private getKeyByProduct(product) {
        let key = "dafa888";
        if (product === "mobile-casino-gold") {
            key = "dafagold";
        }

        if (DafaConnect.isDafaconnect()) {
            key = "dafaconnect";
        }

        if (product === "mobile-games" || product === "mobile-live-dealer") {
            key = "dafabetgames";
        }

        if (product === "mobile-soda-casino") {
            key = "soda";
            if (DafaConnect.isDafaconnect()) {
                key = "sodaconnect";
            }
        }

        return key;
    }
}
