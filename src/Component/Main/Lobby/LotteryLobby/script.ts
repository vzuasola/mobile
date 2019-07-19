declare var navigator: any;

import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";
import PopupWindow from "@app/assets/script/components/popup";
import {LazyLoader} from "./scripts/lazy-loader";
import {ComponentManager, ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@core/src/Plugins/ComponentWidget/asset/router";

/**
 *
 */
export class LotteryLobbyComponent implements ComponentInterface {
    private attachments: any;
    private configs: any[];
    private element: HTMLElement;
    private games: any;
    private gameLink: string;
    private isLogin: boolean;
    private lazyLoader: LazyLoader;
    private product: any[];
    private response: any;
    private windowObject: any;
    private events: {};

    constructor() {
        this.lazyLoader = new LazyLoader();
    }

    onLoad(element: HTMLElement, attachments: {
            authenticated: boolean,
            product: any[],
            configs: any[],
        }) {

        this.attachments = attachments;
        this.element = element;
        this.isLogin = attachments.authenticated;
        this.product = attachments.product;
        this.configs = attachments.configs;
        this.events = {};
        this.doGetLobbyData(() => {
            this.setLobby();
        });
        this.listenClickGameTile();
        this.listenToLaunchGameLoader();
        this.highlightQuickNavMenu();
    }

    onReload(element: HTMLElement, attachments: {
            authenticated: boolean,
            product: any[],
            configs: any[],
        }) {

        if (typeof this.events === "undefined") {
            this.events = {};
        }
        if (!this.element) {
            this.listenClickGameTile();
        }
        this.attachments = attachments;
        this.element = element;
        this.isLogin = attachments.authenticated;
        this.product = attachments.product;
        this.configs = attachments.configs;
        this.doGetLobbyData(() => {
            this.setLobby();
        });
        this.listenToLaunchGameLoader();
        this.highlightQuickNavMenu();
    }

    /**
     * Request games list from cms
     */
    private doGetLobbyData(callback) {
        xhr({
            url: Router.generateRoute("lottery_lobby", "lobby"),
            type: "json",
        }).then((response) => {
            this.games = response;
            if (callback) {
                callback();
            }
        }).fail((error, message) => {
            console.log(error);
        });
    }

    /**
     * Populate lobby with the response from cms
     */
    private setLobby() {
        this.populateGames();
    }

    /**
     * Populate game thumbnails
     */
    private populateGames() {
        /* tslint:disable:no-string-literal */
        /*const enableLazyLoad = (this.configs.hasOwnProperty("lobby_infinite_scroll")) ?
            this.configs["lobby_infinite_scroll"] : false;*/
        const enableLazyLoad = false;
        /* tslint:disable:no-string-literal */
        this.lazyLoader.init(
            this.games,
            this.isLogin,
            this.element.querySelector("#game-container"),
            enableLazyLoad,
        );
    }

    /**
     * Event listener for game item click
     */
    private listenClickGameTile() {
        ComponentManager.subscribe("click", (event, src, data) => {
            const el = utility.hasClass(src, "lottery-game-tile-item", true);
            this.showLogin(el);
        });
    }

    /**
     * Event listener for launching pop up loader
     */
    private listenToLaunchGameLoader() {
        ComponentManager.subscribe("game.launch.loader", (event, src, data) => {
            // Pop up loader with all data
            const prop = {
                width: 360,
                height: 720,
                scrollbars: 1,
                scrollable: 1,
                resizable: 1,
            };

            let url = "/" + ComponentManager.getAttribute("language") + "/game/loader";
            const source = utility.getParameterByName("source");

            for (const key in data.options) {
                if (data.options.hasOwnProperty(key)) {
                    const param = data.options[key];
                    url = utility.addQueryParam(url, key, param);
                }
            }

            url = utility.addQueryParam(url, "currentProduct", ComponentManager.getAttribute("product"));
            url = utility.addQueryParam(url, "loaderFlag", "true");
            if (data.options.target === "popup") {
                this.windowObject = PopupWindow(url, "gameWindow", prop);
            }

            if (!this.windowObject && data.options.target === "popup") {
                return;
            }

            // handle redirects if we are on a PWA standalone
            if ((navigator.standalone || window.matchMedia("(display-mode: standalone)").matches) ||
                source === "pwa" ||
                data.options.target !== "popup"
            ) {
                window.location.href = url;
                return;
            }

            this.windowObject = PopupWindow("", "gameWindow", prop);

            this.updatePopupWindow(url);
        });
    }

    /**
     * Helper function for updating pop up window URL
     */
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
     * Triggers login lightbox
     */
    private showLogin(el) {
        if (el && !this.isLogin) {
            ComponentManager.broadcast("header.login", {
                src: el,
                productVia: this.product[0].login_via,
                regVia: this.product[0].reg_via,
            });
        }
    }

    /**
     *  Helper function used to highlight active links
     *  Broadcasts which page should be highlighted on Quick Nav Menu
     */
    private highlightQuickNavMenu() {
        if (this.checkEvent("tab_nav.ready")) {
            ComponentManager.subscribe("tab_nav.ready", (event, target, data) => {
                ComponentManager.broadcast("tab_nav.highlight", { menu: "home" });
            });
        }
        ComponentManager.broadcast("tab_nav.refresh");
    }

    /**
     *  Helper function used to prevent duplication of listeners
     */
    private checkEvent(key) {
        if (this.events.hasOwnProperty(key)) {
            return false;
        }

        this.events[key] = key;
        return true;
    }
}
