import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";
import PopupWindow from "@app/assets/script/components/popup";
import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";
import {GameInterface} from "./../scripts/game.interface";
import {ProviderMessageLightbox} from "../scripts/provider-message-lightbox";
import {ErrorMessageLightbox} from "../scripts/error-message-lightbox";

/**
 * UGL class implementation
 */
export class UGLModule implements ModuleInterface, GameInterface {
    private moduleName: string = "ugl_integration";
    private username: string;
    private currency: string;
    private playerId: string;
    private token: string;
    private windowObject: any;
    private gameLink: string;
    private lang: string;
    private currentUrl: string;
    private messageLightbox: ProviderMessageLightbox;
    private errorMessageLightbox: ErrorMessageLightbox;

    onLoad(attachments: {
        authenticated: boolean,
        username: string,
        playerId: string,
        currency: string,
        token: string,
        lang: string,
    }) {
        this.currentUrl = window.location.href;
        this.lang = attachments.lang;
        this.token = attachments.token;
        if (attachments.username) {
            this.username = attachments.username.toUpperCase();
            this.playerId = attachments.playerId;
            this.currency = attachments.currency;
        }

        this.messageLightbox = new ProviderMessageLightbox();
        this.errorMessageLightbox = new ErrorMessageLightbox();
        utility.listen(document, "components.early.finish", async (event, target) => {
            const errorCodeValue = this.getErrorCodeFromUrl();

            if (errorCodeValue) {
                const errorData = await this.getUglErrorsMap(errorCodeValue);
                this.errorLightbox(errorData);
            }
        });
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

    logout() {
        // not implemented
    }

    launch(options) {
        const product = this.getProduct(options);
        const lang = Router.getLanguage();
        const configProduct = options.hasOwnProperty("currentProduct") ? options.currentProduct
            : ComponentManager.getAttribute("product");
        const launchUrl = Router.generateModuleRoute(this.moduleName, "launch");
        const launchData = {
            product: configProduct,
            lang,
            provider: options.provider || "",
            launch: options.launch || false,
            platform: options.platform || "",
            lobby: options.lobby || false,
            gameCode: options.code || "",
            tableAlias: options.tablename || "",
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
        };

        xhr({
            url: launchUrl,
            type: "json",
            method: "post",
            data: launchData,
        }).then((response) => {

            if (response.errors) {
                this.errorMessageLightbox.showMessage(
                    response,
                );
                return;
            }

            if (!response.currency && !response.gameurl) {
                this.messageLightbox.showMessage(
                    this.moduleName,
                    "unsupported",
                    options,
                );
            } else {
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
                        return;
                    }
                }

                options.currency = this.currency;
                if (!response.currency) {
                    this.messageLightbox.showMessage(
                        this.moduleName,
                        "unsupported",
                        options,
                    );
                }
            }
        }).fail((error, message) => {
            console.log("FAILED: ", error, message);
            if (typeof options.onFail === "function") {
                options.onFail.apply(null, [options.element]);
                return;
            }
        });
    }

    /**
     * Gets current product
     */
    private getProduct(options) {
        let product = ComponentManager.getAttribute("product");

        if (options.currentProduct) {
            product = options.currentProduct;
        }

        return product;
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

    /**
     * Mapping UGL errors
     */
    private async getUglErrorsMap(errorCode) {
        return new Promise((resolve, reject) => {
            xhr({
                url: Router.generateModuleRoute(this.moduleName, "error"),
                type: "json",
                method: "post",
                data: {
                    product: ComponentManager.getAttribute("product"),
                },
            }).then((response) => {
                let valueObject = {
                    errors: {
                        errorCode: "",
                        errorButton: "",
                    },
                };
                const lines = response.uglError.trim().split("\r\n");

                lines.forEach((line) => {
                    const valueArray = line.split("|");
                    const configErrorCode = valueArray[0] || "";

                    if (errorCode === configErrorCode) {
                        const message = valueArray[1] || "";
                        const button = valueArray[2] || "";
                        valueObject = {
                            errors: {
                                errorCode: message,
                                errorButton: button,
                            },
                        };
                    }
                });

                resolve(valueObject);
            }).catch((error) => {

                const valueObject = {
                    errors: {
                        errorCode: "",
                        errorButton: "",
                    },
                };

                reject(valueObject);
            });
        });
    }

    /**
     * Check if URL contains errorCode parameter
     */
    private getErrorCodeFromUrl() {
        let errorCodeValue = "";

        if (this.currentUrl.includes("errorCode=")) {
            errorCodeValue = this.currentUrl.split("errorCode=")[1] || "6";
        }

        return errorCodeValue;
    }

    /**
     * Show Error Lightbox if Got Error From PT
     */
    private errorLightbox(errorData) {

        if ((errorData as any).errors && (errorData as any).errors.errorCode) {
            this.errorMessageLightbox.showMessage(
                errorData,
            );

            if (window.self !== window.top) {
                const iframe = window.frameElement;
                if (iframe && iframe.id === "gameframe") {
                    this.listenIframe();
                }
            }

            // Remove errorCode from the URL
            const currentUrl = this.currentUrl.replace(/[?&]errorCode=\d+\b/, "");

            // Modify the URL in the browser's history without reloading the page
            window.history.replaceState(null, "", currentUrl);
        }
    }

    /**
     * Listen iFrame
     */
    private listenIframe() {
        const modal = document.querySelector("#error-message-lightbox") ;

        utility.addEventListener(modal, "click", (event, src) => {
            event = event || window.event;
            const target = event.target || event.srcElement;
            utility.preventDefault(event);

            if (utility.hasClass(target, "modal-overlay") || utility.hasClass(target, "modal-close")) {
                window.parent.location.href = window.location.origin + window.location.pathname;
            }
        });
    }
}
