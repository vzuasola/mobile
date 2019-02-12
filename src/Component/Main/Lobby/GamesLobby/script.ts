import * as Promise from "promise-polyfill";

import * as utility from "@core/assets/js/components/utility";
import Swipe from "@app/assets/script/components/custom-touch/swipe";
import * as Handlebars from "handlebars/runtime";

import * as xhr from "@core/assets/js/vendor/reqwest";

import * as categoriesTemplate from "./handlebars/categories.handlebars";
import * as gameTemplate from "./handlebars/games.handlebars";
import * as iconCheckedTemplate from "./handlebars/icon-checked.handlebars";
import * as iconUnCheckedTemplate from "./handlebars/icon-unchecked.handlebars";

import {GameLauncher} from "@app/src/Module/GameIntegration/scripts/game-launcher";
import {ComponentManager, ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@core/src/Plugins/ComponentWidget/asset/router";

import {Loader} from "@app/assets/script/components/loader";
import {GamesSearch} from "./scripts/games-search";
import {GamesFilter} from "./scripts/games-filter";
import {Marker} from "@app/assets/script/components/marker";
import EqualHeight from "@app/assets/script/components/equal-height";

import { ProviderDrawer } from "./scripts/provider-drawer";

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
    private currentPage: number;
    private pager: number;
    private load: boolean;
    private product: any[];
    private searchResults;
    private filterFlag: string;
    private state: boolean;

    constructor() {
        this.gameLauncher = GameLauncher;
        this.gamesSearch = new GamesSearch();
        this.gamesFilter = new GamesFilter();
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
        }) {
        this.response = null;
        this.element = element;
        this.attachments = attachments;
        this.isLogin = attachments.authenticated;
        this.product = attachments.product;
        this.pager = 0;
        this.load = true;
        this.listenChangeCategory();
        this.listenHashChange();
        this.listenClickGameTile();
        this.listenGameLaunch();
        this.listenFavoriteClick();
        this.generateLobby(() => {
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
        this.listenOnCloseFilter();
        this.activateProviderDrawer();
        this.equalizeProviderHeight();
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
            configs: any[],
            pagerConfig: any[],
            infinite_scroll: boolean,
        }) {
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
        }
        this.response = null;
        this.element = element;
        this.attachments = attachments;
        this.isLogin = attachments.authenticated;
        this.product = attachments.product;
        this.pager = 0;
        this.load = true;
        this.generateLobby(() => {
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
        const promises = [];
        for (let page = 0; page < this.attachments.pagerConfig.total_pages; page++) {
            promises.push("pager" + page);
        }
        promises.push("recent");
        promises.push("fav");
        return promises;
    }

    private mergeResponsePromises(responses) {
        const promises: any = {
            games: {},
        };

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

        promises.games = gamesList;

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
                let uri = Router.generateRoute("games_lobby", currentRequest.type);
                if (currentRequest.hasOwnProperty("page")) {
                    uri = utility.addQueryParam(uri, "page", currentRequest.page.toString());
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

                        newResponse.games = this.getCategoryGames(newResponse.games);
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

        return req;
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
        this.setGames(this.response.games[key]);
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

    /**
     * Set the games list in the template
     */
    private setGames(data, page: number = 0, isRecommend = false) {
        const gamesEl = this.element.querySelector("#game-container");
        const pager = this.getPagedContent(data);

        let template = gameTemplate({
            games: pager[page],
            favorites: this.response.favorite_list,
            isLogin: this.isLogin,
            isRecommended: isRecommend,
        });

        if (this.currentPage > page) {
            template = "";
            for (let ctr = 0; ctr <= this.currentPage; ctr++) {
                template += gameTemplate({
                    games: pager[ctr],
                    favorites: this.response.favorite_list,
                    isLogin: this.isLogin,
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
                this.filterFlag = "general";
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
            const activeLink = categoriesEl.querySelector(".category-tab .active a");

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

            this.setGames(this.response.games[key]);
            ComponentManager.broadcast("category.change");
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
            const el = utility.hasClass(data.src, "game-list", true);
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

                            if (this.filterFlag === "recently-played") {
                                this.setGames(this.response.games[this.filterFlag]);
                            }
                        });
                    }
                }).fail((error, message) => {
                    console.log(error);
                });
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
                if (this.response.games["recommended-games"] && this.response.enableRecommended) {
                    this.searchResults = this.response.games["recommended-games"];
                    this.setGames(this.response.games["recommended-games"], 0, true);
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
            const gameLoader: HTMLElement = this.element.querySelector("#game-loader");
            if (this.isSeen(gameLoader) && this.pager > 1 && this.pager - 1 > this.currentPage) {
                const gamesEl = this.element.querySelector("#game-container");
                if (gamesEl && gameLoader && this.load) {
                    this.currentPage += 1;
                    let hash = utility.getHash(window.location.href);
                    if (!this.response.games[hash]) {
                        const categoriesEl = document.querySelector("#game-categories");
                        const activeLink = categoriesEl.querySelector(".category-tab .active a");
                        hash = activeLink.getAttribute("data-category-filter-id");
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
        });
    }

    private listenOnSearch() {
         ComponentManager.subscribe("games.search.success", (event, src, data) => {
             this.searchResults = data.games;
             this.setGames(data.games, 0, data.isRecommended);
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

    private getCategoryGames(games) {
        const gamesList: any = [];
        const allGames = games["all-games"];
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

        for (const category in gamesList) {
            if (gamesList.hasOwnProperty(category)) {
                let categoryGames = gamesList[category];
                categoryGames = categoryGames.sort((a, b) => {
                    return a.categories[category] - b.categories[category];
                });
                gamesList[category] = categoryGames;
            }
        }

        /* tslint:disable:no-string-literal */
        gamesList["all-games"] = games["all-games"];
        gamesList["favorites"] = games["favorites"];
        gamesList["recently-played"] = games["recently-played"];
        /* tslint:enable:no-string-literal */

        return gamesList;
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
        for (const category of categories) {
            if (gamesList.hasOwnProperty(category.field_games_alias)
                && gamesList[category.field_games_alias].length) {
                filteredCategory.push(category);
            }
        }

        return filteredCategory;
    }

    private listenOnCloseFilter() {
        ComponentManager.subscribe("games.reload", (event: Event, src, data) => {
            this.setLobby();
            ComponentManager.broadcast("category.change");
        });
    }

}
