declare var navigator: any;

import {ComponentManager, ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import {Router, RouterClass} from "@core/src/Plugins/ComponentWidget/asset/router";
import {QuickLauncher} from "./scripts/quick-launcher";
import {LazyLoader} from "./scripts/lazy-loader";
import PopupWindow from "@app/assets/script/components/popup";
import * as Handlebars from "handlebars/runtime";
import * as tabTemplate from "./handlebars/lobby-tabs.handlebars";
import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

/**
 *
 */
export class LiveDealerLobbyComponent implements ComponentInterface {
    private groupedGames: any;
    private availableTabs: any[];
    private tabs: any[];
    private element;
    private isLogin;
    private product: any[];
    private attachments: any;
    private windowObject: any;
    private gameLink: string;
    private configs: any[];
    private providers: any;
    private lazyLoader: LazyLoader;

    constructor() {
        this.lazyLoader = new LazyLoader();
    }

    onLoad(element: HTMLElement, attachments: {
            authenticated: boolean,
            product: any[],
            tabs: any[],
            configs: any[],
        }) {
        this.groupedGames = undefined;
        this.attachments = attachments;
        this.element = element;
        this.isLogin = attachments.authenticated;
        this.product = attachments.product;
        this.tabs = attachments.tabs;
        this.configs = attachments.configs;
        this.liveDealerXhrRequest("maintenance", (response) => {
            this.providers = response.game_providers;
            ComponentManager.broadcast("provider.maintenance", {
                providers: this.providers,
            });
            this.generateLobby(() => {
                this.setLobby();
            });
        });
        this.listenHashChange();
        this.listenClickTab();
        this.listenClickGameTile();
        this.listenClickLauncherTab();
        this.listenToLaunchGameLoader();
        this.listenToScroll();
    }

    onReload(element: HTMLElement, attachments: {
            authenticated: boolean,
            product: any[],
            tabs: any[],
            configs: any[],
        }) {
        if (!this.element) {
            this.listenHashChange();
            this.listenToScroll();
            this.listenClickTab();
            this.listenClickGameTile();
            this.listenClickLauncherTab();
            this.listenToLaunchGameLoader();
        }
        this.groupedGames = undefined;
        this.attachments = attachments;
        this.element = element;
        this.isLogin = attachments.authenticated;
        this.product = attachments.product;
        this.tabs = attachments.tabs;
        this.configs = attachments.configs;
        this.liveDealerXhrRequest("maintenance", (response) => {
            this.providers = response.game_providers;
            ComponentManager.broadcast("provider.maintenance", {
                providers: this.providers,
            });
            this.generateLobby(() => {
                this.setLobby();
            });
        });
    }

    private liveDealerXhrRequest(method: string, callback) {
        xhr({
            url: Router.generateRoute("live_dealer_lobby", method),
            type: "json",
        }).then((response) => {
                callback(response);
        }).fail((error, message) => {
            console.log(error);
        });
    }

    /**
     * Request games list from cms
     */
    private doGetLobbyData(callback) {
        this.liveDealerXhrRequest("lobby", (response) => {
            const groupedGames = this.groupGamesByTab(response);
            this.groupedGames = this.sortGamesByTab(groupedGames);
            if (callback) {
                callback();
            }
        });
    }

    /**
     * Group games by lobby tab
     */
    private groupGamesByTab(games) {
        const groupedGames: any = [];
        for (const gameId in games) {
            if (games.hasOwnProperty(gameId)) {
                const game = games[gameId];
                if (this.providers.hasOwnProperty(game.game_provider)) {
                    game.provider_maintenance = this.providers[game.game_provider].maintenance;
                }
                if (!groupedGames.hasOwnProperty(game.lobby_tab)
                ) {
                    groupedGames[game.lobby_tab] = [];
                }

                if (typeof groupedGames[game.lobby_tab] !== "undefined"
                ) {
                    groupedGames[game.lobby_tab].push(game);
                }
            }
        }
        return groupedGames;
    }

    /**
     * Sorts game thumbnails by sort weight
     */
    private sortGamesByTab(groupedGames) {
        const sortedGames: any = [];
        for (const tab in groupedGames) {
            if (groupedGames.hasOwnProperty(tab)) {
                let categoryGames = groupedGames[tab];
                categoryGames = categoryGames.sort((a, b) => {
                    return a.sort_weight - b.sort_weight;
                });
                sortedGames[tab] = categoryGames;
            }
        }

        return sortedGames;
    }

    /**
     * Initialized games lobby
     */
    private generateLobby(callback) {
        if (!this.groupedGames) {
            this.doGetLobbyData(callback);
        } else {
            this.setLobby();
        }
    }

    /**
     * Populate lobby with the response from cms
     */
    private setLobby() {
        this.setLobbyTabs();
        const activeTab = this.getActiveTab();
        if (this.groupedGames.hasOwnProperty("providers")) {
            const quickLauncher = new QuickLauncher(this.attachments.configs, this.isLogin);
            quickLauncher.activate(this.groupedGames.providers, activeTab);
        }
        this.populateTabs();
        this.populateGames(activeTab);
        this.setActiveTab();
        this.quickLaunchActiveListener();
    }

    /**
     * Set lobby tabs
     */
    private setLobbyTabs() {
        this.availableTabs = Object.keys(this.groupedGames);
        this.tabs = this.filterTabs(this.tabs);
    }

    /**
     * Gets current active tab from url, if none is found, use first tab as default.
     */
    private getActiveTab() {
        const hash = utility.getHash(window.location.href);

        if (this.groupedGames.hasOwnProperty(hash)
            && this.groupedGames[hash].length > 0) {
            return hash;
        }

        return this.tabs[0].field_alias[0].value;
    }

    /**
     * Populate game thumbnails
     */
    private populateGames(activeTab) {
        /* tslint:disable:no-string-literal */
        const enableLazyLoad = (this.configs.hasOwnProperty("lobby_infinite_scroll")) ?
            this.configs["lobby_infinite_scroll"] : false;
        /* tslint:disable:no-string-literal */
        this.lazyLoader.init(
            this.groupedGames[activeTab],
            this.isLogin,
            this.configs,
            this.element.querySelector("#game-container"),
            activeTab,
            enableLazyLoad,
        );
    }

    /**
     * Populate lobby tabs
     */
    private populateTabs() {
        const tabsEl = this.element.querySelector("#providers-filter-transfer-container");
        const template = tabTemplate({
            tabs: this.tabs,
            authenticated: this.isLogin,
            configs: this.attachments.configs,
            hasTransferTab: (this.isLogin && this.attachments.configs.games_transfer_link !== ""),
        });

        if (tabsEl) {
            tabsEl.innerHTML = template;
        }
    }

    /**
     * Filter lobby tabs
     */
    private filterTabs(tabs) {
        const filteredTabs: any[] = [];
        for (const tab of tabs) {
            /* tslint:disable:no-string-literal */
            if (tab.hasOwnProperty("field_alias") &&
                this.availableTabs.indexOf(tab["field_alias"][0]["value"]) !== -1) {
                filteredTabs.push(tab);
            }
            /* tslint:disable:no-string-literal */
        }

        return filteredTabs;
    }

    /**
     * Sets active tab in lobby
     */
    private setActiveTab() {
        const activeTabClass = this.getActiveTab();
        const contTab = this.element.querySelector(".game-lobby-container");
        const activeTab = this.element.querySelector(".tab-" + activeTabClass);

        if (activeTab) {
            utility.addClass(activeTab, "active");
        }
        if (activeTabClass) {
            utility.addClass(contTab, activeTabClass);
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
     * Event listener for url hash change
     */
    private listenHashChange() {
        utility.listen(window, "hashchange", (event, src: any) => {
            if (ComponentManager.getAttribute("product") === "mobile-live-dealer") {
                this.setLobby();
            }
        });
    }

    /**
     * Event listener for url hash change
     */
    private listenToScroll() {
        utility.listen(window, "scroll", (event, src) => {
            if (ComponentManager.getAttribute("product") === "mobile-live-dealer") {
                this.lazyLoader.onScrollDown(
                    this.element.querySelector("#game-loader"),
                    this.element.querySelector("#game-container"),
                );
            }
        });
    }

    /**
     * Event listener for game item click
     */
    private listenClickGameTile() {
        ComponentManager.subscribe("click", (event, src, data) => {
            const el = utility.hasClass(src, "game-listing-item", true);
            this.showLogin(el);
        });
    }

    /**
     * Event listener for game item click
     */
    private listenClickTab() {
        ComponentManager.subscribe("click", (event, src, data) => {
            const el = utility.hasClass(src, "lobby-tab", true);
            if (el) {
                const contTab = this.element.querySelector(".game-container");
                const tabEl = this.element.querySelector("#providers-filter-transfer-container");
                const prevActiveTab = tabEl.querySelector(".pft-item a.active");

                if (prevActiveTab.getAttribute("data-alias") !== el.querySelector("a").getAttribute("data-alias")) {
                    utility.removeClass(contTab, prevActiveTab.getAttribute("data-alias"));
                }
            }
        });
    }

    /**
     * Event listener for quick launcher tab
     */
    private listenClickLauncherTab() {
        ComponentManager.subscribe("click", (event, src, data) => {
            let el = utility.hasClass(src, "game-providers-tab", true);
            if (el) {
                el = el.querySelector("a");
                if (el.getAttribute("data-game-provider")) {
                    this.showLogin(el);
                }
            }
        });
    }

    private quickLaunchActiveListener() {
        if (this.getActiveTab() === "providers") {
            utility.addClass(document.querySelectorAll(".providers-tab")[0], "active");
        }
    }

    /**
     * Event listener for launching pop up loader
     */
    private listenToLaunchGameLoader() {
        ComponentManager.subscribe("game.launch.loader", (event, src, data) => {
            if (ComponentManager.getAttribute("product") === "mobile-live-dealer") {
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
                if (data.options.target === "popup" || data.options.target === "_blank") {
                    window.open(url);
                    return;
                }

                // Nothing happens if window is blocked and is popup
                if (data.options.target === "popup" || data.options.target === "_blank") {
                    return;
                }

                // handle redirects if we are on a PWA standalone
                if ((navigator.standalone || window.matchMedia("(display-mode: standalone)").matches) ||
                    source === "pwa" &&
                    (data.options.target !== "popup" || data.options.target !== "_blank")
                ) {
                    window.location.href = url;
                    return;
                }
            }
        });
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
