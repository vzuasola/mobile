import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import PopupWindow from "@app/assets/script/components/popup";

import { WebRtc } from "./scripts/web-rtc";

import { ComponentManager, ModuleInterface } from "@plugins/ComponentWidget/asset/component";
import { DafaConnect } from "@app/assets/script/dafa-connect";
import { Router, RouterClass } from "@plugins/ComponentWidget/asset/router";

/**
 *
 */
export class WebRtcModule implements ModuleInterface {
    private webRtcClass: WebRtc;
    private windowTitle: string = "WebrtcWindow";
    private openBehavior: string = "popup";
    private webRtcLink: string;
    private windowObject: any;
    private options: any = {};
    private callUrl: string;
    private urlQryStr: false;
    private dataSrc: false;

    onLoad(attachments: {
        baseUrl: string,
        urlPost: string,
        webrtcUrl: string,
        postTimeout: number,
        jwtKey: string,
        validity: number,
    }) {
        this.options = {
            apiUrl: attachments.urlPost,
            validity: attachments.validity,
            nonce: attachments.jwtKey || false,
            timeout: attachments.postTimeout || 5000,
            webrtcUrl: attachments.webrtcUrl,
            onSuccess: (token) => {
                // Add the token to the base url
                this.updatePopupWindow(utility.addQueryParam(this.callUrl, "s", token));
            },
            onFail: (error) => {
                // Use the default webrtc base url
                this.updatePopupWindow(this.callUrl);
            },
        };

        // Instantiate the webrtc library
        this.webRtcClass = new WebRtc(this.options, attachments);
         // Add listen to everything
        ComponentManager.subscribe("click", (event, src) => {
            this.getWebRtcToken(event, src);
        });

        ComponentManager.subscribe("session.login", (event, src) => {
            this.setJWT();
        });

        ComponentManager.subscribe("session.logout", (event, src) => {
            this.webRtcClass.setToken(false);
        });

        Router.on(RouterClass.afterNavigate, (event) => {
            this.setJWT();
        });
    }

    private setJWT(callback?) {
        xhr({
            url: Router.generateModuleRoute("web_rtc", "jwt"),
            type: "json",
        }).then((response) => {
            this.webRtcClass.setToken(response.jwt);

            // Add VIP level to base url
            if (response.vipLevel) {
                this.callUrl = utility.addQueryParam(this.callUrl, "level", response.vipLevel);
            }
            // Add the token to the base url
            this.webRtcClass.setOnSuccess((token) => {
                this.updatePopupWindow(utility.addQueryParam(this.callUrl, "s", token));
            });

            // Use the default webrtc base url
            this.webRtcClass.setOnFail((error) => {
                this.updatePopupWindow(this.callUrl);
            });

            if (callback) {
                callback(response);
            }
        }).fail((err, msg) => {
            // do nothing
        });
    }

    private updatePopupWindow(url) {
        try {
            url = this.attachProduct(url);

            let updatedUrl = url;

            if (this.windowObject.location.href !== "about:blank" &&
                url === this.webRtcLink &&
                !this.windowObject.closed
            ) {
                this.windowObject.focus();
            } else {
                if (this.urlQryStr) {
                    const checkUrl = url.indexOf("?");

                    if (checkUrl !== -1) {
                        updatedUrl = url + "&" + this.urlQryStr;
                    } else {
                        updatedUrl = url + "?" + this.urlQryStr;
                    }
                }

                if (this.dataSrc) {
                    updatedUrl = updatedUrl.replace("mc-desktop", this.dataSrc);
                }

                this.webRtcLink = updatedUrl;
                const params = utility.getParameters(window.location.href);
                if (DafaConnect.isDafaconnect() || params.clientflag) {
                    window.open(updatedUrl);
                    return;
                }
                this.windowObject.location.href = updatedUrl;
            }
        } catch (e) {
            if (url !== this.webRtcLink) {
                this.webRtcLink = url;
                this.windowObject.location.href = url;
            }

            if (this.windowObject) {
                this.windowObject.focus();
            }
        }
    }

    private attachProduct(url) {
        const product = ComponentManager.getAttribute("product");
        if (product === "mobile-entrypage") {
            return url;
        } else if (product === "mobile-soda-casino") {
            return utility.addQueryParam(url, "product", "ptplus");
        } else {
            return utility.addQueryParam(url, "product", product.replace("mobile-", ""));
        }
    }

    /**
     * Event listener for the WebRtc link
     *
     * @param object event
     * @return void/boolean
     */
    private getWebRtcToken(event, src) {
        let target = utility.find(src, (el) => {
            if (el.tagName === "A") {
                const href = el.getAttribute("href");

                if (href) {
                    return href.indexOf(this.options.webrtcUrl) !== -1;
                }
            }
        });

        // Check if the link should be changed to webrtc link
        if (target) {
            event.preventDefault();
            this.callUrl = target.href;

            this.urlQryStr = target.getAttribute("data-parameters") || false;
            this.dataSrc = target.getAttribute("data-src") || false;

            target = utility.getParameterByName("target", target.href);
            target = target || this.openBehavior;
            const params = utility.getParameters(window.location.href);
            if (target === "_self") {
                this.windowObject = window;
            } else if (target === "_blank") {
                this.windowObject = window.open("", "_blank");
            } else if (DafaConnect.isDafaconnect() || params.clientflag) {
                this.windowObject = window;
            } else {
                // Popup
                // We use a different data attribute for the popup,
                // since popup-window.js is already using the target=window
                let title = utility.getParameterByName("title", target.href);
                title = title || this.windowTitle;

                const prop = this.popUpProperties(target);

                try {
                    if (this.windowObject &&
                        !this.windowObject.closed &&
                        this.windowObject.location.href !== "about:blank"
                    ) {
                        this.windowObject.focus();
                    } else {
                        this.windowObject = PopupWindow("", title, prop);
                    }
                } catch (e) {
                    if (this.windowObject) {
                        this.windowObject.focus();
                    }
                }
            }

            this.setJWT((response) => {
                this.webRtcClass.getWebRtcToken(target);
                return false;
            });
        }
    }

    /**
     * Method to prepare the popup properties
     *
     * @param object $target Element to check
     * @return object
     */
    private popUpProperties(target) {
        const defaults = {
            width: 360,
            height: 720,
            scrollbars: 1,
            scrollable: 1,
            resizable: 1,
        };

        const properties = {};

        // Check the properties and get all possible values
        for (const i in defaults) {
            if (defaults.hasOwnProperty(i)) {
                const property = utility.getParameterByName(i, target.href) || defaults[i];

                properties[i] = property;
            }
        }

        return properties;
    }
}
