import * as xhr from "@core/assets/js/vendor/reqwest";
import PopupWindow from "@core/assets/js/components/utils/popup";

import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

import {GameInterface} from "./../scripts/game.interface";
import {ProviderMessageLightbox} from "../scripts/provider-message-lightbox";
import {ErrorMessageLightbox} from "../scripts/error-message-lightbox";

export class PGSoftModule implements ModuleInterface, GameInterface {
    private key: string = "pg_soft";
    private keyArray: string[] = ["pg_soft", "pgsoft"];
    private moduleName: string = "pgsoft_integration";
    private windowObject: any;
    private gameLink: string;
    private messageLightbox: ProviderMessageLightbox;
    private errorMessageLightbox: ErrorMessageLightbox;

    onLoad(attachments: {}) {
        this.messageLightbox = new ProviderMessageLightbox();
        this.errorMessageLightbox = new ErrorMessageLightbox();
    }

    init() {
        // not implemented
    }

    login(username, password) {
        // not implemented
    }

    prelaunch(options) {
        // not implemented
    }

    launch(options) {
        if (options.provider === this.key
            || this.keyArray.indexOf(options.provider) !== -1) {
            const lang = Router.getLanguage();

            if (options.maintenance === "true") {
                this.messageLightbox.showMessage(
                    this.moduleName,
                    "maintenance",
                    options,
                );
                return;
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
                    extGameId: options.extgameid || "",
                    subprovider: options.subprovider || undefined,
                    lobby: options.lobby,
                    lang,
                },
            }).then((response) => {
                if (response.gameurl) {
                    if (typeof options.onSuccess === "function") {
                        options.onSuccess.apply(null, [response, options.element]);
                        return;
                    }

                    if (options.loader !== "true") {
                        this.launchGame(options.target, response.type);
                        this.updatePopupWindow(response);
                    }
                }

                if (response.errors) {
                    this.errorMessageLightbox.showMessage(
                        response,
                    );
                    return;
                }

                if (!response.currency) {
                    this.messageLightbox.showMessage(
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
            }).fail((error, message) => {
                // Do nothing
                if (typeof options.onFail === "function") {
                    options.onFail.apply(null, [options.element]);
                    return;
                }
            });
        }
    }

    logout() {
        // not implemented
    }

    private launchGame(target, type) {
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
                    this.windowObject.location.href !== "about:blank" &&
                    type !== "html"
                ) {
                    this.windowObject.focus();
                } else {
                    this.windowObject = PopupWindow("", "gameWindow", prop);
                }
            } catch (e) {
                if (this.windowObject) {
                    if (type !== "html") {
                        this.windowObject.focus();
                    } else {
                        // if launching via html is enabled, and game is already opened in a popup
                        // we need to re-open a new popup to be able to change
                        // content of popup
                        this.windowObject.close();
                        this.windowObject = PopupWindow("", "gameWindow", prop);
                    }
                }
            }
        }
    }

    private updatePopupWindow(response) {
        try {
            if (this.windowObject.location.href !== "about:blank" &&
                (response.gameurl === this.gameLink) &&
                !this.windowObject.closed
            ) {
                this.windowObject.focus();
            } else {
                setTimeout(() => {
                    if (response.type === "html") {
                        this.windowObject.document.open();
                        this.windowObject.document.write(response.gameurl);
                        this.windowObject.document.close();
                    } else {
                        this.windowObject.location.href = response.gameurl;
                        this.gameLink = response.gameurl;
                    }
                }, 500);
            }
        } catch (e) {
            if (response.gameurl !== this.gameLink) {
                setTimeout(() => {
                    if (response.type === "html") {
                        this.windowObject.document.open();
                        this.windowObject.document.write(response.gameurl);
                        this.windowObject.document.close();
                    } else {
                        this.windowObject.location.href = response.gameurl;
                        this.gameLink = response.gameurl;
                    }
                }, 500);
            }

            if (this.windowObject) {
                this.windowObject.focus();
            }
        }
    }
}
