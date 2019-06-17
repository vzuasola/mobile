import * as Promise from "promise-polyfill";
import * as xhr from "@core/assets/js/vendor/reqwest";
import * as utility from "@core/assets/js/components/utility";
import PopupWindow from "@app/assets/script/components/popup";

import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

import {GameInterface} from "./../scripts/game.interface";
import {ProviderMessageLightbox} from "../scripts/provider-message-lightbox";

export class GoldDeluxeModule implements ModuleInterface, GameInterface {
    private key: string = "gold_deluxe";
    private moduleName: string = "gold_deluxe_integration";
    private currencies: any;
    private languages: any;
    private windowObject: any;
    private gameLink: string;
    private messageLightbox: ProviderMessageLightbox;

    onLoad(attachments: {
        currencies: any,
        languages: any,
    }) {
        this.currencies = attachments.currencies;
        this.languages = attachments.languages;
        this.messageLightbox = new ProviderMessageLightbox();
    }

    init() {
        // not implemented
    }

    login(username, password) {
        // not implemented
    }

    prelaunch(options) {
        return new Promise((resolve, reject) => {
            if (options.maintenance === "true") {
                this.messageLightbox.showMessage(
                    this.moduleName,
                    "maintenance",
                    options,
                );
                resolve();
            }

            resolve();
        });
    }

    launch(options) {
        if (options.provider === this.key) {
            const lang = Router.getLanguage();
            let langCode = "en";

            if (typeof this.languages[lang] !== "undefined") {
                langCode = this.languages[lang];
            }

            const product = options.hasOwnProperty("currentProduct") ? options.currentProduct
                : ComponentManager.getAttribute("product");

            xhr({
                url: Router.generateModuleRoute(this.moduleName, "launch"),
                type: "json",
                method: "post",
                data: {
                    product,
                    gameCode: options.code,
                    langCode,
                    playMode: true,
                },
            }).then((response) => {
                if (response.gameurl) {
                    this.launchGame(options.target);
                    this.updatePopupWindow(response.gameurl);
                }

                if (!response.currency) {
                    this.messageLightbox.showMessage(
                        this.moduleName,
                        "unsupported",
                        options,
                    );
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
