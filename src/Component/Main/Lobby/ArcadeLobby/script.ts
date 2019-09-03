import * as utility from "@core/assets/js/components/utility";
import * as categoriesTemplate from "./handlebars/categories.handlebars";
import * as gameTemplate from "./handlebars/games.handlebars";
import {LazyLoader} from "./scripts/lazy-loader";
import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router, RouterClass} from "@plugins/ComponentWidget/asset/router";

import * as xhr from "@core/assets/js/vendor/reqwest";
import { GamesCategory } from "./scripts/games-category";
/**
 *
 */
export class ArcadeLobbyComponent implements ComponentInterface {
    private element: HTMLElement;
    private attachments: any;
    private response: any;
    private groupedGames: any;
    private lazyLoader: LazyLoader;
    private gameCategories: GamesCategory;
    private productMenu: string = 'product-arcade';

    constructor() {
        this.lazyLoader = new LazyLoader();
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
            this.element,
        );
        this.generateLobby(() => {
            this.highlightMenu();
            this.setLobby();
        });

        this.listenHashChange();
        this.listenClickGameTile();
        this.listenToScroll();
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
        }
        this.response = undefined;
        this.element = element;
        this.attachments = attachments;
        this.gameCategories = new GamesCategory(
            this.attachments,
            this.element,
        );

        this.generateLobby(() => {
            this.highlightMenu();
            this.setLobby();
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
    private setLobby() {
        // group games by category
        const groupedGames = this.groupGamesByCategory();
        this.groupedGames = this.sortGamesByCategory(groupedGames);
        // populate categories
        this.gameCategories.setCategories(this.response.categories, this.groupedGames);
        this.gameCategories.render();
        // populate games
        this.populateGames(this.gameCategories.getActiveCategory());
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

        promises.games = gamesList;
        return promises;
    }

    /**
     * Creates array of games
     * @param key
     * @param list 
     * @param gamesList 
     */
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

    /**
     * Populate game thumbnails
     */
    private populateGames(activeCategory) {
        /* tslint:disable:no-string-literal */
        const enableLazyLoad = (this.attachments.configs.hasOwnProperty("lobby_infinite_scroll")) ?
        this.attachments.configs["lobby_infinite_scroll"] : false;
        /* tslint:disable:no-string-literal */
        this.lazyLoader.init(
            this.groupedGames[activeCategory],
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

        return gamesList;
    }

    /**
     * Sorts games by weight
     * @param gamesList
     */
    private sortGamesByCategory(gamesList) {
        for (const category in gamesList) {
            if (gamesList.hasOwnProperty(category)) {
                let categoryGames = gamesList[category];
                categoryGames = categoryGames.sort((a, b) => {
                    return a.categories[category] - b.categories[category];
                });
                gamesList[category] = categoryGames;
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
            this.showLogin(el);
        });
    }

}
