declare var navigator: any;

import * as utility from "@core/assets/js/components/utility";
import Swipe from "@app/assets/script/components/custom-touch/swipe";
import * as Handlebars from "handlebars/runtime";

import * as xhr from "@core/assets/js/vendor/reqwest";

import * as categoriesTemplate from "./handlebars/categories.handlebars";
import * as gameTemplate from "@app/assets/script/components/handlebars/games.handlebars";

import {GameLauncher} from "@app/src/Module/GameIntegration/scripts/game-launcher";
import {ComponentManager, ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@core/src/Plugins/ComponentWidget/asset/router";

import {Loader} from "@app/assets/script/components/loader";
import {GamesSearch} from "./scripts/games-search";
import {GamesCollectionSorting} from "./scripts/games-collection-sorting";
import PopupWindow from "@app/assets/script/components/popup";

/**
 *
 */
export class SodaCasinoLobbyComponent implements ComponentInterface {
    private element: HTMLElement;
    private attachments: any;
    private response: any;
    private isLogin: boolean;
    private sodaConfigs: any;
    private gameLauncher;
    private gamesSearch: GamesSearch;
    private gamesCollectionSort: GamesCollectionSorting;
    private currentPage: number;
    private pager: number;
    private load: boolean;
    private product: any[];
    private searchResults;
    private loader: Loader;
    private fromGameLaunch: boolean = false;
    private lobbyProducts: any[] = ["mobile-soda-casino"];
    private windowObject: any;
    private gameLink: string;
    private productMenu: string = "product-soda-casino";
    private events: {} = {};
    private maintenance: boolean;

    constructor() {
        this.loader = new Loader(document.body, true);
        this.gameLauncher = GameLauncher;
        this.gamesSearch = new GamesSearch();
        this.gamesCollectionSort = new GamesCollectionSorting();
    }

    onLoad(element: HTMLElement, attachments: {
            authenticated: boolean,
            title_weight: number,
            keywords_weight: 0,
            search_no_result_msg: string,
            filter_no_result_msg: string,
            search_blurb: string,
            msg_recommended_available: string,
            msg_no_recommended: string,
            soda_configs: any,
            product: any[],
            infinite_scroll: boolean,
            maintenance: boolean,
        }) {
        this.response = null;
        this.element = element;
        this.attachments = attachments;
        this.isLogin = attachments.authenticated;
        this.product = attachments.product;
        this.sodaConfigs = attachments.soda_configs;
        this.pager = 0;
        this.currentPage = 0;
        this.load = true;
        this.maintenance = attachments.maintenance;
        this.checkMaintenance();
        this.updateHeader();
        this.listenChangeCategory();
        this.listenHashChange();
        this.listenClickGameTile();
        this.listenGameLaunch();
        this.listenFavoriteClick();
        this.generateLobby(() => {
            this.highlightMenu();
            this.lobby();
        });
        this.listenToCategory();
        this.listenToScroll();
        this.listenToSwipe();
        this.listenOnSearch();
        this.pager = 0;
        this.currentPage = 0;
        this.load = true;
        this.gamesSearch.handleOnLoad(this.element, attachments);
        this.listenToLaunchGameLoader();
    }

    onReload(element: HTMLElement, attachments: {
            authenticated: boolean,
            title_weight: number,
            keywords_weight: 0,
            search_no_result_msg: string,
            filter_no_result_msg: string,
            search_blurb: string,
            msg_recommended_available: string,
            msg_no_recommended: string,
            soda_configs: any,
            product: any[],
            infinite_scroll: boolean,
            maintenance: boolean,
        }) {
        this.isLogin = attachments.authenticated;
        this.maintenance = attachments.maintenance;
        this.checkMaintenance();
        if (!this.element) {
            this.updateHeader();
            this.listenChangeCategory();
            this.listenHashChange();
            this.listenClickGameTile();
            this.listenGameLaunch();
            this.listenFavoriteClick();
            this.listenToCategory();
            this.listenToScroll();
            this.listenOnSearch();
        }
        this.response = null;
        this.element = element;
        this.attachments = attachments;
        this.product = attachments.product;
        this.sodaConfigs = attachments.soda_configs;
        this.pager = 0;
        this.currentPage = 0;
        this.load = true;
        this.generateLobby(() => {
            this.highlightMenu();
            this.lobby();
        });
        this.listenToSwipe();
        this.gamesSearch.handleOnReLoad(this.element, attachments);

        this.pager = 0;
        this.currentPage = 0;
        this.load = true;
        this.listenToLaunchGameLoader();
    }

    private highlightMenu() {
        ComponentManager.broadcast("menu.highlight", { menu: this.productMenu });
    }

    private getActiveIndex(list: HTMLElement) {
        const slides = list.querySelectorAll(".game-category");

        for (const key in slides) {
            if (slides.hasOwnProperty(key)) {
                const slide = slides[key];
                if (utility.hasClass(slide, "active")) {
                    return key + 1;
                }
            }
        }

        return 1;
    }

    private checkMaintenance() {
        const route = ComponentManager.getAttribute("route");

        if (this.maintenance) {
            window.location.href = route + "/maintenance";
        }
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
        const promises = ["allGames", "recent", "fav", "games-collection"];
        return promises;
    }

    private mergeResponsePromises(responses) {
        const promises: any = {
            games: {},
        };
        let gamesDictionary = [];
        const requestKey = "allGames";
        const key = "all-games";

        const gamesList = {
            "all-games": {},
            "favorites": {},
            "recently-played": {},
        };
        if (responses.hasOwnProperty(requestKey)) {
            const response = responses[requestKey];
            Object.assign(promises, response);
            if (typeof response.games["all-games"] !== "undefined") {
                gamesList[key] = this.getGamesList(
                    key,
                    response.games[key],
                    gamesList[key],
                );
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

    private getGamesDefinition(gamesList, allGames) {
        const games = [];
        for (const id of gamesList) {
            if (allGames.hasOwnProperty(id)) {
               games.push(allGames[id]);
            }
        }

        return games;
    }

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
                const uri = Router.generateRoute("soda_casino_lobby", currentRequest.type);
                xhr({
                    url: uri,
                    type: "json",
                    data: {
                        lobbyProduct: ComponentManager.getAttribute("product"),
                    },
                }).then((response) => {
                    pageResponse[id] = response;
                    this.checkPromiseState(promises, id, () => {
                        const mergeResponse = this.mergeResponsePromises(pageResponse);

                        // clone respone object
                        const newResponse = Object.assign({}, mergeResponse);
                        newResponse.games = this.getCategoryGames(newResponse);
                        newResponse.games["recommended-games"] = this.doSortRecommended(newResponse);
                        newResponse.games = this.groupGamesByContainer(newResponse.games);
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

    private createRequest() {
        const req: any = {};
        req.allGames = {
            type: "lobby",
        };

        req.recent = {
            type: "getRecentlyPlayed",
        };
        req.fav = {
            type: "getFavorites",
        };
        req["games-collection"] = {
            type: "getGamesCollection",
        };

        return req;
    }

    private doSortRecommended(newResponse) {
        let sortedRecommended: any = [];
        sortedRecommended = this.gamesCollectionSort.sortGamesCollection(
            newResponse,
            "recommended",
        );

        return sortedRecommended;
    }

    private lobby() {
        this.gamesSearch.setGamesList(this.response);
        this.setLobby();
    }

    /**
     * Populate lobby with the set response
     */
    private setLobby(key?: string) {
        if (!key) {
            key = this.response.categories[0].field_alias;
            key = this.getActiveCategory(this.response.games, key);
        }

        this.setCategories(this.response.categories, key);
        this.setGames(this.response.games[key], key);
    }

    /**
     * Set the category in the template
     *
     */
    private setCategories(data, key) {
        const categoriesEl = this.element.querySelector("#game-categories");

        const template = categoriesTemplate({
            placeholder: this.sodaConfigs.search_placeholder,
            categories: data,
            active: key,
        });

        if (categoriesEl) {
            categoriesEl.innerHTML = template;
        }

        ComponentManager.broadcast("category.set", {
            scroll: false,
        });

        if (key === "search") {
            const activeCategory = utility.getHash(window.location.href);
            const activeLink = categoriesEl.querySelector(".category-" + activeCategory);
            const activeLi = activeLink.parentElement;
            utility.addClass(activeLi, "active");
        }
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
    private setGames(
        data,
        activeCategory: string = " ",
        page: number = 0,
        isRecommend = false,
        container: string = "#game-container") {

        const gamesEl = this.element.querySelector(container);
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
            if (src.getAttribute("data-category-filter-id")) {
                const categoriesEl = this.element.querySelector("#game-categories");
                const activeLink = categoriesEl.querySelector(".category-tab .active a");
                utility.addClass(activeLink, "active");

                const key = src.getAttribute("data-category-filter-id");
                this.setGames(this.response.games[key], key);
                ComponentManager.broadcast("category.change");
            }
        });
    }

    /**
     * Event listener for category click
     */
    private listenHashChange() {
        utility.listen(window, "hashchange", (event, src: any) => {
            if (this.lobbyProducts.indexOf(ComponentManager.getAttribute("product")) !== -1) {
                this.currentPage = 0;
                const first = this.response.categories[0].field_alias;
                const key = this.getActiveCategory(this.response.games, first);
                if (utility.getHash(window.location.href) !== key &&
                    key !== first
                ) {
                    window.location.hash = key;
                }

                const categoriesEl = this.element.querySelector("#game-categories");
                const activeLink = categoriesEl.querySelector(".category-tab .active a");

                const categories = categoriesEl.querySelectorAll(".category-tab");

                for (const id in categories) {
                    if (categories.hasOwnProperty(id)) {
                        const category = categories[id];
                        if (category.getAttribute("href") === "#" + key) {
                            src = category;
                            break;
                        }
                    }
                }

                if (activeLink) {
                    utility.removeClass(activeLink, "active");
                    utility.removeClass(activeLink.parentElement, "active");
                }

                utility.addClass(src, "active");
                utility.addClass(src.parentElement, "active");

                this.setGames(this.response.games[key], key);
                ComponentManager.broadcast("category.change");
            }
        });
    }

    /**
     * Event listener for game item click
     */
    private listenClickGameTile() {
        ComponentManager.subscribe("click", (event, src, data) => {
            const el = utility.hasClass(src, "game-listing-item", true);
            const product = ComponentManager.getAttribute("product");
            if (el && !this.isLogin) {
                ComponentManager.broadcast("header.login", {
                    src: el,
                    productVia: this.product[0].login_via,
                    regVia: this.product[0].reg_via,
                    loginStyle: product,
                    fromGameLaunch: "true",
                });
            }
        });
    }

    /**
     * Event listener for game item click - adding games to recently played
     */
    private listenGameLaunch() {
        ComponentManager.subscribe("game.launch", (event, src, data) => {
            const el = utility.hasClass(data.src, "game-list", true);
            if (el) {
                const gameCode = el.getAttribute("data-game-code");
                xhr({
                    url: Router.generateRoute("soda_casino_lobby", "recent"),
                    type: "json",
                    method: "post",
                    data: {
                        gameCode,
                    },
                }).then((result) => {
                    if (result.success) {
                        this.response = null;
                        this.generateLobby(() => {
                            this.updateCategorySpecial();
                        });
                        this.fromGameLaunch = true;
                        ComponentManager.broadcast("success.game.launch", {launchedGame: gameCode});
                    }
                }).fail((error, message) => {
                    // do nothing
                });
            }
        });
    }

    /**
     * Event listener for game item click -adding games to favorites
     */
    private listenFavoriteClick() {
        ComponentManager.subscribe("click", (event, src) => {
            const el = utility.hasClass(src, "game-favorite", true);
            if (el && this.isLogin) {
                const gameCode = el.parentElement.getAttribute("data-game-code");
                xhr({
                    url: Router.generateRoute("soda_casino_lobby", "favorite"),
                    type: "json",
                    method: "post",
                    data: {
                        gameCode,
                    },
                }).then((result) => {
                    if (result.success) {
                        this.response = null;
                        this.generateLobby(() => {
                            this.updateCategorySpecial();
                        });
                        ComponentManager.broadcast("games.favorite", { srcElement: el });
                    }
                }).fail((error, message) => {
                    console.log(error);
                });
            }
        });
    }

    private updateCategorySpecial() {
        const activeSearch = this.element.querySelector(".search-tab");

        if (utility.hasClass(activeSearch, "active")) {
            this.setCategories(this.response.categories, "search");
            return;
        }

        this.setLobby();
    }

    private listenToCategory() {
        ComponentManager.subscribe("category.set", (event, src, data) => {
            const categoriesEl = this.element.querySelector("#game-categories");
            const categories = categoriesEl.querySelectorAll(".category-tab");
            const categoryScroll = categoriesEl.querySelector("#category-tab");
            let scroll = 0;
            if (data.scroll === "prev") {
                scroll = -30;
            }

            for (const id in categories) {
                if (categories.hasOwnProperty(id)) {
                    const category = categories[id];
                    scroll += category.getBoundingClientRect().width;
                    if (utility.hasClass(category, "active")) {
                        if (data.scroll === "prev") {
                            scroll -= category.getBoundingClientRect().width;
                        }

                        if (data.scroll !== "next") {
                            scroll -= category.getBoundingClientRect().width;
                        }
                        break;
                    }
               }
            }

            categoryScroll.scrollLeft = scroll;
        });
    }

    private listenToSwipe() {
        const games: any = this.element.querySelector("#game-container");
        new Swipe(games);
        if (games) {
            // Left Swipe
            utility.addEventListener(games, "swipeleft", (event, src) => {
                // Active category go right
                const categoriesEl = this.element.querySelector("#game-categories");
                const activeLi = categoriesEl.querySelector(".category-tab .active");

                if (utility.hasClass(activeLi, "search-tab")) {
                    window.location.hash = "";
                } else {
                    const sibling = utility.nextElementSibling(activeLi);
                    if (sibling) {
                        const siblingUrl = sibling.querySelector("a").getAttribute("href");
                        window.location.hash = siblingUrl;
                        ComponentManager.broadcast("category.set", {
                            scroll: "next",
                        });
                    } else {
                        // Add bounce effect
                        utility.addClass(games, "bounce-left");
                        setTimeout(() => {
                            utility.removeClass(games, "bounce-left");
                        }, 1000);
                    }
                }

            });
            // Right Swipe
            utility.addEventListener(games, "swiperight", (event, src) => {
                // Active category go left
                const categoriesEl = this.element.querySelector("#game-categories");
                const activeLi = categoriesEl.querySelector(".category-tab .active");
                const sibling = utility.previousElementSibling(activeLi);
                if (sibling) {
                    const siblingUrl = sibling.querySelector("a").getAttribute("href");
                    window.location.hash = siblingUrl;
                    ComponentManager.broadcast("category.set", {
                        scroll: "prev",
                    });
                } else {
                    // Add bounce effect
                    utility.addClass(games, "bounce-right");
                    setTimeout(() => {
                        utility.removeClass(games, "bounce-right");
                    }, 1000);
                }
            });
        }
    }

    private listenToScroll() {
        utility.addEventListener(window, "scroll", (event, src) => {
            if (ComponentManager.getAttribute("product") === "mobile-soda-casino") {
                const gameLoader: HTMLElement = this.element.querySelector("#game-loader");
                if (this.isSeen(gameLoader) && this.pager > 1 && this.pager - 1 > this.currentPage) {
                    const gamesEl = this.element.querySelector("#game-container");
                    if (gamesEl && gameLoader && this.load) {
                        this.currentPage += 1;
                        let hash = utility.getHash(window.location.href);
                        if (!this.response.games[hash]) {
                            const categoriesEl = this.element.querySelector("#game-categories");
                            const activeLink = categoriesEl.querySelector(".category-tab .active a");
                            hash = activeLink.getAttribute("data-category-filter-id");
                        }
                        let pager = this.getPagedContent(this.response.games[hash]);

                        if (utility.hasClass(this.element.querySelector(".search-tab"), "active")) {
                            pager = this.getPagedContent(this.searchResults);
                        }

                        const template = gameTemplate({
                            games: pager[this.currentPage],
                            favorites: this.response.favorite_list,
                            isLogin: this.isLogin,
                            isAllGames: hash === "all-games",
                        });
                        const loader = gameLoader.querySelector(".mobile-game-loader");
                        utility.removeClass(loader, "hidden");
                        this.load = false;
                        setTimeout(() => {
                            gameLoader.remove();
                            gamesEl.innerHTML += template;
                            this.load = true;
                        }, 1000);
                    }

                }
            }
        });
    }

    private listenOnSearch() {
         ComponentManager.subscribe("games.search.success", (event, src, data) => {
            this.searchResults = data.games;
            this.setGames(data.games, " ", 0, data.isRecommended, "#game-search-result");
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
        let gamesList: any = [];
        const allGames = response.games["all-games"];
        for (const gameId in allGames) {
            if (allGames.hasOwnProperty(gameId)) {
                const game = allGames[gameId];

                for (const key in game.categories) {
                    if (game.categories.hasOwnProperty(key)) {
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
        gamesList["favorites"] = response.games["favorites"];
        gamesList["recently-played"] = response.games["recently-played"];
        response.games = gamesList;
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
            if (gamesList.hasOwnProperty(category) && exemptFromSort.indexOf(category) === -1) {
                sortedGamesList[category] = this.gamesCollectionSort.sortGamesCollection(
                    response,
                    category,
                    true,
                    gamesList[category],
                );
            }
        }

        return sortedGamesList;
    }

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

    private filterCategories(categories, gamesList) {
        const filteredCategory: any = [];
        for (const category of categories) {
            if (gamesList.hasOwnProperty(category.field_alias)
                && gamesList[category.field_alias].length) {
                filteredCategory.push(category);
            }
        }

        return filteredCategory;
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
            url = utility.addQueryParam(url, "product", ComponentManager.getAttribute("product"));
            url = utility.addQueryParam(url, "productMap", ComponentManager.getAttribute("product"));
            url = utility.addQueryParam(url, "loaderFlag", "true");
            if (data.options.target === "popup") {
                this.windowObject = PopupWindow(url, "gameWindow", prop);
            }

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

    private updateHeader() {
        if (this.checkEvent("menu.ready")) {
            ComponentManager.subscribe("menu.ready", (event, target, data) => {
                ComponentManager.broadcast("menu.update.router.component", {
                    element: ".quicklinks-home", val: `header", "menu`,
                });

                ComponentManager.broadcast("menu.update.logo.component", {
                    element: "#header-logo-link", val: `header", "menu`,
                });
            });
        }
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
