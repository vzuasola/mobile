import * as xhr from "@core/assets/js/vendor/reqwest";
import * as utility from "@core/assets/js/components/utility";
import PopupWindow from "@app/assets/script/components/popup";

import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

import {GameInterface} from "./../scripts/game.interface";
import {UnsupportedCurrency} from "./../scripts/unsupported-currency";

export class VoidbridgeModule implements ModuleInterface, GameInterface {
    private key: string = "voidbridge";
    private moduleName: string = "voidbridge_integration";
    private currencies: any;
    private languages: any;
    private windowObject: any;
    private gameLink: string;

    onLoad(attachments: {
        currencies: any,
        languages: any,
    }) {
        this.currencies = attachments.currencies;
        this.languages = attachments.languages;
    }

    init() {
        // not implemented
    }

    login(username, password) {
        // not implemented
    }

    prelaunch() {
        // not implemented
    }

    launch(options) {
        if (options.provider === this.key) {
            const lang = document.body.getAttribute("data-language");
            let langCode = "en";

            if (typeof this.languages[lang] !== "undefined") {
                langCode = this.languages[lang];
            }

            xhr({
                url: Router.generateModuleRoute(this.moduleName, "launch"),
                type: "json",
                method: "post",
                data: {
                    gameCode: options.code,
                    langCode,
                },
            }).then((response) => {
                if (response.gameurl) {
                    this.launchGame(options.target);
                    this.updatePopupWindow(response.gameurl);
                }

                if (!response.currency) {
                    const unsupportedCurrency = new UnsupportedCurrency();
                    unsupportedCurrency.showUnsupportedCurrency(this.moduleName, options);
                }
            }).fail((error, message) => {
                // Do nothing
            });
        }
    }

    logout() {
        // not implemented
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
}
