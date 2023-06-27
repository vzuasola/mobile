declare var navigator: any;

import * as utility from "@core/assets/js/components/utility";
import {ComponentManager} from "@plugins/ComponentWidget/asset/component";
import PopupWindow from "@app/assets/script/components/popup";

export class GameLauncherManager {
    private gameLink: string;

    handleGameLaunch(product) {
        this.listenToGameLaunchEvents(product);
    }

    /** Listen to game launch events */
    private listenToGameLaunchEvents(product) {
        ComponentManager.subscribe("game.launch.loader", (event, src, data) => {
            if (ComponentManager.getAttribute("product") === product) {
                this.launchByLauncherType("games.launch.loader", data);
            }
        });

        ComponentManager.subscribe("game.launch.iframe", (event, src, data) => {
            if (ComponentManager.getAttribute("product") === product) {
                this.launchByLauncherType("game.launch.iframe", data);
            }
        });
    }

     /**
      * Call launcher type depending on game events
      * @param event
      * @param data
      */
      private launchByLauncherType(event, data) {
        if (event === "game.launch.iframe") {
            this.launchViaIFrame(data);
        } else {
            this.launchViaGameLoader(data);
        }
    }

    /**
     * Handle game launching via /game/loader on a popup window
     * Player is redirected to 3rd party site
     * @param data
     */
    private launchViaGameLoader(data) {
        const source = utility.getParameterByName("source");
        let url = "/" + ComponentManager.getAttribute("language") + "/game/loader";
        url = this.getLauncherUrl(url, data);

        // handle redirects if we are on a PWA standalone
        if (this.isPWA(source) || data.options.target !== "popup"
        ) {
            window.location.href = url;
            return;
        }

        this.setupPopupWindow(url);
    }

    /**
     * Handle game launching via /game/frame
     * Game is loaded in an iframe
     * @param data
     */
    private launchViaIFrame(data) {
        const source = utility.getParameterByName("source");
        let product = data.options.currentProduct;
        product = product.replace("mobile-", "");
        let url = "/" + ComponentManager.getAttribute("language") + "/" + product + "/game/launch";

        url = this.getLauncherUrl(url, data);
        // handle redirects if we are on a PWA standalone
        if (this.isPWA(source) || data.options.target !== "popup"
        ) {
            window.location.href = url;
            return;
        }

        if (data.options.target === "popup") {
            this.setupPopupWindow(url);
        } else {
            window.location.href = url;
        }
    }

    /**
     * Checks if launching from PWA
     * @param source
     * @returns boolean
     */
    private isPWA(source) {
        return (navigator.standalone || window.matchMedia("(display-mode: standalone)").matches) ||
            source === "pwa";
    }
    /**
     * Add game parameters to launcher URL
     * @param url
     */
    private getLauncherUrl(url, data) {
        // add game parameters to URL
        for (const key in data.options) {
            if (data.options.hasOwnProperty(key)) {
                const param = data.options[key];
                url = utility.addQueryParam(url, key, param);
            }
        }

        url = utility.addQueryParam(url, "currentProduct", ComponentManager.getAttribute("product"));
        url = utility.addQueryParam(url, "loaderFlag", "true");

        return url;
    }
    /**
     * Setup popup window properties in case game will launch via popup
     * @param url
     */
    private setupPopupWindow(url) {
        let windowObject: any;
        // Popup window properties
        const prop = {
            width: 360,
            height: 720,
            scrollbars: 1,
            scrollable: 1,
            resizable: 1,
        };
        windowObject = PopupWindow(url, "gameWindow", prop);
        this.updatePopupWindow(windowObject, url);
    }

    /**
     * Update Popup window URL
     * @param windowObject
     * @param url
     */
    private updatePopupWindow(windowObject, url) {
        try {
            if (windowObject.location.href !== "about:blank" &&
                url === this.gameLink &&
                !windowObject.closed
            ) {
                windowObject.focus();
            } else {
                this.gameLink = url;
                windowObject.location.href = url;
            }
        } catch (e) {
            if (url !== this.gameLink) {
                this.gameLink = url;
                windowObject.location.href = url;
            }

            if (windowObject) {
                windowObject.focus();
            }
        }
    }
}
