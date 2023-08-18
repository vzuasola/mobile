import * as xhr from "@core/assets/js/vendor/reqwest";
import * as utility from "@core/assets/js/components/utility";
import PopupWindow from "@app/assets/script/components/popup";

import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

import {GameInterface} from "../scripts/game.interface";
import {ProviderMessageLightbox} from "../scripts/provider-message-lightbox";
import {RestrictedCountryLightbox} from "../scripts/restricted-country-lightbox";

export class GPIPkModule implements ModuleInterface, GameInterface {
    private key: string = "gpi_pk";
    private moduleName: string = "gpi_pk_integration";
    private windowObject: any;
    private gameLink: string;
    private messageLightbox: ProviderMessageLightbox;
    private restrictedCountryLightbox: RestrictedCountryLightbox;

    onLoad(attachments: {}) {
        this.messageLightbox = new ProviderMessageLightbox();
        this.restrictedCountryLightbox = new RestrictedCountryLightbox();
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
                    subprovider: options.subprovider || undefined,
                    lang,
                    playMode: true,
                },
            }).then((response) => {
                if (typeof response.restricted_country !== "undefined" ) {
                    this.restrictedCountryLightbox.showMessage(
                        response.restricted_country,
                    );
                    return;
                }

                if (response.gameurl) {
                    if (options.loader === "true") {
                        window.location.href = response.gameurl;
                    } else {
                        this.launchGame(options.target);
                        this.updatePopupWindow(response.gameurl);
                    }
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
