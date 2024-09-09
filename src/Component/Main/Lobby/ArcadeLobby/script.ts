import * as utility from "@core/assets/js/components/utility";
import * as Handlebars from "handlebars/runtime";
import { LazyLoader } from "./scripts/lazy-loader";
import { ComponentInterface, ComponentManager } from "@plugins/ComponentWidget/asset/component";
import { Router, RouterClass } from "@plugins/ComponentWidget/asset/router";

import * as xhr from "@core/assets/js/vendor/reqwest";
import { GamesCategory } from "./scripts/games-category";
import { GamesCollectionSorting } from "./scripts/games-collection-sorting";
import { GamesSearch } from "./scripts/games-search";
import { GamesFilter } from "@app/assets/script/components/games-filter";
import { Marker } from "@app/assets/script/components/marker";
import { GraphyteClickStream } from "@app/assets/script/components/graphyte/graphyte-clickstream";
import { GraphyteRecommends } from "@app/assets/script/components/graphyte/graphyte-recommends";
import { GameLauncherManager } from "@app/assets/script/components/game-launcher-manager";

import * as iconCheckedTemplate from "./handlebars/icon-checked.handlebars";
import * as iconUnCheckedTemplate from "./handlebars/icon-unchecked.handlebars";
/**
 *
 */
export class ArcadeLobbyComponent implements ComponentInterface {
    private element: HTMLElement;
    private attachments: any;
    private response: any;
    private groupedGames: any;
    private windowObject: any;
    private favoritesList: any = [];
    private lazyLoader: LazyLoader;
    private gameCategories: GamesCategory;
    private gamesCollectionSort: GamesCollectionSorting;
    private gamesSearch: GamesSearch;
    private gamesFilter: GamesFilter;
    private graphyteAi: GraphyteClickStream;
    private graphyteRecommends: GraphyteRecommends;
    private productMenu: string = "product-arcade";
    private recommendationAlias: any = [];
    private gameLauncherManager: GameLauncherManager;

    constructor() {
        this.lazyLoader = new LazyLoader();
        this.gamesCollectionSort = new GamesCollectionSorting();
        this.gamesSearch = new GamesSearch();
        this.gamesFilter = new GamesFilter();
        this.gameLauncherManager = new GameLauncherManager();
        Handlebars.registerHelper("inc", (value, incrementVal, options) => {
            return parseInt(value, 10) + incrementVal;
        });
    }

    onLoad(element: HTMLElement, attachments: {
        authenticated: boolean,
        product: any[],
        pagerConfig: any[],
        configs: any[],
        user,
    }) {
        this.response = undefined;
        this.element = element;
        this.attachments = attachments;
        this.graphyteRecommends = new GraphyteRecommends(this.attachments);
        const enableClickStream = (this.attachments.configs.graphyte.hasOwnProperty("enabled")) ?
            this.attachments.configs.graphyte.enabled : false;

        this.gameCategories = new GamesCategory(
            this.attachments,
        );
        this.generateLobby(() => {
            this.highlightMenu();
            this.setLobby();
        });
        this.listenHashChange();
        this.listenProviderMoreEvent();
        this.listenToScroll();
        this.listenClickGameTile();
        this.listenGameLaunch();
        this.listenFavoriteClick();
        this.gameLauncherManager.handleGameLaunch(ComponentManager.getAttribute("product"));
        this.listenOnLogin();
        this.listenOnLogout();
        this.listenOnResize();
        this.listenOnSearch();
        this.listenOnFilter();
        this.listenOnCloseFilter();
        this.initMarker();
        this.gamesSearch.handleOnLoad(this.element, this.attachments);
        this.gamesFilter.handleOnLoad(this.element, this.attachments, false);
        if (enableClickStream) {
            this.graphyteAi = new GraphyteClickStream(
                ComponentManager.getAttribute("product"),
            );
            this.graphyteAi.handleOnLoad(this.element, this.attachments);
        }
        this.componentFinish();
    }

    onReload(element: HTMLElement, attachments: {
        authenticated: boolean,
        product: any[],
        pagerConfig: any[],
        configs,
        user,
    }) {
        const enableClickStream = (attachments.configs.graphyte.hasOwnProperty("enabled")) ?
            attachments.configs.graphyte.enabled : false;
        this.graphyteRecommends = new GraphyteRecommends(attachments);
        if (!this.element) {
            this.listenHashChange();
            this.listenProviderMoreEvent();
            this.listenToScroll();
            this.listenClickGameTile();
            this.listenGameLaunch();
            this.listenFavoriteClick();
            this.gameLauncherManager.handleGameLaunch(ComponentManager.getAttribute("product"));
            this.listenOnLogin();
            this.listenOnLogout();
            this.listenOnResize();
            this.listenOnSearch();
            this.listenOnFilter();
            this.listenOnCloseFilter();
            if (enableClickStream) {
                this.graphyteAi = new GraphyteClickStream(
                    ComponentManager.getAttribute("product"),
                );
                this.graphyteAi.handleOnReLoad(element, attachments);
            }

        }

        this.response = undefined;
        this.element = element;
        this.attachments = attachments;
        this.gameCategories = new GamesCategory(
            this.attachments,
        );

        this.generateLobby(() => {
            this.highlightMenu();
            this.setLobby();
        });

        this.initMarker();
        this.gamesSearch.handleOnReLoad(this.element, this.attachments);
        this.gamesFilter.handleOnReLoad(this.element, this.attachments, false);
        this.componentFinish();
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
     * Populate lobby with the response from cms
     */
    private setLobby(isCatChange = true) {
        // group games by category
        const groupedGames = this.groupGamesByCategory();
        this.groupedGames = this.sortGamesByGamesCollection(groupedGames);
        // populate categories
        this.gameCategories.setCategories(this.response.categories, this.groupedGames);
        this.gameCategories.render(false);
        // populate games
        const activeCategory = this.gameCategories.getActiveCategory();
        this.populateGames(activeCategory);
        this.gamesSearch.setGamesList(this.groupedGames, this.response, activeCategory);
        this.gamesFilter.setGamesList({ games: this.groupedGames });

        if (isCatChange) {
            ComponentManager.broadcast("clickstream.category.change", {
                category: this.gameCategories.getCategoryNameByAlias(activeCategory),
                product: ComponentManager.getAttribute("product"),
                title: document.title,
                url: window.location.href,
            });
        }

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
                let uri = Router.generateRoute("arcade_lobby", currentRequest.type);
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
                    console.log(error);
                });
            }
        }
    }

    private setResponse(pageResponse, callback) {
        const mergeResponse = this.mergeResponsePromises(pageResponse);

        // clone respone object
        const newResponse = Object.assign({}, mergeResponse);
        this.response = newResponse;
        if (callback) {
            callback();
        }
    }

    /**
     * Creates lists of ajax requests to be called
     */
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
            type: "getGamesCollection",
        };

        if (Object.keys(recommendsReq).length) {
            Object.assign(req, recommendsReq);
        }

        return req;
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

    /**
     * Return array of xhr request
     */
    private getPagerPromises() {
        let promises = [];
        for (let page = 0; page < this.attachments.pagerConfig.total_pages; page++) {
            promises.push("pager" + page);
        }
        promises.push("recent");
        promises.push("fav");
        promises.push("games-collection");
        const recommendsPromises = this.graphyteRecommends.getPagePromises();
        if (typeof recommendsPromises !== "undefined" && recommendsPromises.length) {
            promises = promises.concat(recommendsPromises);
        }
        return promises;
    }

    /**
     * Merges all xhr responses into one array
     * @param responses
     */
    private mergeResponsePromises(responses) {
        const promises: any = {
            games: {},
        };
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
                if (typeof response.games["all-games"] === "object"
                    && Object.keys(response.games["all-games"]).length > 0) {
                    gamesList["all-games"] = Object.assign(gamesList["all-games"], response.games["all-games"]);
                }
            }
        }

        if (responses.hasOwnProperty("fav")) {
            gamesList.favorites = this.getGamesDefinition(responses.fav, gamesList["all-games"]);
            this.setFavoritesList(responses.fav);
        }

        if (responses.hasOwnProperty("recent")) {
            gamesList["recently-played"] = this.getGamesDefinition(responses.recent, gamesList["all-games"]);
        }

        if (responses.hasOwnProperty("games-collection")) {
            promises.gamesCollection = responses["games-collection"];
            gamesList["recommended-games"] = (responses["games-collection"].hasOwnProperty("recommended-games"))
                ? this.getGamesDefinition(responses["games-collection"]["recommended-games"], gamesList["all-games"])
                : [];
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
        return promises;
    }

    /**
     * Gets game definition based on ID
     * @param gamesList
     * @param allGames
     */
    private getGamesDefinition(gamesList, allGames) {
        const games = [];
        for (const id of gamesList) {
            if (allGames.hasOwnProperty(id)) {
                games.push(allGames[id]);
            }
        }

        return games;
    }

    /**
     * Populate game thumbnails
     */
    private populateGames(activeCategory, games?) {
        /* tslint:disable:no-string-literal */
        const enableLazyLoad = (this.attachments.configs.hasOwnProperty("arcade_lobby_infinite_scroll")) ?
            this.attachments.configs["arcade_lobby_infinite_scroll"] : false;
        const gamesList: any[] = (games) ? games : this.groupedGames[activeCategory];
        /* tslint:disable:no-string-literal */
        this.lazyLoader.init(
            gamesList,
            this.attachments.authenticated,
            this.attachments.configs,
            this.element.querySelector("#game-container"),
            this.favoritesList,
            activeCategory,
            enableLazyLoad,
        );

        ComponentManager.broadcast("clickstream.category.change", {
            category: this.gameCategories.getCategoryNameByAlias(activeCategory),
            title: document.title,
            url: window.location.href,
        });

    }

    /**
     * Groups games by category
     */
    private groupGamesByCategory() {
        const gamesList: any = [];
        gamesList["all-games"] = [];
        gamesList["recently-played"] = [];
        gamesList["favorites"] = [];
        const allGames = this.response["games"]["all-games"];
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
                gamesList["all-games"].push(game);
            }
        }
        gamesList["recently-played"] = this.response["games"]["recently-played"];
        gamesList["favorites"] = this.response["games"]["favorites"];
        gamesList["recommended-games"] = this.response["games"]["recommended-games"];

        // recommended games from graphyte
        if (this.response["games"].hasOwnProperty("graphyte-recommended")) {
            this.response["games"]["graphyte-recommended"].forEach((recommendedResponse, key) => {
                const filterCategory = this.response.categories.find((cat) => parseInt(cat.tid, 10) === key);
                if (typeof filterCategory !== "undefined" &&
                    filterCategory.hasOwnProperty("field_games_alias")) {
                    this.recommendationAlias.push(filterCategory.field_games_alias);
                    gamesList[filterCategory.field_games_alias] = this.graphyteRecommends
                        .getRecommendedByCategory(recommendedResponse, allGames);
                }
            });
        }

        return gamesList;
    }

    /**
     * Sorts games via Games Collection Sorting
     * @param gamesList
     */
    private sortGamesByGamesCollection(gamesList) {
        const sortedGamesList: any = [];
        let exempFromSort: any = ["favorites", "recently-played", "recommended-games"];
        if (this.recommendationAlias.length >= 1) {
            exempFromSort = exempFromSort.concat(this.recommendationAlias);
        }

        for (const category of Object.keys(gamesList)) {
            if (gamesList.hasOwnProperty(category) && exempFromSort.indexOf(category) === -1) {
                sortedGamesList[category] = this.gamesCollectionSort.sortGamesCollection(
                    this.response,
                    category,
                    true,
                    gamesList[category],
                );

                gamesList[category] = sortedGamesList[category];
            }
        }

        return gamesList;
    }

    /**
     * Triggers login lightbox
     */
    private showLogin(el) {
        if (el && !this.attachments.isLogin) {
            ComponentManager.broadcast("header.login", {
                src: el,
                productVia: this.attachments.product[0].login_via,
                regVia: this.attachments.product[0].reg_via,
            });
        }
    }

    /**
     * Helper function that sends event to menu component to
     * highlight arcade menu tile
     */
    private highlightMenu() {
        ComponentManager.broadcast("menu.highlight", { menu: this.productMenu });
    }

    private initMarker() {
        // Checkbox
        new Marker({
            parent: ".games-search-filter-body",
            iconDefault: iconUnCheckedTemplate(),
            iconActive: iconCheckedTemplate(),
        });
    }

    /**
     * Event Listeners
     */

    /**
     * Event listener for url hash change
     */
    private listenHashChange() {
        utility.listen(window, "hashchange", (event, src: any) => {
            if (ComponentManager.getAttribute("product") === "mobile-arcade") {
                const activeCategory = this.gameCategories.getActiveCategory();
                this.gameCategories.setActiveCategory(activeCategory);
                this.populateGames(activeCategory);
                if (utility.getHash(window.location.href) !== activeCategory) {
                    window.location.hash = activeCategory;
                }
                ComponentManager.broadcast("category.change");
                ComponentManager.broadcast("clickstream.category.change", {
                    category: this.gameCategories.getCategoryNameByAlias(activeCategory),
                    product: ComponentManager.getAttribute("product"),
                    title: document.title,
                    url: window.location.href,
                });

                this.highlightMenu();
            }
        });
    }

    /**
     * Event listener for scrolling for lazy load
     */
    private listenToScroll() {
        utility.listen(window, "scroll", (event, src) => {
            if (ComponentManager.getAttribute("product") === "mobile-arcade") {
                this.lazyLoader.onScrollDown(
                    this.element.querySelector("#game-loader"),
                    this.element.querySelector("#game-container"),
                );
            }
        });
    }

    /**
     * Event listener for click
     */
    private listenClickGameTile() {
        ComponentManager.subscribe("click", (event, src, data) => {
            const el = utility.hasClass(src, "game-listing-item", true);
            if (el) {
                this.showLogin(el);
            }

            const provider = utility.hasClass(src, "games-provider", true);
            if (provider) {
                event.preventDefault();
                this.gameCategories.sortProviders(this.response.providers_list);
                this.broadcastOpenDrawer(true);
            }

            // listen click for game categories
            const providerItem = utility.hasClass(src, "category-tab", true);
            const categoryItem = utility.hasClass(src, "category-provider-menu", true, 1);
            if (providerItem &&
                !utility.hasClass(src, "game-providers-more", true)
            ) {
                this.reloadGames(providerItem);
            }

            if (categoryItem) {
                this.reloadGames(categoryItem);
            }
        });
    }

    private reloadGames(category) {
        if (utility.getHash(window.location.href) === category.getAttribute("data-category-filter-id")) {
            this.gameCategories.setActiveCategory(category.getAttribute("data-category-filter-id"));
            this.populateGames(category.getAttribute("data-category-filter-id"));
            ComponentManager.broadcast("category.change");
        }
    }

    /**
     * Event listener for click on More Drawer
     */
    private listenProviderMoreEvent() {
        ComponentManager.subscribe(utility.eventType(), (src, target) => {
            if (ComponentManager.getAttribute("product") === "mobile-arcade") {
                const more = utility.hasClass(target, "provider-drawer", true);
                if (more) {
                    this.broadcastOpenDrawer(false);
                }
            }
        });
    }

    /**
     * Broadcast event to open provider drawer
     */
    private broadcastOpenDrawer(isProviderTab) {
        this.gameCategories.render(isProviderTab, () => {
            setTimeout(() => {
                ComponentManager.broadcast("drawer.open");
            }, 300);
        });
    }

    /**
     * Event listener for game launch
     */
    private listenGameLaunch() {
        ComponentManager.subscribe("game.launch", (event, src, data) => {
            if (ComponentManager.getAttribute("product") === "mobile-arcade") {
                const el = utility.hasClass(data.src, "game-list", true);
                if (el) {
                    const gameCode = el.getAttribute("data-game-code");
                    const category = this.gameCategories.getActiveCategory();
                    this.setRecentlyPlayedGame(gameCode);
                    ComponentManager.broadcast("clickstream.game.launch", {
                        srcEl: data.src,
                        category: this.gameCategories.getCategoryNameByAlias(category),
                        product: ComponentManager.getAttribute("product"),
                        response: data.response,
                    });
                }
            }
        });
    }

    /**
     * Refresh category on login
     */
    private listenOnLogin() {
        ComponentManager.subscribe("session.login", (event, src, data) => {
            if (ComponentManager.getAttribute("product") === "mobile-arcade") {
                this.refreshResponse();
            }
        });
    }

    /**
     * Refresh category on logout
     */
    private listenOnLogout() {
        ComponentManager.subscribe("session.logout.finished", (event, src, data) => {
            if (ComponentManager.getAttribute("product") === "mobile-arcade") {
                this.refreshResponse();
            }
        });
    }

    /**
     * Event listener on screen resize
     */
    private listenOnResize() {
        window.addEventListener("resize", () => {
            if (ComponentManager.getAttribute("product") === "mobile-arcade") {
                this.gameCategories.setActiveCategory(this.gameCategories.getActiveCategory());
            }
        });
    }

    /**
     * Listen for a successful search and show search results
     */
    private listenOnSearch() {
        ComponentManager.subscribe("games.search.success", (event, src, data) => {
            if (ComponentManager.getAttribute("product") === "mobile-arcade") {
                this.populateGames(data.activeCategory, data.games);
            }
        });
    }

    /**
     * Listen for a successful filter
     */
    private listenOnFilter() {
        ComponentManager.subscribe("games.filter.success", (event: Event, src, data) => {
            if (ComponentManager.getAttribute("product") === "mobile-arcade") {
                this.gamesSearch.activateSearchTab();
                if (data.filteredGames && data.filteredGames.length) {
                    this.gamesSearch.clearSearchBlurbLobby();
                    this.populateGames(data.activeCategory, data.filteredGames);
                } else {
                    const recommendedGames = this.groupedGames["recommended-games"];
                    let recommended: boolean = false;
                    if (recommendedGames) {
                        recommended = true;
                        this.populateGames(this.gameCategories.getActiveCategory(), recommendedGames);
                    }
                    this.updateBlurbForFilter(recommended);
                }
            }
        });
    }

    /**
     * Listen for closing of filter lightbox
     */
    private listenOnCloseFilter() {
        ComponentManager.subscribe("games.reload", (event: Event, src, data) => {
            if (ComponentManager.getAttribute("product") === "mobile-arcade") {
                ComponentManager.broadcast("category.change");
                const activeCategory = this.gameCategories.getActiveCategory();
                this.gameCategories.setActiveCategory(activeCategory);
                this.populateGames(activeCategory);
            }
        });
    }

    /**
     * Update filter blurb
     */
    private updateBlurbForFilter(recommended: boolean) {
        const searchBlurbEl = this.element.querySelector("#blurb-lobby");
        let recommendedBlurb = this.attachments.msg_no_recommended;
        if (recommended) {
            recommendedBlurb = this.attachments.msg_recommended_available;
        }
        recommendedBlurb = "<span>" + recommendedBlurb + "</span>";
        searchBlurbEl.innerHTML = this.attachments.filter_no_result_msg + recommendedBlurb;
    }

    /**
     * Refresh category and games
     */
    private refreshResponse() {
        this.response = undefined;
        this.generateLobby(() => {
            this.setLobby(false);
        });
    }

    /**
     * Recently Played handlers
     */

    /**
     * Set recently played game after game launch
     * @param gameCode
     */
    private setRecentlyPlayedGame(gameCode) {
        xhr({
            url: Router.generateRoute("arcade_lobby", "recent"),
            type: "json",
            method: "post",
            data: {
                gameCode,
            },
        }).then((result) => {
            if (result.success) {
                this.doUpdateSpecialCategory("getRecentlyPlayed", "recently-played");
            }
        }).fail((error, message) => {
            console.log(error);
        });
    }

    /**
     * Refresh game categories and game tiles to add
     * recently played games
     */
    private doUpdateSpecialCategory(method, category, callback?) {
        xhr({
            url: Router.generateRoute("arcade_lobby", method),
            type: "json",
        }).then((result) => {
            if (result) {
                if (callback) {
                    callback(result);
                }
                this.updateLobbyByCategory(result, category);
            }
        }).fail((error, message) => {
            console.log(error);
        });
    }

    /**
     * Favorites handlers
     */
    /**
     * Event listener for favorites click
     */
    private listenFavoriteClick() {
        ComponentManager.subscribe("click", (event, src) => {
            const el = utility.hasClass(src, "game-favorite", true);
            if (el && this.attachments.authenticated) {
                const gameCode = el.parentElement.getAttribute("data-game-code");
                xhr({
                    url: Router.generateRoute("arcade_lobby", "favorite"),
                    type: "json",
                    method: "post",
                    data: {
                        gameCode,
                    },
                }).then((result) => {
                    if (result.success) {
                        this.doUpdateSpecialCategory("getFavorites", "favorites", (response) => {
                            this.setFavoritesList(response);
                        });
                        utility.toggleClass(el, "active");
                    }
                }).fail((error, message) => {
                    console.log(error);
                });
            }
        });
    }

    /**
     * Refresh game categories and game tiles to add
     * recently played / favorites games
     */
    private updateLobbyByCategory(result, category) {
        const categoryGames = this.getGamesDefinition(result, this.response.games["all-games"]);

        this.response.games[category] = categoryGames;
        this.groupedGames[category] = categoryGames;
        // re-render categories, if recently played / favorites is not yet active
        if (this.gameCategories.getFilteredCategoriesAlias().indexOf(category) === -1
            || !categoryGames.length) {
            this.gameCategories.setCategories(this.response.categories, this.groupedGames);
            this.gameCategories.render(false);
        }
        // re-render games if active category is recently played / favorites
        if (this.gameCategories.getActiveCategory() === category || !categoryGames.length) {
            this.populateGames(this.gameCategories.getActiveCategory());
        }

        if (!categoryGames.length) {
            window.location.hash = this.gameCategories.getActiveCategory();
        }
    }

    /**
     * Set favorites list to be used to set favorites icon state
     */
    private setFavoritesList(favorites) {
        this.favoritesList = [];
        if (favorites) {
            for (const id of favorites) {
                this.favoritesList[id.substr(3)] = "active";
            }
        }
    }
}
