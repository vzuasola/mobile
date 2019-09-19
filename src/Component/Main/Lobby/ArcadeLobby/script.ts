declare var navigator: any;

import * as utility from "@core/assets/js/components/utility";
import {LazyLoader} from "./scripts/lazy-loader";
import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";

import * as xhr from "@core/assets/js/vendor/reqwest";
import { GamesCategory } from "./scripts/games-category";
import {GamesCollectionSorting} from "./scripts/games-collection-sorting";
import {GamesSearch} from "./scripts/games-search";
import PopupWindow from "@app/assets/script/components/popup";
/**
 *
 */
export class ArcadeLobbyComponent implements ComponentInterface {
    private element: HTMLElement;
    private attachments: any;
    private response: any;
    private groupedGames: any;
    private windowObject: any;
    private lazyLoader: LazyLoader;
    private gameCategories: GamesCategory;
    private gamesCollectionSort: GamesCollectionSorting;
    private gamesSearch: GamesSearch;
    private productMenu: string = "product-arcade";

    constructor() {
        this.lazyLoader = new LazyLoader();
        this.gamesCollectionSort = new GamesCollectionSorting();
        this.gamesSearch = new GamesSearch();
    }

    onLoad(element: HTMLElement, attachments: {
        authenticated: boolean,
        product: any[],
        pagerConfig: any[],
        configs: any[],
    }) {
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

        this.listenHashChange();
        this.listenClickGameTile();
        this.listenToScroll();
        this.listenGameLaunch();
        this.listenToLaunchGameLoader();
        this.listenOnLogin();
        this.listenOnLogout();
        this.listenOnResize();
        this.listenOnSearch();
        this.gamesSearch.handleOnLoad(this.element, this.attachments);
    }

    onReload(element: HTMLElement, attachments: {
        authenticated: boolean,
        product: any[],
        pagerConfig: any[],
        configs: any[],
    }) {
        if (!this.element) {
            this.listenHashChange();
            this.listenClickGameTile();
            this.listenToScroll();
            this.listenGameLaunch();
            this.listenToLaunchGameLoader();
            this.listenOnLogin();
            this.listenOnLogout();
            this.listenOnResize();
            this.listenOnSearch();
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

        this.gamesSearch.handleOnReLoad(this.element, this.attachments);
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
    private setLobby() {
        // group games by category
        const groupedGames = this.groupGamesByCategory();
        this.groupedGames = this.sortGamesByGamesCollection(groupedGames);
        // populate categories
        this.gameCategories.setCategories(this.response.categories, this.groupedGames);
        this.gameCategories.render();
        // populate games
        const activeCategory = this.gameCategories.getActiveCategory();
        this.populateGames(activeCategory);
        this.gamesSearch.setGamesList(this.groupedGames, this.response, activeCategory);
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
                let uri = Router.generateRoute("arcade_lobby", currentRequest.type);
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

    /**
     * Creates lists of ajax requests to be called
     */
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
            type: "getGamesCollection",
        };

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
        const promises = [];
        for (let page = 0; page < this.attachments.pagerConfig.total_pages; page++) {
            promises.push("pager" + page);
        }
        promises.push("recent");
        promises.push("fav");
        promises.push("games-collection");
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
                    gamesList["all-games"] = response.games["all-games"];
                }
            }
        }

        if (responses.hasOwnProperty("fav")) {
            gamesList.favorites = this.getGamesDefinition(responses.fav, gamesList["all-games"]);
        }

        if (responses.hasOwnProperty("recent")) {
            gamesList["recently-played"] = this.getGamesDefinition(responses.recent, gamesList["all-games"]);
        }

        if (responses.hasOwnProperty("games-collection")) {
            promises.gamesCollection = responses["games-collection"];
        }
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
            activeCategory,
            enableLazyLoad,
        );
    }

    /**
     * Groups games by category
     */
    private groupGamesByCategory() {
        const gamesList: any = [];
        gamesList["all-games"] = [];
        gamesList["recently-played"] = [];
        gamesList["favorites"]  = [];
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
        return gamesList;
    }

    /**
     * Sorts games via Games Collection Sorting
     * @param gamesList
     */
    private sortGamesByGamesCollection(gamesList) {
        const sortedGamesList: any = [];
        const exempFromSort: any = ["favorites", "recently-played"];

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

    /**
     * Event Listeners
     */

    /**
     * Event listener for url hash change
     */
    private listenHashChange() {
        utility.listen(window, "hashchange", (event, src: any) => {
            if (ComponentManager.getAttribute("product") === "mobile-arcade") {
                this.setLobby();
                if (utility.getHash(window.location.href) !== this.gameCategories.getActiveCategory()) {
                    window.location.hash = this.gameCategories.getActiveCategory();
                }
            }
        });
    }

    /**
     * Event listener for url hash change
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
     * Event listener for game item click
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
                const filteredCategories = this.response.categories.filter((prov, key) => {
                    return prov.field_games_is_sub_category === "0";
                });

                this.gameCategories.setCategories(filteredCategories, this.groupedGames);
                this.gameCategories.sortProviders(this.response.providers_list);
                this.gameCategories.render(() => {
                    setTimeout(() => {
                        ComponentManager.broadcast("drawer.open");
                    }, 300);
                });
            }

            const drawer = utility.hasClass(src, "providers-more");
            if (drawer) {
                this.gameCategories.setCategories(this.response.categories, this.groupedGames);
                this.gameCategories.render(() => {
                    setTimeout(() => {
                        ComponentManager.broadcast("drawer.open");
                    }, 300);
                });
            }
        });
    }

    /**
     * Event listener for game item click
     */
    private listenGameLaunch() {
        ComponentManager.subscribe("game.launch", (event, src, data) => {
            if (ComponentManager.getAttribute("product") === "mobile-arcade") {
                const el = utility.hasClass(data.src, "game-list", true);
                if (el) {
                    const gameCode = el.getAttribute("data-game-code");
                    this.setRecentlyPlayedGame(gameCode);
                }
            }
        });
    }

    /**
     * Event listener for launching pop up loader
     */
    private listenToLaunchGameLoader() {
        ComponentManager.subscribe("game.launch.loader", (event, src, data) => {
            if (ComponentManager.getAttribute("product") === "mobile-arcade") {
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

                if (!this.windowObject && (data.options.target === "popup" || data.options.target === "_blank")) {
                    return;
                }

                // handle redirects if we are on a PWA standalone
                if (((navigator.standalone || window.matchMedia("(display-mode: standalone)").matches) ||
                    source === "pwa") ||
                    (data.options.target !== "popup" || data.options.target !== "_blank")
                ) {
                    window.location.href = url;
                    return;
                }
            }
        });
    }

    /**
     * Refresh category on login
     */
    private listenOnLogin() {
        ComponentManager.subscribe("session.login", (event, src, data) => {
            this.refreshResponse();
        });
    }

    /**
     * Refresh category on logout
     */
    private listenOnLogout() {
        ComponentManager.subscribe("session.logout", (event, src, data) => {
            this.refreshResponse();
        });
    }

    /**
     * Event listener on screen resize
     */
    private listenOnResize() {
        window.addEventListener("resize", () => {
            this.gameCategories.setActiveCategory(this.gameCategories.getActiveCategory());
        });
    }

    /**
     * Listen for a successful search and show search results
     */
    private listenOnSearch() {
        ComponentManager.subscribe("games.search.success", (event, src, data) => {
           this.populateGames(data.activeCategory, data.games);
        });
    }

    /**
     * Refresh category and games
     */
    private refreshResponse() {
        this.response = undefined;
        this.generateLobby(() => {
            this.setLobby();
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
                this.getRecentlyPlayedGame();
            }
        }).fail((error, message) => {
            console.log(error);
        });
    }

    /**
     * Refresh game categories and game tiles to add
     * recently played games
     */
    private getRecentlyPlayedGame() {
        xhr({
            url: Router.generateRoute("arcade_lobby", "getRecentlyPlayed"),
            type: "json",
        }).then((result) => {
            if (result) {
                const activeCategory = this.gameCategories.getActiveCategory();
                const recentlyPlayedGames = this.getGamesDefinition(result, this.response.games["all-games"]);
                this.response.games["recently-played"] = recentlyPlayedGames;
                this.groupedGames["recently-played"] = recentlyPlayedGames;
                // re-render categories, if recently played is not yet active
                if (this.gameCategories.getFilteredCategoriesAlias().indexOf("recently-played") === -1) {
                    this.gameCategories.setCategories(this.response.categories, this.groupedGames);
                    this.gameCategories.render();
                }
                // re-render games if active category is recently played
                if (activeCategory === "recently-played") {
                    this.populateGames(activeCategory);
                }
            }
        }).fail((error, message) => {
            console.log(error);
        });
    }

}
