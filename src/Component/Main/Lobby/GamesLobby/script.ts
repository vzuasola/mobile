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
        }) {
        this.response = null;
        this.element = element;
        this.attachments = attachments;
        this.isLogin = attachments.authenticated;
        this.product = attachments.product;
        this.pager = 0;
        this.currentPage = 0;
        this.load = true;
        this.listenChangeCategory();
        this.listenHashChange();
        this.listenClickGameTile();
        this.listenGameLaunch();
        this.listenFavoriteClick();
        this.generateLobby();
        this.listenToCategory();
        this.listenToScroll();
        this.listenToSwipe();
        this.initMarker();
        this.listenOnSearch();
        this.listenOnFilter();
        this.pager = 0;
        this.currentPage = 0;
        this.load = true;
        this.gamesSearch.handleOnLoad(this.element, attachments);
        this.gamesFilter.handleOnLoad(this.element, attachments);
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
        }) {
        this.response = null;
        this.element = element;
        this.attachments = attachments;
        this.isLogin = attachments.authenticated;
        this.product = attachments.product;
        this.pager = 0;
        this.currentPage = 0;
        this.load = true;
        this.generateLobby();
        this.listenToSwipe();
        this.initMarker();
        this.gamesSearch.handleOnReLoad(this.element, attachments);
        this.gamesFilter.handleOnReLoad(this.element, attachments);
        this.pager = 0;
        this.currentPage = 0;
        this.load = true;
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
            this.gamesFilter.setGamesList(response);
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

        ComponentManager.broadcast("category.set", {
            scroll: false,
        });
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
    private setGames(data, page: number = 0) {
        const gamesEl = this.element.querySelector("#game-container");
        const pager = this.getPagedContent(data);

        let template = gameTemplate({
            games: pager[page],
            favorites: this.response.favorite_list,
            isLogin: this.isLogin,
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
            if (src.getAttribute("data-category-filter-id")) {
                const categoriesEl = this.element.querySelector("#game-categories");
                const activeLink = categoriesEl.querySelector(".category-tab .active a");
                utility.addClass(activeLink, "active");

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
            this.currentPage = 0;
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
                const categoriesEl = this.element.querySelector("#game-categories");
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
                const categoriesEl = this.element.querySelector("#game-categories");
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
                this.activateSearchTab();
                this.searchResults = data.filteredGames;
                this.setGames(data.filteredGames);
            } else {
                const gamesEl = this.element.querySelector("#game-container");
                let recommended: boolean = false;
                gamesEl.innerHTML = "";
                this.activateSearchTab();
                if (this.response.games["recommended-games"]) {
                    this.searchResults = this.response.games["recommended-games"];
                    this.setGames(this.response.games["recommended-games"]);
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
                    const hash = utility.getHash(window.location.href);
                    let pager = this.getPagedContent(this.response.games[hash]);

                    if (utility.hasClass(this.element.querySelector(".search-tab"), "active")) {
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
             this.setGames(data.games);
         });
     }

    private activateSearchTab() {
        const activeCategory = utility.getHash(window.location.href);
        // set search tab as active tab
        utility.removeClass(this.element.querySelector(".category-" + activeCategory), "active");
        utility.addClass(this.element.querySelector(".search-tab"), "active");
        utility.addClass(this.element.querySelector(".search-blurb"), "active");
    }

    private isSeen(el) {
        if (el) {
            return el.getBoundingClientRect().bottom <= window.innerHeight;
        }
    }

    private getPagedContent(data) {
        const temp = data.slice(0);
        const batch: any = [];
        while (temp.length > 0) {
            batch.push(temp.splice(0, 4));
        }
        this.pager = batch.length;

        return batch;
    }

}
