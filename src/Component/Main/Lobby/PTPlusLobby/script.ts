declare var navigator: any;

import * as Promise from "promise-polyfill";

import * as utility from "@core/assets/js/components/utility";
import Swipe from "@app/assets/script/components/custom-touch/swipe";

import * as xhr from "@core/assets/js/vendor/reqwest";

import * as categoriesTemplate from "./handlebars/categories.handlebars";
import * as gameTemplate from "./handlebars/games.handlebars";
import * as tabTemplate from "./handlebars/lobby-tabs.handlebars";

import {GameLauncher} from "@app/src/Module/GameIntegration/scripts/game-launcher";
import {ComponentManager, ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@core/src/Plugins/ComponentWidget/asset/router";

// import {Marker} from "@app/assets/script/components/marker";

import {GamesCollectionSorting} from "./scripts/games-collection-sorting";
import PopupWindow from "@app/assets/script/components/popup";

/**
 *
 */
export class PTPlusLobbyComponent implements ComponentInterface {
    private element: HTMLElement;
    private attachments: any;
    private response: any;
    private isLogin: boolean;
    private gameLauncher;
    private gamesCollectionSort: GamesCollectionSorting;
    private currentPage: number;
    private pager: number;
    private load: boolean;
    private product: any[];
    private state: boolean;
    private windowObject: any;
    private gameLink: string;
    private tabs: any[];
    private productMenu: string = "product-ptplus";

    constructor() {
        this.gameLauncher = GameLauncher;
        this.gamesCollectionSort = new GamesCollectionSorting();
    }

    onLoad(element: HTMLElement, attachments: {
        authenticated: boolean,
        title_weight: number,
        keywords_weight: 0,
        msg_recommended_available: string,
        msg_no_recommended: string,
        product: any[],
        configs: any[],
        pagerConfig: any[],
        tabs: any[],
        infinite_scroll: boolean,
    }) {
        this.response = null;
        this.element = element;
        this.attachments = attachments;
        this.isLogin = attachments.authenticated;
        this.product = attachments.product;
        this.tabs = attachments.tabs;
        this.pager = 0;
        this.load = true;
        this.listenChangeCategory();
        this.listenHashChange();
        this.listenClickGameTile();
        this.listenGameLaunch();
        this.generateLobby(() => {
            this.highlightMenu();
            this.lobby();
        });
        this.moveCategory();
        // this.listenToCategory();
        // this.listenToSwipe();
        // this.initMarker();
        this.pager = 0;
        this.currentPage = 0;
        this.load = true;
        this.listenToLaunchGameLoader();
        this.componentFinish();
        this.listenClickTab();
    }

    onReload(element: HTMLElement, attachments: {
        authenticated: boolean,
        title_weight: number,
        keywords_weight: 0,
        msg_recommended_available: string,
        msg_no_recommended: string,
        product: any[],
        configs: any[],
        pagerConfig: any[],
        tabs: any[],
        infinite_scroll: boolean,
    }) {
        if (!this.element) {
            this.listenChangeCategory();
            this.listenHashChange();
            this.listenClickGameTile();
            this.listenGameLaunch();
            // this.listenToCategory();
            this.listenToLaunchGameLoader();
            this.listenClickTab();
        }
        this.response = null;
        this.element = element;
        this.attachments = attachments;
        this.isLogin = attachments.authenticated;
        this.product = attachments.product;
        this.tabs = attachments.tabs;
        this.pager = 0;
        this.load = true;
        this.generateLobby(() => {
            this.highlightMenu();
            this.lobby();
        });
        this.moveCategory();
        // this.listenToSwipe();
        // this.initMarker();

        this.pager = 0;
        this.currentPage = 0;
        this.load = true;
        this.componentFinish();
    }

    private componentFinish() {
        ComponentManager.broadcast("token.parse", {
            element: this.element,
            method: "parseLink",
            selector: "[href*=ticket\\.token]",
        });
    }

    private highlightMenu() {
        ComponentManager.broadcast("menu.highlight", { menu: this.productMenu });
    }

    private moveCategory() {
        const container = document.querySelector("#categories-container");
        const categoriesEl = document.querySelector("#game-categories");

        container.appendChild(categoriesEl);
    }

    /**
     * Initialized games lobby
     */
    private generateLobby(callback) {
        if (!this.response) {
            this.doRequest(callback);
        } else {
            this.setLobby();
        }
    }

    /**
     * Determines if all xhr succesfully loaded
     */
    private checkPromiseState(list, current, fn) {
        const index = list.indexOf(current);

        if (index > -1) {
            list.splice(index, 1);
        }
        if (list.length === 0) {
            fn();
        }
    }

    private getPagerPromises() {
        const promises = [];
        for (let page = 0; page < this.attachments.pagerConfig.total_pages; page++) {
            promises.push("pager" + page);
        }
        promises.push("recent");
        promises.push("fav");
        promises.push("games-collection");
        return promises;
    }

    private mergeResponsePromises(responses) {
        const promises: any = {
            games: {},
        };
        let gamesDictionary = [];
        const key = "all-games";

        const gamesList = {
            "all-games": {},
            "favorites": {},
            "recently-played": {},
        };

        for (let page = 0; page < this.attachments.pagerConfig.total_pages; page++) {
            if (responses.hasOwnProperty("pager" + page)) {
                const response = responses["pager" + page];
                Object.assign(promises, response);
                if (typeof response.games["all-games"] !== "undefined") {
                    gamesList[key] = this.getGamesList(
                        key,
                        response.games[key],
                        gamesList[key],
                    );
                }
            }
        }

        if (responses.hasOwnProperty("fav")) {
            const keyfav = "favorites";
            gamesList[keyfav] = this.getGamesDefinition(responses.fav, gamesList[key]);
        }

        if (responses.hasOwnProperty("recent")) {
            gamesList["recently-played"] = this.getGamesDefinition(responses.recent, gamesList[key]);
        }

        if (responses.hasOwnProperty("games-collection")) {
            promises.gamesCollection = responses["games-collection"];
        }

        promises.games = gamesList;
        gamesDictionary = this.getGamesDictionary(gamesList[key]);
        gamesList[key] = this.gamesCollectionSort.sortGamesCollection(
            promises,
            "all-games",
            true,
            gamesDictionary,
        );

        return promises;
    }

    /*
    * Converts all games object to array
    */
    private getGamesDictionary(gamesList) {
        const gamesDictionary = [];
        for (const gamesId in gamesList) {
            if (gamesList.hasOwnProperty(gamesId)) {
                gamesDictionary.push(gamesList[gamesId]);
            }
        }

        return gamesDictionary;
    }

    private getGamesList(key, list, gamesList) {
        for (const id in list) {
            if (list.hasOwnProperty(id)) {
                const game = list[id];
                if (key !== "all-games") {
                    gamesList[Object.keys(gamesList).length] = game;
                }
                if (!gamesList[id]) {
                    gamesList[id] = game;
                }
            }
        }
        return gamesList;
    }

    private getGamesDefinition(gamesList, allGames) {
        const games = [];
        for (const id of gamesList) {
            if (allGames.hasOwnProperty(id)) {
                games.push(allGames[id]);
            }
        }

        return games;
    }

    /*
    * List of favorites games, used for toggle of favorites
    * list status.
    */
    private getFavoritesList(favorites) {
        const favoritesList = {};
        for (const id of favorites) {
            favoritesList[id.substr(3)] = "active";
        }

        return favoritesList;
    }

    /**
     * Request games lobby to games lobby component controller lobby method
     */
    private doRequest(callback) {
        const promises = this.getPagerPromises();
        const lobbyRequests = this.createRequest();
        const pageResponse: {} = {};
        for (const id in lobbyRequests) {
            if (lobbyRequests.hasOwnProperty(id)) {
                const currentRequest = lobbyRequests[id];
                let uri = Router.generateRoute("ptplus_lobby", currentRequest.type);
                if (currentRequest.hasOwnProperty("page")) {
                    uri = utility.addQueryParam(uri, "page", currentRequest.page.toString());
                }
                if (currentRequest.hasOwnProperty("product")) {
                    uri = utility.addQueryParam(uri, "product", currentRequest.product.toString());
                }
                xhr({
                    url: uri,
                    type: "json",
                }).then((response) => {
                    pageResponse[id] = response;

                    this.checkPromiseState(promises, id, () => {
                        const mergeResponse = this.mergeResponsePromises(pageResponse);

                        // clone respone object
                        const newResponse = Object.assign({}, mergeResponse);
                        newResponse.games = this.getCategoryGames(newResponse);
                        newResponse.categories = this.filterCategories(newResponse.categories, newResponse.games);
                        if (pageResponse.hasOwnProperty("fav")) {
                            const key = "fav";
                            const favoritesList = pageResponse[key];
                            newResponse.favorite_list = this.getFavoritesList(favoritesList);
                        }
                        this.response = newResponse;
                        if (callback) {
                            callback();
                        }
                    });
                }).fail((error, message) => {
                    console.log(error);
                });
            }
        }
    }

    private filterCategories(categories, gamesList) {
        const filteredCategory: any = [];
        for (const category of categories) {
            if (gamesList.hasOwnProperty(category.field_games_alias)
                && gamesList[category.field_games_alias].length) {
                filteredCategory.push(category);
            }
        }

        return filteredCategory;
    }

    private createRequest() {
        const req: any = {};
        for (let page = 0; page < this.attachments.pagerConfig.total_pages; page++) {
            req["pager" + page] = {
                type: "lobby",
                page,
            };
        }

        req.recent = {
            type: "getRecentlyPlayed",
        };
        req.fav = {
            type: "getFavorites",
        };
        req["games-collection"] = {
            type: "collection",
        };

        return req;
    }

    private lobby() {
        this.setLobby();
    }

    /**
     * Populate lobby with the set response
     */
    private setLobby(key?: string) {
        if (!key) {
            key = this.response.categories[0].field_games_alias;
            key = this.getActiveCategory(this.response.games, key);
        }
        this.setCategories(this.response.categories, key);
        this.setGames(this.response.games[key], key);
        this.displayCategoryPageContent();
        this.populateTabs();
    }

    /**
     * Set the category in the template
     *
     */
    private setCategories(data, key) {
        const categoriesEl = document.querySelector("#game-categories");
        const template = categoriesTemplate({
            categories: data,
            active: key,
            configs: this.attachments.configs,
        });

        if (categoriesEl) {
            categoriesEl.innerHTML = template;
        }

        ComponentManager.broadcast("category.set", {
            scroll: false,
        });

        // this.onLoadActiveMore();
    }

    /**
     * Get the hash in the url or the first returned category
     *
     */
    private getActiveCategory(gamesList, key) {
        const hash = utility.getHash(window.location.href);

        if (gamesList.hasOwnProperty(hash) && gamesList[hash].length > 0) {
            return hash;
        }

        return key;
    }

    /**
     * Set the games list in the template
     */
    private setGames(data, activeCategory: string = " ", page: number = 0, isRecommend = false) {
        const gamesEl = this.element.querySelector("#game-container");
        const pager = this.getPagedContent(data);

        let template = gameTemplate({
            games: pager[page],
            favorites: this.response.favorite_list,
            isLogin: this.isLogin,
            isRecommended: isRecommend,
            isAllGames: activeCategory === "all-games",
        });

        if (this.currentPage > page) {
            template = "";
            for (let ctr = 0; ctr <= this.currentPage; ctr++) {
                template += gameTemplate({
                    games: pager[ctr],
                    favorites: this.response.favorite_list,
                    isLogin: this.isLogin,
                    isAllGames: activeCategory === "all-games",
                });
            }
        }

        if (gamesEl) {
            gamesEl.innerHTML = template;
            const loaders = gamesEl.querySelectorAll(".game-loader");
            if (loaders.length > 1) {
                for (let ctr = 0; ctr < loaders.length - 1; ctr++) {
                    loaders[ctr].remove();
                }
            }
        }
    }

    /**
     * Event listener for category click
     */
    private listenChangeCategory() {
        ComponentManager.subscribe("click", (event: Event, src) => {
            const first = this.response.categories[0].field_games_alias;
            const key = this.getActiveCategory(this.response.games, first);
            const categoriesEl = document.querySelector("#game-categories");

            if (utility.hasClass(src, "game-category-item", true) &&
                !utility.hasClass(src, "game-category-more", true) ||
                utility.hasClass(src, "category-provider-menu", true)
            ) {
                this.currentPage = 0;
                window.location.hash = "";
                ComponentManager.broadcast("category.change");
            }
        });
    }

    /**
     * Event listener for category click
     */
    private listenHashChange() {
        utility.listen(window, "hashchange", (event, src: any) => {
            if (ComponentManager.getAttribute("product") === "mobile-ptplus") {
                // this.currentPage = 0;
                // const first = this.response.categories[0].field_games_alias;
                // const key = this.getActiveCategory(this.response.games, first);
                // let sidebar = false;
                // if (utility.getHash(window.location.href) !== key &&
                //     key !== first
                // ) {
                //     window.location.hash = key;
                // }

                // const categoriesEl = document.querySelector("#game-categories");
                // // const activeLink = categoriesEl.querySelector(".category-tab .active a");

                // // Add active to categories
                // const actives = categoriesEl.querySelectorAll(".category-" + key);

                // if (actives.length === 1) {
                //     src = categoriesEl.querySelector(".game-category-more");
                //     utility.addClass(src, "active");
                //     sidebar = true;
                // }

                // for (const id in actives) {
                //     if (actives.hasOwnProperty(id)) {
                //         const active = actives[id];
                //         utility.addClass(active, "active");
                //         if (!sidebar) {
                //             utility.addClass(active.parentElement, "active");
                //         }
                //     }
                // }

                // this.setGames(this.response.games[key], key);
                // ComponentManager.broadcast("category.change");

            }
        });
    }

    // private onLoadActiveMore() {
    //     const categoriesEl = document.querySelector("#game-categories");
    //     const activeLink = categoriesEl.querySelector(".category-tab .active a");
    //     if (!utility.hasClass(activeLink, "category-tab")) {
    //         const src = categoriesEl.querySelector(".game-category-more");
    //         utility.addClass(src, "active");
    //     }
    // }

    /**
     * Event listener for game item click
     */
    private listenClickGameTile() {
        ComponentManager.subscribe("click", (event, src, data) => {
            const el = utility.hasClass(src, "game-listing-item", true);
            if (el && !this.isLogin) {
                ComponentManager.broadcast("header.login", {
                    src: el,
                    productVia: this.product[0].login_via,
                    regVia: this.product[0].reg_via,
                });
            }
        });
    }

    /**
     * Event listener for game item click
     */
    private listenGameLaunch() {
        ComponentManager.subscribe("game.launch", (event, src, data) => {
            const el = utility.hasClass(data.src, "game-list", true);
            if (el) {
                const gameCode = el.getAttribute("data-game-code");
                xhr({
                    url: Router.generateRoute("ptplus_lobby", "recent"),
                    type: "json",
                    method: "post",
                    data: {
                        gameCode,
                    },
                }).then((result) => {
                    if (result.success) {
                        this.response = null;
                    }
                }).fail((error, message) => {
                    console.log(error);
                });
            }
        });
    }

    private isSeen(el) {
        if (el) {
            return el.getBoundingClientRect().bottom <= window.innerHeight;
        }
    }

    private getPagedContent(data) {
        const temp = data.slice(0);
        const batch: any = [];

        if (!this.attachments.infinite_scroll) {
            batch.push(temp);
            return batch;
        }

        while (temp.length > 0) {
            batch.push(temp.splice(0, 4));
        }
        this.pager = batch.length;

        return batch;
    }

    private getCategoryGames(response) {
        // let gamesList: any = [];
        const gamesList: any = [];
        const allGames = response.games["all-games"];
        for (const gameId in allGames) {
            if (allGames.hasOwnProperty(gameId)) {
                const game = allGames[gameId];
                for (const key in game.categories) {
                    if (game.categories.hasOwnProperty(key)) {
                        const category = game.categories[key];
                        const notAllGames = (key !== "all-games");

                        if (!gamesList.hasOwnProperty(key)
                            && notAllGames
                        ) {
                            gamesList[key] = [];
                        }

                        if (typeof gamesList[key] !== "undefined"
                            && !(game.game_code in gamesList[key])
                            && notAllGames
                        ) {
                            gamesList[key].push(game);
                        }
                    }
                }
            }
        }

        /* tslint:disable:no-string-literal */
        gamesList["all-games"] = response.games["all-games"];
        response.games = gamesList;
        return gamesList;
    }

    /**
     * Event listener for launching pop up loader
     */
    private listenToLaunchGameLoader() {
        ComponentManager.subscribe("game.launch.loader", (event, src, data) => {
            if (ComponentManager.getAttribute("product") === "mobile-ptplus") {
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
                    this.windowObject = PopupWindow(url, "gameWindow", prop);
                }

                if (!this.windowObject && (data.options.target === "popup" || data.options.target === "_blank")) {
                    return;
                }
            }
        });
    }

    /**
     * Event listener for floating footer item click
     */
     private listenClickTab() {
        ComponentManager.subscribe("click", (event, src, data) => {
            const el = utility.hasClass(src, "footer-mobile-item", true);
            if (el) {
                const dataAlias = el.querySelector("a").getAttribute("data-alias");
                const activeTab = document.querySelector(".tab-" + dataAlias);
                const allTabs = el.parentElement.querySelectorAll("a");
                for (const allTab of allTabs) {
                    this.makeInactive(allTab);
                }
                this.makeActive(el.querySelector("a"));
                if (dataAlias === "game-categories") {
                    document.querySelector(".home-page").setAttribute("style", "display: none");
                    document.querySelector(".category-page").setAttribute("style", "display: block");
                } else {
                    document.querySelector(".home-page").setAttribute("style", "display: block");
                    document.querySelector(".category-page").setAttribute("style", "display: none");
                }
            }
        });
    }

    private makeActive(activeTab) {
        if (!(utility.hasClass(activeTab, "active"))) {
            utility.addClass(activeTab, "active");
        }
        activeTab.querySelector("img.active").setAttribute("style", "display: block");
        activeTab.querySelector("img.inactive").setAttribute("style", "display: none");
    }

    private makeInactive(activeTab) {
        if (utility.hasClass(activeTab, "active")) {
            utility.removeClass(activeTab, "active");
        }
        activeTab.querySelector("img.active").setAttribute("style", "display: none");
        activeTab.querySelector("img.inactive").setAttribute("style", "display: block");
    }

    private displayCategoryPageContent() {
        const hash = utility.getHash(window.location.href);
        const homePageContent = document.querySelector(".home-page");
        const categoryPageContent = document.querySelector(".category-page");
        const activeTab = document.querySelector(".tab-" + hash);
        if (hash === "game-categories") {
            this.makeActive(activeTab);
            document.querySelector(".category-page").setAttribute("style", "display: block");
            document.querySelector(".home-page").setAttribute("style", "display: none");
        } else {
            this.makeActive(activeTab);
            document.querySelector(".home-page").setAttribute("style", "display: block");
            document.querySelector(".category-page").setAttribute("style", "display: none");
        }
    }

    /**
     * Populate lobby tabs
     */
    private populateTabs() {
        const tabsEl = this.element.querySelector("#lobby-tab-filter");
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
}
