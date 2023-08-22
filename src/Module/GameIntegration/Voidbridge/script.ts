import * as xhr from "@core/assets/js/vendor/reqwest";
import * as utility from "@core/assets/js/components/utility";
import PopupWindow from "@app/assets/script/components/popup";

import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

import {GameInterface} from "./../scripts/game.interface";
import {ProviderMessageLightbox} from "../scripts/provider-message-lightbox";
import {ErrorMessageLightbox} from "../scripts/error-message-lightbox";
import * as messageTemplate from "@app/src/Module/GameIntegration/handlebars/unsupported.handlebars";
import {Modal} from "@app/assets/script/components/modal";

export class VoidbridgeModule implements ModuleInterface, GameInterface {
    private key: string = "voidbridge";
    private moduleName: string = "voidbridge_integration";
    private windowObject: any;
    private gameLink: string;
    private messageLightbox: ProviderMessageLightbox;
    private errorMessageLightbox: ErrorMessageLightbox;
    private message: string;

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
        if (options.provider === this.key) {
            const lang = document.body.getAttribute("data-language");

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
                    subprovider: options.subprovider || undefined,
                    lobby: options.lobby || undefined,
                    lang,
                    userAgent: navigator.userAgent,
                    tableName: options.tablename || undefined,
                    extGameId: options.extgameid || undefined,
                },
            }).then((response) => {
                if (response.gameurl) {
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
