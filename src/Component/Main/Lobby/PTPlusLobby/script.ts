declare var navigator: any;

import * as Promise from "promise-polyfill";

import * as utility from "@core/assets/js/components/utility";

import * as xhr from "@core/assets/js/vendor/reqwest";

import * as categoriesTemplate from "./handlebars/categories.handlebars";
import * as rectangularGameTemplate from "./handlebars/games-rectangular.handlebars";
import * as gameTemplate from "./handlebars/games.handlebars";

import {GameLauncher} from "@app/src/Module/GameIntegration/scripts/game-launcher";
import {ComponentManager, ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@core/src/Plugins/ComponentWidget/asset/router";

import {GamesSearch} from "./scripts/games-search";
import {GamesFilter} from "@app/assets/script/components/games-filter";

import {GamesCollectionSorting} from "./scripts/games-collection-sorting";
import PopupWindow from "@app/assets/script/components/popup";

/**
 * PTPlusLobbyComponent Class
 */
export class PTPlusLobbyComponent implements ComponentInterface {
    private element: HTMLElement;
    private attachments: any;
    private response: any;
    private isLogin: boolean;
    private gameLauncher;
    private gamesSearch: GamesSearch;
    /*private gamesFilter: GamesFilter;*/
    private gamesCollectionSort: GamesCollectionSorting;
    private currentPage: number;
    private pager: number;
    private load: boolean;
    private product: any[];
    private state: boolean;
    private windowObject: any;
    private gameLink: string;
    private pageData: any[];
    private filterFlag: string;
    private groupedGames: any;
    private productMenu: string = "product-ptplus";

    constructor() {
        this.gameLauncher = GameLauncher;
        this.gamesSearch = new GamesSearch();
        /*this.gamesFilter = new GamesFilter();*/
        this.gamesCollectionSort = new GamesCollectionSorting();
    }

    onLoad(element: HTMLElement, attachments: {
        authenticated: boolean,
        title_weight: number,
        keywords_weight: 0,
        search_no_result_msg: string,
        search_blurb: string,
        msg_recommended_available: string,
        msg_no_recommended: string,
        product: any[],
        configs: any[],
        pagerConfig: any[],
        pageData: any[],
        infinite_scroll: boolean,
    }) {
        this.groupedGames = undefined;
        this.response = null;
        this.element = element;
        this.attachments = attachments;
        this.isLogin = attachments.authenticated;
        this.product = attachments.product;
        this.pageData = attachments.pageData;
        this.pager = 0;
        this.load = true;
        this.listenClickGameTile();
        this.listenGameLaunch();
        this.listenFavoriteClick();
        this.listenToLaunchGameLoader();
        this.generateLobby(() => {
            this.lobby();
        });
        this.pager = 0;
        this.currentPage = 0;
        this.load = true;
        this.componentFinish();
        this.listenClickTab();
        this.activeLinks();
        this.listenHashChange();
        this.setPlaceholder();
        this.gamesSearch.handleOnLoad(this.element, attachments);
        /*this.gamesFilter.handleOnLoad(this.element, attachments);*/
    }

    onReload(element: HTMLElement, attachments: {
        authenticated: boolean,
        title_weight: number,
        keywords_weight: 0,
        search_no_result_msg: string,
        search_blurb: string,
        msg_recommended_available: string,
        msg_no_recommended: string,
        product: any[],
        configs: any[],
        pagerConfig: any[],
        pageData: any[],
        infinite_scroll: boolean,
    }) {
        if (!this.element) {
            this.listenClickGameTile();
            this.listenGameLaunch();
            this.listenToLaunchGameLoader();
            this.listenFavoriteClick();
            this.listenClickTab();
            this.listenHashChange();
        }
        this.groupedGames = undefined;
        this.response = null;
        this.element = element;
        this.attachments = attachments;
        this.isLogin = attachments.authenticated;
        this.product = attachments.product;
        this.pageData = attachments.pageData;
        this.pager = 0;
        this.load = true;
        this.generateLobby(() => {
            this.lobby();
        });
        this.pager = 0;
        this.currentPage = 0;
        this.load = true;
        this.componentFinish();
        this.activeLinks();
        this.setPlaceholder();
        this.gamesSearch.handleOnReLoad(this.element, attachments);
        /*this.gamesFilter.handleOnReLoad(this.element, attachments);*/
    }
    /**
     * Active Link for ptplus main page
     */
    private activeLinks() {
        let productLinks: any = [];
        let locationPathname;
        let numberSign;
        let questionMark;
        locationPathname = window.location.pathname;
        numberSign = window.location.href.split("/")[4].split("#")[1];
        questionMark = window.location.href.split("/")[4].split("?")[1];

        if ((typeof numberSign === "undefined" || !numberSign)
            && (typeof questionMark === "undefined" || !questionMark)) {

            productLinks = document.querySelectorAll(".floating-mobile-ptplus .floating-footer > ul > li > a");

            for (const row of productLinks) {
                let productName;
                let productUrl;
                productName = row.dataset.name;
                productUrl = row.hash;

                if (productName === "home") {
                    if (utility.hasClass(document.querySelector('[data-name="home"]'), "lang")) {
                        setTimeout(() => {
                            setTimeout(() => {
                                this.activeLinks();
                            }, 500);
                        }, 2000);
                    }
                    utility.addClass(row, "active");
                    utility.addClass(row, "lang");
                    row.querySelector("img.inactive").setAttribute("style", "display: none");
                    row.querySelector("img.active").setAttribute("style", "display: block");
                }
            }
        }
    }

    private componentFinish() {
        ComponentManager.broadcast("token.parse", {
            element: this.element,
            method: "parseLink",
            selector: "[href*=ticket\\.token]",
        });
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
                        newResponse.games["all-games-search"] = this.groupGamesByContainer(newResponse.games);

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
            if (category.field_games_alias === "favorites") {
                filteredCategory.push(category);
                continue;
            }

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
        this.gamesSearch.setGamesList(this.response);
        /*this.gamesFilter.setGamesList(this.response);*/
        this.setLobby();
    }

    /**
     * Populate lobby with the set response
     */
    private setLobby(key?: string) {
        if (!key) {
            this.homePageContent(key);
            key = utility.getHash(window.location.href);
        }
        if (key !== "game-categories" && key !== "") {
            this.gameCategoryPageContent(key);
        }
        this.displayCategoryPageContent();
    }

    /**
     * Display home page content
     *
     */
    private homePageContent(key?: string) {
        const templateType = "home-page-content";
        for (const category of this.response.categories) {
            if (category.hasOwnProperty("field_games_alias")) {
                key = category.field_games_alias;
                const showAll = category.field_enable_show_all[0] !== undefined ?
                    category.field_enable_show_all[0].value : false;
                const imageSize = category.field_game_tile_image_size[0].value;
                switch (imageSize) {
                    case "field_thumbnail_image":
                        const gameCount = this.response.games[key].length;
                        const sliceGameCount = this.response.games[key].slice(0, 6);
                        const catName = category.name;
                        const pageContent = this.catPageData(catName, key, showAll, gameCount, templateType, "");
                        this.setGames(sliceGameCount, 0, pageContent);
                        break;
                    case "field_game_thumbnail_big":
                        this.setRectagularGame(this.response.games[key], category.name);
                }
                this.setCategories(this.response.categories);
            }
        }

        const favEl = document.querySelector('[data-category-filter-id="favorites"]');
        if (favEl && this.response.games.hasOwnProperty("favorites")) {
            if (!this.isLogin || !this.response.games.favorites.length) {
                favEl.parentElement.setAttribute("style", "display: none");
            }
        }
    }

    /**
     * Display game category page content
     *
     */
    private gameCategoryPageContent(key?: string) {
        for (const category of this.response.categories) {
            if (category.hasOwnProperty("field_games_alias")) {
                const catKey = category.field_games_alias;
                if (key === catKey) {
                    const catName = category.name;
                    const templateType = "category-game-content";
                    const backUrlHash = key;
                    const pageContent = this.catPageData(catName, 0, false, 0, templateType, backUrlHash);
                    const gameActiveEl = document.querySelector('[data-name="games"]');
                    this.makeActive(gameActiveEl);
                    this.setGames(this.response.games[catKey], 0, pageContent);
                }
            }
        }
    }

    /**
     * Set the category in the template
     *
     */
    private setCategories(data) {
        const categoriesEl = document.querySelector("#game-categories");
        const template = categoriesTemplate({
            categories: data,
            pageData: this.pageContentKey("game_categories"),
        });

        if (categoriesEl) {
            categoriesEl.innerHTML = template;
        }

        ComponentManager.broadcast("category.set", {
            scroll: false,
        });
    }

    /**
     * Set the games list in the template
     */
    private setGames(data, page: number = 0, pageContent: object = {}) {
        const gamesEl = this.element.querySelector("#game-container");
        const pager = this.getPagedContent(data);
        const showAllText = this.pageContentKey("show_all");
        let template = gameTemplate({
            games: pager[page],
            favorites: this.response.favorite_list,
            isLogin: this.isLogin,
            categoryName: pageContent[`categoryName`],
            categoryUrl: pageContent[`categoryUrl`],
            displayShowAllText: showAllText,
            enableAllText: pageContent[`enableAll`],
            gameCatCount: pageContent[`gameCount`],
            pageTemplate: pageContent[`templateType`],
            backUrl: pageContent[`backUrl`],
        });

        if (this.currentPage > page) {
            template = "";
            for (let ctr = 0; ctr <= this.currentPage; ctr++) {
                template += gameTemplate({
                    games: pager[ctr],
                    favorites: this.response.favorite_list,
                    isLogin: this.isLogin,
                    categoryName: pageContent[`categoryName`],
                    categoryUrl: pageContent[`categoryUrl`],
                    displayShowAllText: showAllText,
                    enableAllText: pageContent[`enableAll`],
                    gameCatCount: pageContent[`gameCount`],
                    pageTemplate: pageContent[`templateType`],
                    backUrl: pageContent[`backUrl`],
                });
            }
        }
        if (gamesEl) {
            if (pageContent[`templateType`] === "home-page-content") {
                gamesEl.innerHTML += template;
            } else if (pageContent[`templateType`] === "category-game-content") {
                gamesEl.innerHTML = template;
            }
        }
    }

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
            if (ComponentManager.getAttribute("product") === "mobile-ptplus") {
                ComponentManager.broadcast("clickstream.game.launch", {
                    srcEl: data.src,
                    product: ComponentManager.getAttribute("product"),
                    response: data.response,
                });
            }
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
                        this.doRequest(() => {
                            this.gamesSearch.setGamesList(this.response);
                            /*this.gamesFilter.setGamesList(this.response);*/
                        });
                    }
                }).fail((error, message) => {
                    console.log(error);
                });
            }
        });
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

                // handle redirects if we are on a PWA standalone
                if ((navigator.standalone || window.matchMedia("(display-mode: standalone)").matches) ||
                    source === "pwa" || data.options.target === "_self" || data.options.target === "_top" &&
                    (data.options.target !== "popup" || data.options.target !== "_blank")
                ) {
                    window.location.href = url;
                    return;
                }
            }
        });
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
        let gamesList: any = [];
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
        gamesList["favorites"] = response.games["favorites"];
        gamesList["recently-played"] = response.games["recently-played"];
        gamesList["all-games"] = response.games["all-games"];
        response.games = gamesList;
        /* Sorting of top games collection */
        gamesList = this.doSortCategoryGames(response, gamesList);
        return gamesList;
    }

    private doSortCategoryGames(response, gamesList) {
        const sortedGamesList: any = [];
        const exemptFromSort: any = ["all-games", "favorites", "recently-played"];

        /* tslint:disable:no-string-literal */
        sortedGamesList["all-games"] = response.games["all-games"];
        sortedGamesList["favorites"] = response.games["favorites"];
        sortedGamesList["recently-played"] = response.games["recently-played"];

        for (const category in gamesList) {
            if (exemptFromSort.indexOf(category) !== -1) {
                continue;
            }

            if (response.gamesCollection.top && response.gamesCollection.top.hasOwnProperty(category)) {
                sortedGamesList[category] = this.gamesCollectionSort.sortGamesCollection(
                    gamesList[category],
                    response.gamesCollection.top[category],
                );
            } else {
                sortedGamesList[category] = this.gamesCollectionSort.sortGameTitleAlphabetical(
                    gamesList[category],
                );
            }

            if (response.gamesCollection.recommended && response.gamesCollection.recommended.hasOwnProperty(category)) {
                sortedGamesList[category] = this.gamesCollectionSort.sortGamesCollection(
                    gamesList[category],
                    response.gamesCollection.recommended[category],
                );
            } else {
                sortedGamesList[category] = this.gamesCollectionSort.sortGameTitleAlphabetical(
                    gamesList[category],
                );
            }
        }

        return sortedGamesList;
    }

    /**
     * Event listener for floating footer item click
     */
    private listenClickTab() {
        ComponentManager.subscribe("click", (event, src, data) => {
            const el = utility.hasClass(src, "footer-mobile-item", true);
            if (el) {
                const allTabs = el.parentElement.querySelectorAll("a");
                for (const allTab of allTabs) {
                    this.makeInactive(allTab);
                }
                this.makeActive(el.querySelector("a"));
            }
            const showAll = utility.hasClass(src, "category-count", true);
            const homeActiveEl = document.querySelector('[data-name="home"]');
            const gameActiveEl = document.querySelector('[data-name="games"]');
            const backArrow = utility.hasClass(src, "back-arrow", true);
            if (showAll) {
                this.makeInactive(homeActiveEl);
                this.makeActive(gameActiveEl);
            }
            if (backArrow) {
                const backArrowHref = document.querySelector('[class="back-arrow"]').getAttribute("href");
                if (backArrowHref === "#") {
                    this.makeInactive(gameActiveEl);
                    this.makeActive(homeActiveEl);
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

        if (hash === "game-categories") {
            const activeTab1 = document.querySelector(".tab-" + hash);
            this.makeActive(activeTab1);
            document.querySelector(".category-page").setAttribute("style", "display: block");
            document.querySelector(".game-container").setAttribute("style", "display: none");
            document.querySelector(".search-page").setAttribute("style", "display: none");
            this.gamesSearch.clearSearchResult();
            this.gamesSearch.clearSearchBlurbPreview();
        } else if (hash === "game-search") {
            const activeTab2 = document.querySelector(".tab-" + hash);
            this.makeActive(activeTab2);
            document.querySelector(".search-page").setAttribute("style", "display: block");
            document.querySelector(".category-page").setAttribute("style", "display: none");
            document.querySelector(".game-container").setAttribute("style", "display: none");
        } else {
            document.querySelector(".game-container").setAttribute("style", "display: block");
            document.querySelector(".category-page").setAttribute("style", "display: none");
            document.querySelector(".search-page").setAttribute("style", "display: none");
            this.gamesSearch.clearSearchResult();
            this.gamesSearch.clearSearchBlurbPreview();
        }
    }

    /**
     * Set Rectangular Game Template
     */
    private setRectagularGame(data, categoryTitle) {
        const rectGameEl = this.element.querySelector("#game-container");
        const template = rectangularGameTemplate({
            games: data,
            favorites: this.response.favorite_list,
            categoryName: categoryTitle,
            isLogin: this.isLogin,
        });

        if (rectGameEl) {
            rectGameEl.innerHTML += template;
        }
    }

    /**
     * Event listener for game item click
     */
    private listenFavoriteClick() {
        ComponentManager.subscribe("click", (event, src) => {
            const el = utility.hasClass(src, "game-favorite", true);
            if (el && this.isLogin) {
                utility.toggleClass(el, "active");
                const gameCode = el.parentElement.getAttribute("data-game-code");
                xhr({
                    url: Router.generateRoute("ptplus_lobby", "favorite"),
                    type: "json",
                    method: "post",
                    data: {
                        gameCode,
                    },
                }).then((result) => {
                    if (result.success) {
                        this.response = null;
                        this.doRequest(() => {
                            this.gamesSearch.setGamesList(this.response);
                            /*this.gamesFilter.setGamesList(this.response);*/

                            if (this.filterFlag === "favorites") {
                                if (typeof this.response.games[this.filterFlag] === "undefined") {
                                    this.setLobby();
                                }

                                if (typeof this.response.games[this.filterFlag] !== "undefined") {
                                    this.setGames(this.response.games[this.filterFlag]);
                                }
                            }
                        });

                        ComponentManager.broadcast("games.favorite", {srcElement: el});
                        this.getFavoritesData();
                    }
                }).fail((error, message) => {
                    console.log(error);
                });
            }
        });
    }

    private getFavoritesData() {
        xhr({
            url: Router.generateRoute("ptplus_lobby", "getFavorites"),
            type: "json",
        }).then((result) => {
            if (result) {
                this.response.favorite_list = this.getFavoritesList(result);
                this.updateFavoritesData(result);
                this.updateFavoritesStyles(this.response.favorite_list);
            }
        }).fail((error, message) => {
            console.log(error);
        });
    }

    private updateFavoritesData(data) {
        const temp = [];
        const category = {
            name: "Favorites",
            key: "favorites",
        };
        const categoriesEl = document.querySelector("[data-category-id=" + category.key + "]");
        const favEl = document.querySelector('[data-category-filter-id="favorites"]');

        for (const id of data) {
            if (this.response.games["all-games"].hasOwnProperty(id)) {
                temp.push(this.response.games["all-games"][id]);
            }
        }
        this.response.games["favorites"] = temp;
        const template = gameTemplate({
            games: temp,
            favorites: this.response.favorite_list,
            isLogin: this.isLogin,
            categoryName: category.name,
            categoryUrl: category.key,
            displayShowAllText: "",
            enableAllText: "",
            gameCatCount: "",
            pageTemplate: "home-page-content",
            backUrl: "",
        });

        if (categoriesEl) {
            categoriesEl.outerHTML = template;
        }

        if (temp.length) {
            favEl.parentElement.setAttribute("style", "display: block");
        } else {
            favEl.parentElement.setAttribute("style", "display: none");
        }
    }

    private updateFavoritesStyles(favoriteList) {
        const els = document.querySelectorAll(".game-listing-item");
        for (const el of Array.from(els)) {
            const gameCode = el.getAttribute("data-game-code");
            const childEl = el.querySelector(".game-favorite");
            if (!childEl) {
                continue;
            }

            if (gameCode && favoriteList.hasOwnProperty(gameCode)) {
                if (!utility.hasClass(childEl, "active")) {
                    utility.addClass(childEl, "active");
                }
            } else {
                utility.removeClass(childEl, "active");
            }
        }
    }

    /**
     * Event listener for category click
     */
    private listenHashChange() {
        utility.listen(window, "hashchange", (event, src: any) => {
            if (ComponentManager.getAttribute("product") === "mobile-ptplus") {
                this.currentPage = 0;
                let key;
                const locHref = utility.getHash(window.location.href);
                let backUrlHash = utility.getHash(event.oldURL);
                if (!event.oldURL.includes("#")) {
                    backUrlHash = "";
                }
                const gamesEl = this.element.querySelector("#game-container");
                for (const category of this.response.categories) {
                    if (category.hasOwnProperty("field_games_alias")) {
                        key = category.field_games_alias;
                        if (locHref === key) {
                            const templateType = "category-game-content";
                            const catName = category.name;
                            const pageContent = this.catPageData(catName, 0, false, 0, templateType, backUrlHash);
                            this.setGames(this.response.games[key], 0, pageContent);
                        }
                    }
                }
                if (locHref === "game-categories") {
                    document.querySelector(".game-container").setAttribute("style", "display: none");
                    document.querySelector(".category-page").setAttribute("style", "display: block");
                    document.querySelector(".search-page").setAttribute("style", "display: none");
                    this.gamesSearch.clearSearchResult();
                    this.gamesSearch.clearSearchBlurbPreview();
                } else if (locHref === "game-search") {
                    document.querySelector(".game-container").setAttribute("style", "display: none");
                    document.querySelector(".category-page").setAttribute("style", "display: none");
                    document.querySelector(".search-page").setAttribute("style", "display: block");
                } else if (locHref === "") {
                    document.querySelector(".game-container").setAttribute("style", "display: block");
                    document.querySelector(".category-page").setAttribute("style", "display: none");
                    document.querySelector(".search-page").setAttribute("style", "display: none");
                    gamesEl.innerHTML = "";
                    this.homePageContent(key);
                    this.gamesSearch.clearSearchResult();
                    this.gamesSearch.clearSearchBlurbPreview();
                } else {
                    document.querySelector(".game-container").setAttribute("style", "display: block");
                    document.querySelector(".category-page").setAttribute("style", "display: none");
                    document.querySelector(".search-page").setAttribute("style", "display: none");
                    this.gamesSearch.clearSearchResult();
                    this.gamesSearch.clearSearchBlurbPreview();
                }
            }
        });
    }

    /**
     * Object for category page data from CMS
     */
    private catPageData(catName, catUrl, enable, count, template, backUrlHash) {
        return {
            categoryName: catName,
            categoryUrl: catUrl,
            enableAll: enable,
            gameCount: count,
            templateType: template,
            backUrl: backUrlHash,
        };
    }

    /**
     * get page content keys
     */
    private pageContentKey(datakey) {
        let pageContentName = "";
        for (const data of this.pageData) {
            if (datakey === data.field_page_content_key[0].value) {
                pageContentName = data.name[0].value;
            }
        }
        return pageContentName;
    }

    /**
     *
     */
    private groupGamesByContainer(gamesList) {
        const groupList: any = [];
        for (const category in gamesList) {
            if (gamesList.hasOwnProperty(category)) {
                const categoryGame = gamesList[category];

                const arrayGameList = [];
                for (const gameKey in categoryGame) {
                    if (categoryGame.hasOwnProperty(gameKey)) {
                        const game = categoryGame[gameKey];
                        arrayGameList.push(game);
                    }
                }

                const temp = arrayGameList.slice(0);
                const batch: any = [];
                while (temp.length > 0) {
                    batch.push(temp.splice(0, 3));
                }

                groupList[category] = batch;
            }
        }

        return groupList;
    }

    /**
     * Set the placeholder for search input
     */
    private setPlaceholder() {
        const searchTag = document.querySelector("input#games-search-input");
        const inputPlacholder = this.pageContentKey("search_for_games");
        searchTag.setAttribute("placeholder", inputPlacholder);
    }
}
