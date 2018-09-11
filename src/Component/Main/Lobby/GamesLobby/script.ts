import * as utility from "@core/assets/js/components/utility";
import * as Handlebars from "handlebars/runtime";

import * as xhr from "@core/assets/js/vendor/reqwest";

import * as categoriesTemplate from "./handlebars/categories.handlebars";
import * as gameTemplate from "./handlebars/games.handlebars";

import {GameLauncher} from "@app/src/Module/GameIntegration/scripts/game-launcher";
import {ComponentManager, ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@core/src/Plugins/ComponentWidget/asset/router";

import {Loader} from "@app/assets/script/components/loader";
import {GamesSearch} from "./scripts/games-search";
import Xlider from "@app/assets/script/components/xlider";

/**
 *
 */
export class GamesLobbyComponent implements ComponentInterface {
    private element: HTMLElement;
    private response: any;
    private isLogin: boolean;
    private gameLauncher;
    private gamesSearch: GamesSearch;

    constructor() {
        this.gameLauncher = GameLauncher;
        this.gamesSearch = new GamesSearch();
    }

    onLoad(element: HTMLElement, attachments: {
            authenticated: boolean,
            title_weight: number,
            keywords_weight: 0,
            no_result_msg: string,
            search_blurb: string,
        }) {
        this.response = null;
        this.element = element;
        this.isLogin = attachments.authenticated;
        this.listenChangeCategory();
        this.listenHashChange();
        this.listenClickGameTile();
        this.listenGameLaunch();
        this.listenFavoriteClick();
        this.generateLobby();
        this.listenToCategory();
        this.gamesSearch.handleOnLoad(this.element, attachments);
    }

    onReload(element: HTMLElement, attachments: {
            authenticated: boolean,
            title_weight: number,
            keywords_weight: 0,
            no_result_msg: string,
            search_blurb: string,
        }) {
        this.response = null;
        this.element = element;
        this.isLogin = attachments.authenticated;
        this.generateLobby();
        this.gamesSearch.handleOnReLoad(this.element, attachments);
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
    private generateLobby() {

        if (!this.response) {
            this.doRequest();
        } else {
            this.setLobby();
        }
    }

    /**
     * Request games lobby to games lobby component controller lobby method
     */
    private doRequest() {
        xhr({
            url: Router.generateRoute("games_lobby", "lobby"),
            type: "json",
        }).then((response) => {
            this.response = response;
            this.gamesSearch.setGamesList(response);
            this.setLobby();
        }).fail((error, message) => {
            console.log(error);
        });
    }

    /**
     * Populate lobby with the set response
     */
    private setLobby(key?: string) {
        if (!key) {
            key = this.response.categories[0].field_games_alias;
            key = this.getActiveCategory(this.response.games, key);
            window.location.hash = key;
        }
        this.setCategories(this.response.categories, key);
        this.setGames(this.response.games[key]);
    }

    /**
     * Set the category in the template
     *
     */
    private setCategories(data, key) {
        const template = categoriesTemplate({
            categories: data,
            active: key,
        });

        const categoriesEl = this.element.querySelector("#game-categories");

        if (categoriesEl) {
            categoriesEl.innerHTML = template;
        }

        ComponentManager.broadcast("category.set");
    }

    /**
     * Get the hash in the url or the first returned category
     *
     */
    private getActiveCategory(gamesList, key) {
        const hash = utility.getHash(window.location.href);

        if (gamesList[hash]) {
            return hash;
        }

        return key;
    }

    /**
     * Set the games list in the template
     */
    private setGames(data) {
        const template = gameTemplate({
            games: data,
            favorites: this.response.favorite_list,
            isLogin: this.isLogin,
        });

        const gamesEl = this.element.querySelector("#game-container");

        if (gamesEl) {
            gamesEl.innerHTML = template;
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

                utility.removeClass(activeLink, "active");
                utility.removeClass(activeLink.parentElement, "active");

                utility.addClass(src, "active");
                utility.addClass(src.parentElement, "active");

                const key = src.getAttribute("data-category-filter-id");
                this.setGames(this.response.games[key]);
                ComponentManager.broadcast("category.change");
            }
        });
    }

    /**
     * Event listener for category click
     */
    private listenHashChange() {
        utility.listen(window, "hashchange", (event, src: any) => {

            let key = this.response.categories[0].field_games_alias;
            key = this.getActiveCategory(this.response.games, key);
            window.location.hash = key;

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

            utility.removeClass(activeLink, "active");
            utility.removeClass(activeLink.parentElement, "active");

            utility.addClass(src, "active");
            utility.addClass(src.parentElement, "active");

            this.setGames(this.response.games[key]);
            ComponentManager.broadcast("category.change");
        });
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
                        this.generateLobby();
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
                        this.generateLobby();
                        ComponentManager.broadcast("games.favorite", { srcElement: el });
                    }
                }).fail((error, message) => {
                    console.log(error);
                });
            }
        });
    }

    private listenToCategory() {
        ComponentManager.subscribe("category.set", (event, src, data) => {
            const categoriesEl = this.element.querySelector("#game-categories");
            const activeLink = categoriesEl.querySelector(".category-tab .active a");
            const categories = categoriesEl.querySelectorAll(".category-tab");
            const categoryScroll = categoriesEl.querySelector("#category-tab");
            let scroll = 0;
            for (const id in categories) {
                if (categories.hasOwnProperty(id)) {
                    const category = categories[id];
                    scroll += category.getBoundingClientRect().width;
                    if (utility.hasClass(category, "active")) {
                        scroll -= category.getBoundingClientRect().width;
                        break;
                    }
               }
            }
            categoryScroll.scrollLeft = scroll;
        });
    }
}
