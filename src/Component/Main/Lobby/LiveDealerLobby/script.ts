import {ComponentManager, ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import {Router, RouterClass} from "@core/src/Plugins/ComponentWidget/asset/router";
import {QuickLauncher} from "./scripts/quick-launcher";
import PopupWindow from "@app/assets/script/components/popup";
import * as Handlebars from "handlebars/runtime";
import * as gameTemplate from "./handlebars/games.handlebars";
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
    onLoad(element: HTMLElement, attachments: {
            authenticated: boolean,
            product: any[],
            tabs: any[],
            configs: any[],
        }) {
        this.attachments = attachments;
        this.element = element;
        this.isLogin = attachments.authenticated;
        this.product = attachments.product;
        this.tabs = attachments.tabs;
        this.doGetLobbyData(() => {
            this.setLobby();
        });
        this.listenHashChange();
        this.listenClickTab();
        this.listenClickGameTile();
        this.listenClickLauncherTab();
        this.listenToLaunchGameLoader();
    }

    onReload(element: HTMLElement, attachments: {
            authenticated: boolean,
            product: any[],
            tabs: any[],
            configs: any[],
        }) {
        if (!this.element) {
            this.listenHashChange();
            this.listenClickTab();
            this.listenClickGameTile();
            this.listenClickLauncherTab();
        }
        this.attachments = attachments;
        this.element = element;
        this.isLogin = attachments.authenticated;
        this.product = attachments.product;
        this.tabs = attachments.tabs;
        this.doGetLobbyData(() => {
            this.setLobby();
        });
        this.listenToLaunchGameLoader();
    }

    /**
     * Request games list from cms
     */
    private doGetLobbyData(callback) {
        xhr({
            url: Router.generateRoute("live_dealer_lobby", "lobby"),
            type: "json",
        }).then((response) => {
            const groupedGames = this.groupGamesByTab(response);
            this.groupedGames = this.sortGamesByTab(groupedGames);
            if (callback) {
                callback();
            }
        }).fail((error, message) => {
            console.log(error);
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
        if (this.groupedGames.hasOwnProperty("providers")) {
            const quickLauncher = new QuickLauncher(this.attachments.configs);
            quickLauncher.activate(this.groupedGames.providers, this.getActiveTab());
        }
        this.populateTabs();
        this.populateGames();
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
    private populateGames() {
        const gamesEl = this.element.querySelector("#game-container");
        const template = gameTemplate({
            games: this.groupedGames[this.getActiveTab()],
        });

        if (gamesEl) {
            gamesEl.innerHTML = template;
        }
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
        const contTab = this.element.querySelector(".game-container");
        const activeTab = this.element.querySelector(".tab-" + activeTabClass);

        if (activeTab) {
            utility.addClass(activeTab, "active");
            utility.addClass(contTab, activeTabClass);
        }
    }

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
            this.setLobby();
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
            const el = utility.hasClass(src, "game-providers-tab", true);
            this.showLogin(el);
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
            // Pop up loader with all data
            const prop = {
                width: 360,
                height: 720,
                scrollbars: 1,
                scrollable: 1,
                resizable: 1,
            };

            let url = "/game/loader";

            const params = utility.getAttributes(data.src);

            for (const key in params) {
                if (params.hasOwnProperty(key)) {
                    const param = params[key];

                    if (key.indexOf("data-") === 0) {
                        url = utility.addQueryParam(url, key.replace("data-game-", ""), param);
                    }
                }
            }

            this.windowObject = PopupWindow(url, "gameWindow", prop);
        });
    }
}
