import * as Promise from "promise-polyfill";

import * as utility from "@core/assets/js/components/utility";
import Swipe from "@app/assets/script/components/custom-touch/swipe";
import * as Handlebars from "handlebars/runtime";

import * as xhr from "@core/assets/js/vendor/reqwest";

import * as categoriesTemplate from "./handlebars/categories.handlebars";
import * as gameTemplate from "@app/assets/script/components/handlebars/games.handlebars";
import * as iconCheckedTemplate from "./handlebars/icon-checked.handlebars";
import * as iconUnCheckedTemplate from "./handlebars/icon-unchecked.handlebars";

import { GameLauncher } from "@app/src/Module/GameIntegration/scripts/game-launcher";
import { ComponentManager, ComponentInterface } from "@plugins/ComponentWidget/asset/component";
import { Router } from "@core/src/Plugins/ComponentWidget/asset/router";

import { Loader } from "@app/assets/script/components/loader";
import { GamesSearch } from "./scripts/games-search";
import { GamesFilter } from "@app/assets/script/components/games-filter";
import { Marker } from "@app/assets/script/components/marker";
import EqualHeight from "@app/assets/script/components/equal-height";

import { GamesCollectionSorting } from "./scripts/games-collection-sorting";
import { GraphyteClickStream } from "@app/assets/script/components/graphyte/graphyte-clickstream";
import { GraphyteRecommends } from "@app/assets/script/components/graphyte/graphyte-recommends";
import { ProviderDrawer } from "./scripts/provider-drawer";
import { GameLauncherManager } from "@app/assets/script/components/game-launcher-manager";
/**
 *
 */
export class GamesLobbyComponent implements ComponentInterface {
    private element: HTMLElement;
    private attachments: any;
    private response: any;
    private isLogin: boolean;
    private gameLauncher;
    private gamesSearch: GamesSearch;
    private gamesFilter: GamesFilter;
    private gamesCollectionSort: GamesCollectionSorting;
    private graphyteAi: GraphyteClickStream;
    private graphyteRecommends: GraphyteRecommends;
    private currentPage: number;
    private pager: number;
    private load: boolean;
    private product: any[];
    private searchResults;
    private filterFlag: string;
    private state: boolean;
    private windowObject: any;
    private gameLink: string;
    private gameCategories: any;
    private productMenu: string = "product-games";
    private gameLauncherManager: GameLauncherManager;
    private uglConfig: boolean;
    private bannerWidgets: {
        [key: string]:
        { widget: string, link: string, target: string, height: string, width: string };
    } = {};

    constructor() {
        this.gameLauncher = GameLauncher;
        this.gamesSearch = new GamesSearch();
        this.gamesFilter = new GamesFilter();
        this.gamesCollectionSort = new GamesCollectionSorting();
        this.gameLauncherManager = new GameLauncherManager();

        Handlebars.registerHelper("getIndex", (offset, parentIndex, index, options) => {
            return (parseInt(parentIndex, 10) * 3) + offset + index;
        });

        Handlebars.registerHelper("equals", function(value, compare, options) {
            if (value === compare) {
                return options.fn(this);
            }

            return options.inverse(this);
        });
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
        product: any[],
        configs: any[],
        pagerConfig: any[],
        infinite_scroll: boolean,
        uglConfig: boolean,
        user,
    }) {
        this.uglConfig = attachments.uglConfig;
        this.response = null;
        this.element = element;
        this.attachments = attachments;
        this.isLogin = attachments.authenticated;
        this.product = attachments.product;
        this.pager = 0;
        this.load = true;
        this.graphyteRecommends = new GraphyteRecommends(this.attachments);
        /* tslint:disable:no-string-literal */
        const enableClickStream = (this.attachments.configs.graphyte.hasOwnProperty("enabled")) ?
            this.attachments.configs.graphyte.enabled : false;
        /* tslint:disable:no-string-literal */
        this.listenChangeCategory();
        this.listenHashChange();
        this.listenClickGameTile();
        this.listenGameLaunch();
        this.listenFavoriteClick();
        this.generateLobby(() => {
            this.highlightMenu();
            this.lobby();
        });
        this.moveCategory();
        // this.listenToCategory();
        this.listenToScroll();
        // this.listenToSwipe();
        this.initMarker();
        this.listenOnSearch();
        this.listenOnFilter();
        this.pager = 0;
        this.currentPage = 0;
        this.load = true;
        this.gamesSearch.handleOnLoad(this.element, attachments);
        this.gamesFilter.handleOnLoad(this.element, attachments);
        if (enableClickStream) {
            this.graphyteAi = new GraphyteClickStream(
                ComponentManager.getAttribute("product"),
            );
            this.graphyteAi.handleOnLoad(this.element, this.attachments);
        }
        this.listenOnCloseFilter();
        this.activateProviderDrawer();
        this.equalizeProviderHeight();
        this.gameLauncherManager.handleGameLaunch(ComponentManager.getAttribute("product"));
        this.componentFinish();
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
        product: any[],
        configs,
        pagerConfig: any[],
        infinite_scroll: boolean,
        uglConfig: boolean,
        user,
    }) {
        const enableClickStream = (attachments.configs.graphyte.hasOwnProperty("enabled")) ?
            attachments.configs.graphyte.enabled : false;
        this.graphyteRecommends = new GraphyteRecommends(attachments);
        this.uglConfig = attachments.uglConfig;
        if (!this.element) {
            this.listenChangeCategory();
            this.listenHashChange();
            this.listenClickGameTile();
            this.listenGameLaunch();
            this.listenFavoriteClick();
            // this.listenToCategory();
            this.listenToScroll();
            this.listenOnSearch();
            this.listenOnFilter();
            this.listenOnCloseFilter();
            this.gameLauncherManager.handleGameLaunch(ComponentManager.getAttribute("product"));
            if (enableClickStream) {
                this.graphyteAi = new GraphyteClickStream(
                    ComponentManager.getAttribute("product"),
                );
                this.graphyteAi.handleOnReLoad(element, attachments);
            }
        }
        this.response = null;
        this.element = element;
        this.attachments = attachments;
        this.isLogin = attachments.authenticated;
        this.product = attachments.product;
        this.pager = 0;
        this.load = true;
        this.generateLobby(() => {
            this.highlightMenu();
            this.lobby();
        });
        this.moveCategory();
        // this.listenToSwipe();
        this.initMarker();
        this.gamesSearch.handleOnReLoad(this.element, attachments);
        this.gamesFilter.handleOnReLoad(this.element, attachments);

        this.pager = 0;
        this.currentPage = 0;
        this.load = true;
        this.activateProviderDrawer();
        this.equalizeProviderHeight();
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

    private initMarker() {
        // Checkbox
        new Marker({
            parent: ".games-search-filter-body",
            iconDefault: iconUnCheckedTemplate(),
            iconActive: iconCheckedTemplate(),
        });
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
        let promises = [];
        for (let page = 0; page < this.attachments.pagerConfig.total_pages; page++) {
            promises.push("pager" + page);
        }
        promises.push("recent");
        promises.push("fav");
        promises.push("games-collection");
        const recommendsPromises: any = this.graphyteRecommends.getPagePromises();
        if (typeof recommendsPromises !== "undefined" && recommendsPromises.length) {
            promises = promises.concat(recommendsPromises);
        }

        return promises;
    }

    private mergeResponsePromises(responses) {
        const promises: any = {
            games: {},
        };
        let gamesDictionary = [];
        const key = "all-games";
        const recommendResponses = [];
        const recommendsPromises = this.graphyteRecommends.getPagePromises();
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

        for (const recommendPromise of recommendsPromises) {
            if (responses.hasOwnProperty(recommendPromise)) {
                if (!recommendResponses.hasOwnProperty(recommendPromise)) {
                    recommendResponses[recommendPromise] = responses[recommendPromise];
                }
            }
        }
        gamesList["graphyte-recommended"] = recommendResponses;
        promises.games = gamesList;
        gamesDictionary = this.getGamesDictionary(gamesList[key]);
        gamesList[key] = this.gamesCollectionSort.sortGamesCollection(
            promises,
            "top",
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
    * Converts array to object
    */
    private getGamesObj(gamesList, allGames) {
        const games = [];
        for (const game of gamesList) {
            if (allGames.hasOwnProperty("id:" + game.game_code)) {
                games["id:" + game.game_code] = allGames["id:" + game.game_code];
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
        const lobbyRequests = this.createRequest();
        const promises = this.getPagerPromises();
        const pageResponse: {} = {};
        for (const id in lobbyRequests) {
            if (lobbyRequests.hasOwnProperty(id)) {
                const currentRequest = lobbyRequests[id];
                let uri = Router.generateRoute("games_lobby", currentRequest.type);
                if (currentRequest.hasOwnProperty("page")) {
                    uri = utility.addQueryParam(uri, "page", currentRequest.page.toString());
                }

                let xhrProp = {
                    url: uri,
                    type: "json",
                };

                if (currentRequest.hasOwnProperty("overrideXhrProp")) {
                    xhrProp = currentRequest.overrideXhrProp;
                }

                xhr(
                    xhrProp,
                ).then((response) => {
                    pageResponse[id] = response;

                    this.checkPromiseState(promises, id, () => {
                        this.setResponse(pageResponse, callback);
                    });
                }).fail((error, message) => {
                    this.checkPromiseState(promises, id, () => {
                        this.setResponse(pageResponse, callback);
                    });
                });
            }
        }
    }

    private setResponse(pageResponse, callback) {
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
    }

    private createRequest() {
        const req: any = {};
        const recommendsReq = this.graphyteRecommends.getRecommendsRequest();
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

        if (Object.keys(recommendsReq).length) {
            Object.assign(req, recommendsReq);
        }

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
        this.gamesFilter.setGamesList(this.response);
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
        this.setBannerWidget(key);
        ComponentManager.broadcast("clickstream.category.change", {
            category: this.getCategoryName(key),
            product: ComponentManager.getAttribute("product"),
            title: document.title,
            url: window.location.href,
        });
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

        if (key === "search") {
            const activeCategory = utility.getHash(window.location.href);
            const activeLink = categoriesEl.querySelector(".category-" + activeCategory);
            const activeLi = activeLink.parentElement;
            utility.addClass(activeLi, "active");
        }
        this.bannerWidgets = {};
        for (const category of data) {
            if (category.banner_widget) {
                this.bannerWidgets[category.field_games_alias] = {
                    widget: category.banner_widget,
                    link: category.banner_link,
                    target: category.banner_target,
                    height: category.banner_height,
                    width: category.banner_width,
                };
            }
        }

        this.onLoadActiveMore();
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

    private getCategoryName(activeCategory) {
        if (this.gameCategories.hasOwnProperty(activeCategory)) {
            return this.gameCategories[activeCategory].name;
        }

        return activeCategory;
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
            offset: page,
            uglConfig: Boolean(this.uglConfig),
        });

        if (this.currentPage > page) {
            template = "";
            for (let ctr = 0; ctr <= this.currentPage; ctr++) {
                template += gameTemplate({
                    games: pager[ctr],
                    favorites: this.response.favorite_list,
                    isLogin: this.isLogin,
                    isAllGames: activeCategory === "all-games",
                    offset: ctr * 12,
                    uglConfig: Boolean(this.uglConfig),
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
            if (ComponentManager.getAttribute("product") === "mobile-games") {
                let key: string;
                const el = utility.hasClass(src, "game-category-item", true);
                const elMore = utility.hasClass(src, "category-provider-menu", true);
                if (el && !utility.hasClass(src, "game-category-more", true)
                    || elMore) {
                    if (el.querySelector(".category-tab")) {
                        key = el.querySelector(".category-tab").getAttribute("data-category-filter-id");
                    }
                    if (elMore) {
                        key = elMore.getAttribute("data-category-filter-id");
                    }

                    if (key === "undefined") {
                        const first = this.response.categories[0].field_games_alias;
                        key = this.getActiveCategory(this.response.games, first);
                    }
                    this.currentPage = 0;
                    this.filterFlag = "general";
                    window.location.hash = "";
                    ComponentManager.broadcast("category.change");
                    ComponentManager.broadcast("clickstream.category.change", {
                        category: this.getCategoryName(key),
                        product: ComponentManager.getAttribute("product"),
                        title: document.title,
                        url: location.href.split(location.search || location.hash || /[#]/)[0] + "#" + key,
                    });
                    this.setBannerWidget(key);
                }
            }
        });
    }

    /**
     * Event listener for category click
     */
    private listenHashChange() {
        utility.listen(window, "hashchange", (event, src: any) => {
            if (ComponentManager.getAttribute("product") === "mobile-games") {
                this.currentPage = 0;
                const first = this.response.categories[0].field_games_alias;
                const key = this.getActiveCategory(this.response.games, first);
                let sidebar = false;
                if (utility.getHash(window.location.href) !== key &&
                    key !== first
                ) {
                    window.location.hash = key;
                }

                const categoriesEl = document.querySelector("#game-categories");

                this.clearCategoriesActive(categoriesEl);

                // Add active to categories
                const actives = categoriesEl.querySelectorAll(".category-" + key);

                if (actives.length === 1) {
                    src = categoriesEl.querySelector(".game-category-more");
                    utility.addClass(src, "active");
                    sidebar = true;
                }

                for (const id in actives) {
                    if (actives.hasOwnProperty(id)) {
                        const active = actives[id];
                        utility.addClass(active, "active");
                        if (!sidebar) {
                            utility.addClass(active.parentElement, "active");
                        }
                    }
                }

                this.setGames(this.response.games[key], key);
                ComponentManager.broadcast("category.change");
            }
        });
    }

    private clearCategoriesActive(categoriesEl) {
        const categories = categoriesEl.querySelectorAll(".category-provider-menu");
        for (const id in categories) {
            if (categories.hasOwnProperty(id)) {
                const category = categories[id];
                if (utility.hasClass(category, "active")) {
                    const prevActiveCategory = category.getAttribute("data-category-filter-id");
                    // Remove active to categories
                    const prevActives = categoriesEl.querySelectorAll(".category-" + prevActiveCategory);
                    for (const previd in prevActives) {
                        if (prevActives.hasOwnProperty(previd)) {
                            const prevActive = prevActives[previd];
                            utility.removeClass(prevActive, "active");
                            utility.removeClass(prevActive.parentElement, "active");
                        }
                    }
                    break;
                }
            }
        }

        utility.removeClass(categoriesEl.querySelector(".game-category-more"), "active");
    }

    private onLoadActiveMore() {
        const categoriesEl = document.querySelector("#game-categories");
        const activeLink = categoriesEl.querySelector(".category-tab .active a");
        if (!utility.hasClass(activeLink, "category-tab")) {
            const src = categoriesEl.querySelector(".game-category-more");
            utility.addClass(src, "active");
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
            if (ComponentManager.getAttribute("product") === "mobile-games") {
                const el = utility.hasClass(data.src, "game-list", true);
                const first = this.response.categories[0].field_games_alias;
                const activeCategory = this.getActiveCategory(this.response.games, first);
                ComponentManager.broadcast("clickstream.game.launch", {
                    srcEl: data.src,
                    category: this.getCategoryName(activeCategory),
                    product: ComponentManager.getAttribute("product"),
                    response: data.response,
                });
                if (el) {
                    const gameCode = el.getAttribute("data-game-code");
                    xhr({
                        url: Router.generateRoute("games_lobby", "recent"),
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
                                this.gamesFilter.setGamesList(this.response);
                            });
                        }
                    }).fail((error, message) => {
                        console.log(error);
                    });

                }
            }
        });
    }

    /**
     * Event listener for game item click
     */
    private listenFavoriteClick() {
        ComponentManager.subscribe("click", (event, src) => {
            const el = utility.hasClass(src, "game-favorite", true);
            if (el && this.isLogin) {
                const gameCode = el.parentElement.getAttribute("data-game-code");
                xhr({
                    url: Router.generateRoute("games_lobby", "favorite"),
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
                            this.gamesFilter.setGamesList(this.response);

                            if (this.filterFlag === "favorites") {
                                if (typeof this.response.games[this.filterFlag] === "undefined") {
                                    this.deactivateSearchTab();
                                    this.setLobby();
                                }

                                if (typeof this.response.games[this.filterFlag] !== "undefined") {
                                    this.setGames(this.response.games[this.filterFlag]);
                                }
                            }

                            if (this.filterFlag === "favorites-general") {
                                this.gamesFilter.submitFilters();
                            }
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
        const categoriesEl = document.querySelector("#game-categories");
        const activeSearch = this.element.querySelector(".search-tab");
        const activeLink = categoriesEl.querySelector(".category-tab .active a");

        if (utility.hasClass(activeSearch, "active")) {
            this.setCategories(this.response.categories, "search");
            return;
        }

        this.setLobby();
    }

    private listenToCategory() {
        ComponentManager.subscribe("category.set", (event, src, data) => {
            const categoriesEl = document.querySelector("#game-categories");
            const activeLink = categoriesEl.querySelector(".category-tab .active a");
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
        const swipe: Swipe = new Swipe(games);
        if (games) {
            // Left Swipe
            utility.addEventListener(games, "swipeleft", (event, src) => {
                // Active category go right
                const categoriesEl = document.querySelector("#game-categories");
                const activeLi = categoriesEl.querySelector(".category-tab .active");
                const activeLink = activeLi.querySelector("a");

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
                const categoriesEl = document.querySelector("#game-categories");
                const activeLi = categoriesEl.querySelector(".category-tab .active");
                const activeLink = activeLi.querySelector("a");
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

    private listenOnFilter() {
        ComponentManager.subscribe("games.filter.success", (event: Event, src, data) => {
            if (data.filteredGames) {
                this.element.querySelector("#blurb-lobby").innerHTML = "";
                this.activateSearchTab(data.active);
                this.searchResults = data.filteredGames;
                this.setGames(data.filteredGames);
                this.filterFlag = data.flag;
            } else {
                const gamesEl = this.element.querySelector("#game-container");
                let recommended: boolean = false;
                gamesEl.innerHTML = "";
                this.activateSearchTab(data.active);
                if (this.response.games["recommended-games"]) {
                    this.searchResults = this.response.games["recommended-games"];
                    this.setGames(this.response.games["recommended-games"], "recommended-games", 0, true);
                    recommended = true;
                }
                this.updateBlurbForFilter(recommended);
            }
        });
    }

    private updateBlurbForFilter(recommended: boolean) {
        const searchBlurbEl = this.element.querySelector("#blurb-lobby");
        let recommendedBlurb = this.attachments.msg_no_recommended;
        if (recommended) {
            recommendedBlurb = this.attachments.msg_recommended_available;
        }
        recommendedBlurb = "<span>" + recommendedBlurb + "</span>";
        searchBlurbEl.innerHTML = this.attachments.filter_no_result_msg + recommendedBlurb;
    }

    private listenToScroll() {
        utility.addEventListener(window, "scroll", (event, src) => {
            if (ComponentManager.getAttribute("product") === "mobile-games") {
                const gameLoader: HTMLElement = this.element.querySelector("#game-loader");
                if (this.isSeen(gameLoader) && this.pager > 1 && this.pager - 1 > this.currentPage) {
                    const gamesEl = this.element.querySelector("#game-container");
                    if (gamesEl && gameLoader && this.load) {
                        this.currentPage += 1;
                        let hash = utility.getHash(window.location.href);
                        if (!this.response.games[hash]) {
                            const first = this.response.categories[0].field_games_alias;
                            hash = this.getActiveCategory(this.response.games, first);
                            const categoriesEl = document.querySelector("#game-categories");
                            const activeLink = categoriesEl.querySelector(".category-tab .active a");
                            if (activeLink) {
                                hash = activeLink.getAttribute("data-category-filter-id");
                            }
                        }
                        let pager = this.getPagedContent(this.response.games[hash]);

                        if (utility.hasClass(this.element.querySelector(".search-tab"), "active")
                            || utility.hasClass(this.element.querySelector(".games-filter"), "active")
                        ) {
                            pager = this.getPagedContent(this.searchResults);
                        }

                        const template = gameTemplate({
                            games: pager[this.currentPage],
                            favorites: this.response.favorite_list,
                            isLogin: this.isLogin,
                            isAllGames: hash === "all-games",
                            offset: this.currentPage * 12,
                            uglConfig: Boolean(this.uglConfig),
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
            this.setGames(data.games, "", 0, data.isRecommended);
        });
    }

    private activateSearchTab(active?: string) {
        const categoriesEl = document.querySelector("#game-categories");

        this.clearCategoriesActive(categoriesEl);

        // set search tab as active tab
        this.deactivateSearchTab();

        utility.addClass(this.element.querySelector(active), "active");
        utility.addClass(this.element.querySelector(".search-blurb"), "active");
    }

    private deactivateSearchTab() {
        const categoriesEl = document.querySelector("#game-categories");
        utility.removeClass(categoriesEl.querySelector(".game-category-more"), "active");
        utility.removeClass(this.element.querySelector(".search-tab"), "active");
        utility.removeClass(this.element.querySelector(".games-filter"), "active");
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
        gamesList = this.doSortCategoryGames(response, gamesList);
        // get recommended games from graphyte last, so that sort will not be changed by collection sort
        if (response["games"].hasOwnProperty("graphyte-recommended")) {
            response["games"]["graphyte-recommended"].forEach((recommendedResponse, key) => {
                const filterCategory = response.categories.find((cat) => parseInt(cat.tid, 10) === key);
                if (typeof filterCategory !== "undefined" &&
                    filterCategory.hasOwnProperty("field_games_alias")) {
                    gamesList[filterCategory.field_games_alias] = this.graphyteRecommends
                        .getRecommendedByCategory(recommendedResponse, allGames);
                }
            });
        }
        response.games = gamesList;
        /* tslint:enable:no-string-literal */

        return gamesList;
    }

    private doSortCategoryGames(response, gamesList) {
        const sortedGamesList: any = [];
        const favoritesKey = "favorites";
        const exempFromSort: any = ["all-games", "favorites", "recently-played"];

        /* tslint:enable:no-string-literal */
        sortedGamesList["all-games"] = response.games["all-games"];
        sortedGamesList[favoritesKey] = response.games[favoritesKey];
        sortedGamesList["recently-played"] = response.games["recently-played"];
        /* tslint:enable:no-string-literal */

        for (const category in gamesList) {
            if (gamesList.hasOwnProperty(category) && exempFromSort.indexOf(category) === -1) {
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

    /**
     * Enable Provider Drawer slide behavior
     */
    private activateProviderDrawer() {
        const categoriesEl: any = document.querySelector("#game-categories");
        const providerdrawer = new ProviderDrawer(categoriesEl);
        providerdrawer.activate();
    }

    private equalizeProviderHeight() {
        setTimeout(() => {
            const equalProvider = new EqualHeight("#game-categories .provider-menu .game-category-list a");
            equalProvider.init();
        }, 1000);

    }
    private filterCategories(categories, gamesList) {
        const filteredCategory: any = [];
        const gameCategories: any = [];
        for (const category of categories) {
            if (gamesList.hasOwnProperty(category.field_games_alias)
                && gamesList[category.field_games_alias].length) {
                filteredCategory.push(category);

                if (!gameCategories.hasOwnProperty(category.field_games_alias)) {
                    gameCategories[category.field_games_alias] = category;
                }
            }
        }

        this.gameCategories = gameCategories;

        return filteredCategory;
    }

    private listenOnCloseFilter() {
        ComponentManager.subscribe("games.reload", (event: Event, src, data) => {
            this.setLobby();
            ComponentManager.broadcast("category.change");
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

    private setBannerWidget(key) {
        const iframeEl: HTMLElement = document.querySelector("#category-widget");
        const bannerLinkEl: HTMLElement = document.querySelector("#category-banner-link");
        const categoryWidget: HTMLElement = document.querySelector("#category-widget-container");
        utility.addClass(categoryWidget, "hidden");
        iframeEl.setAttribute("src", "");
        iframeEl.style["min-height"] = "";
        iframeEl.style.width = "";

        if (key in this.bannerWidgets) {
            utility.removeClass(categoryWidget, "hidden");
            utility.removeAttributes(bannerLinkEl, ["target", "href"]);
            iframeEl.setAttribute("src", this.bannerWidgets[key].widget);
            if (this.bannerWidgets[key].height) {
                iframeEl.style["min-height"] = this.bannerWidgets[key].height;
            }
            if (this.bannerWidgets[key].width) {
                iframeEl.style.width = this.bannerWidgets[key].width;
            }
            if (this.bannerWidgets[key].widget && this.bannerWidgets[key].link) {
                bannerLinkEl.setAttribute("href", this.bannerWidgets[key].link);
                bannerLinkEl.setAttribute("target", this.bannerWidgets[key].target);
            }
        }
    }

}
