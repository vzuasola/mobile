import * as xhr from "@core/assets/js/vendor/reqwest";
import * as utility from "@core/assets/js/components/utility";
import PopupWindow from "@app/assets/script/components/popup";

import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";
import {Modal} from "@app/assets/script/components/modal";

import * as uclTemplate from "../handlebars/unsupported.handlebars";

import {GameInterface} from "./../scripts/game.interface";

export class SolidGamingModule implements ModuleInterface, GameInterface {
    private key: string = "solid_gaming";
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
            const lang = Router.getLanguage();
            let langCode = "en";

            if (typeof this.languages[lang] !== "undefined") {
                langCode = this.languages[lang];
            }

            xhr({
                url: Router.generateModuleRoute("solidgaming_integration", "launch"),
                type: "json",
                method: "post",
                data: {
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
                    this.unsupportedCurrency(options);
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

    private unsupportedCurrency(data) {
        xhr({
            url: Router.generateModuleRoute("solidgaming_integration", "unsupported"),
            type: "json",
            method: "get",
        }).then((response) => {
            if (response.status) {
                let body = response.message;
                const provider = (data.hasOwnProperty("subprovider") && data.subprovider)
                    ? data.subprovider : response.provider;
                body = body.replace("{game_name}", data.title);
                body = body.replace("{game_provider}", provider);
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
