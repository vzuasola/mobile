import * as Promise from "promise-polyfill";

import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";
import Storage from "@core/assets/js/components/utils/storage";

import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

import {GameInterface} from "./../scripts/game.interface";

/**
 * Combined class implementation for the PAS module and the
 * actual PAS
 */
export class PASModule implements ModuleInterface, GameInterface {
    private store: Storage = new Storage();

    private isSessionAlive: boolean;
    private timer = null;

    private iapiconfOverride: {} = {};
    private iapiConfs: any = {};

    private keepSessionTime = (1000 * 60) * 15;
    private sessionFlag = "pas.session.flag";
    private languageMap: any;
    private lang: string;

    onLoad(attachments: {
        authenticated: boolean,
        iapiconfOverride: {},
        lang: string,
        langguageMap: {[name: string]: string},
        iapiConfigs: any,
    }) {
        this.isSessionAlive = attachments.authenticated;
        this.iapiconfOverride = attachments.iapiconfOverride;
        this.lang = attachments.lang;
        this.languageMap = attachments.langguageMap;
        this.iapiConfs = attachments.iapiConfigs;
    }

    init() {
        if (typeof iapiSetCallout !== "undefined") {
            iapiSetCallout("Logout", this.onLogout);
            iapiSetCallout("KeepAlive", this.onKeepAlive);
        }

        if (this.isSessionAlive) {
            // Persist session
            this.sessionPersist();
        } else if (this.store.get(this.sessionFlag) !== null) {
            this.doLogout();
        }
    }

    login(username, password) {
        return new Promise((resolve, reject) => {
            const user = username.toUpperCase();
            const real = 1;
            const language = this.getLanguageMap(this.lang);
            const uri = Router.generateModuleRoute("pas_integration", "subaccounts");

            xhr({
                url: `${uri}?username=${user}`,
            }).then((response) => {
                let ctr = 0;

                for (const key in this.iapiConfs) {
                    if (this.iapiConfs.hasOwnProperty(key)) {
                        if (key === "dafagold" && !response.provisioned) {
                            break;
                        }

                        ++ ctr;

                        setTimeout(() => {
                            iapiConf = this.iapiConfs[key];
                            iapiLogin(user, password, real, language);

                            // Set the callback for the PAS login
                            iapiSetCallout("Login", this.onLogin(user, resolve));
                        }, 1.5 * 500 * ctr);
                    }
                }
            });

            // after n seconds, nothing still happen, I'll let the other
            // hooks to proceed
            setTimeout(() => {
                resolve();
            }, 10 * 1000);
        });
    }

    prelaunch() {
        // not implemented
    }

    launch() {
        // not implemented
    }

    logout() {
        this.doLogout();
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
     * Keeptimeout handler
     */
    private onKeepAlive(response) {
        if (response.errorCode !== 0) {
            clearTimeout(this.timer);
        }
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
     * Call the keep alive iapi method, keepSessionTime is configured to 15mins
     * IMS default session timeout is configured to 30mins
     */
    private doKeepAlive() {
        iapiSetCallout("GetLoggedInPlayer", (response) => {
            if (this.verifyCookie(response)) {
                iapiKeepAlive(1, this.keepSessionTime);
            }
        });

        // Trigger the session check
        this.doCheckSession();
    }

    /**
     * Check the getLoggedInPlayer response
     */
    private verifyCookie(res) {
        if (res.errorCode === 0 &&
            (typeof res.username !== "undefined" && res.username.length > 0)
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
        iapiSetCallout("GetLoggedInPlayer", (response) => {
            // Remove the session flag to avoid recurring calls
            this.store.remove(this.sessionFlag);
            if (this.verifyCookie(response)) {
                // If there's an existing cookie only then we trigger the logout
                // So that we don't blindly call and bombard the logout endpoint
                // 1 = logout to all platform
                // 1 = realmode
                iapiLogout(1, 1);
            }
        });

        // Trigger the session check
        this.doCheckSession();
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
}
