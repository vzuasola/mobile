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
    private key: string = "ugl";
    private moduleName: string = "ugl_integration";
    private username: string;
    private currency: string;
    private playerId: string;
    private token: string;
    private windowObject: any;
    private gameLink: string;
    private languageMap: any;
    private lang: string;

    private messageLightbox: ProviderMessageLightbox;
    private errorMessageLightbox: ErrorMessageLightbox;

    onLoad(attachments: {
        authenticated: boolean,
        username: string,
        playerId: string,
        currency: string,
        token: string,
        lang: string,
        langguageMap: {[name: string]: string},
    }) {
        this.lang = attachments.lang;
        this.languageMap = attachments.langguageMap;
        this.token = attachments.token;
        if (attachments.username) {
            this.username = attachments.username.toUpperCase();
            this.playerId = attachments.playerId;
            this.currency = attachments.currency;
        }

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

    logout() {
        // not implemented
    }

    launch(options) {
        const product = this.getProduct(options);
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
        };

        xhr({
            url: launchUrl,
            type: "json",
            method: "post",
            data: launchData,
        }).then((response) => {

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

                if (response.errors) {
                    this.errorMessageLightbox.showMessage(
                        response,
                    );
                    return;
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

    /**
     * Gets the language mapping
     */
    private getLanguageMap(lang) {
        const map = this.languageMap;

        return map && typeof map[lang] !== "undefined" ? map[lang] : lang;
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
