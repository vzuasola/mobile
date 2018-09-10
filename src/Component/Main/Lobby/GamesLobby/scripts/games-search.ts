import Search from "@app/assets/script/components/search";
import * as Handlebars from "handlebars/runtime";
import * as gamesSearchTemplate from "../handlebars/games-search-result.handlebars";
import * as gameTemplate from "../handlebars/games.handlebars";
import * as utility from "@core/assets/js/components/utility";

import {ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Loader} from "@app/assets/script/components/loader";
import {Modal} from "@app/assets/script/components/modal";
/**
 *
 */
export class GamesSearch {
    private searchObj: Search;
    private isLogin: boolean;
    private favoritesList;
    private element;
    private config: any;
    private gamesList: any;

    constructor() {
        this.searchObj = new Search({
            fields: ["title", "keywords"],
            onSuccess: (response, keyword) => {
                return this.onSuccessSearch(response, keyword);
            },
            onFail: (keyword) => {
                return this.onFailedSearch(keyword);
            },
            onBefore: (data) => {
                return this.onBeforeSearch(data);
            },
        });
    }

    handleOnLoad(element: HTMLElement, attachments: {authenticated: boolean, search_config: any }) {
        this.isLogin = attachments.authenticated;
        this.config = attachments.search_config;
        this.element = element;
        this.listenActivateSearchLightbox();
        this.listenChangeGameSearch();
        this.listenClickSearchButton();
        this.listenClickBackButton();
    }

    handleOnReLoad(element: HTMLElement, attachments: {authenticated: boolean, search_config: any }) {
        this.isLogin = attachments.authenticated;
        this.config = attachments.search_config;
        this.element = element;
    }

    setGamesList(gamesList) {
        if (gamesList) {
            const allGames = [];
            for (const games of gamesList.games["all-games"]) {
                for (const game of games) {
                    allGames.push(game);
                }
            }
            this.gamesList = gamesList;
            this.favoritesList = gamesList.favorite_list;
            this.searchObj.setData(allGames);
        }
    }

    /**
     * Callback function on search success on search preview
     * and search games result via lobby
     */
    private onSuccessSearch(response, keyword) {
        const previewTemplate = gamesSearchTemplate({
            games: response,
            favorites: this.favoritesList,
            isLogin: this.isLogin,
        });

        this.updateSearchBlurb(response.length, keyword);
        const gamesPreview = this.element.querySelector(".games-search-result");

        if (gamesPreview) {
            gamesPreview.innerHTML = previewTemplate;
        }

        this.onSuccessSearchLobby(response);
    }

    private onSuccessSearchLobby(response) {
        const activeCategory = utility.getHash(window.location.href);
        const groupedGames: any = [];
        let gamesList: any = [];
        let counter: number = 1;

        for (const games of response) {
            gamesList.push(games);
            groupedGames[counter] = gamesList;
            if (counter % 3 === 0) {
                gamesList = [];
                counter = 1;
            }

            counter++;
        }

        // set search tab as active tab
        utility.removeClass(this.element.querySelector(".category-" + activeCategory), "active");
        utility.addClass(this.element.querySelector(".search-tab"), "active");
        // populate search results in games lobby search tab
        this.setGames(groupedGames);
    }

    private onBeforeSearch(data) {
        // placeholder
    }

    /**
     * Callback function on search fail
     */
    private onFailedSearch(keyword) {
        // placeholder
    }

    /**
     * Function that updates search blurb
     * @param {[int]} count   [number of results found]
     * @param {[string]} keyword [search query]
     */
    private updateSearchBlurb(count, keyword) {
        const blurb = this.config.search_blurb;
        if (this.config.search_blurb) {
            this.element.querySelector(".search-blurb").innerHTML = blurb.replace("{count}", count)
               .replace("{keyword}", keyword);
        }
    }

    /**
     * Function that shows active category games before initiating a search.
     */
    private showActiveCategoryTab() {
        const activeCategory = utility.getHash(window.location.href);
        if (this.gamesList.games[activeCategory]) {
            // repopulate list of games for active tab
            this.setGames(this.gamesList.games[activeCategory]);
            // remove active state of search tab
            utility.removeClass(this.element.querySelector(".search-tab"), "active");
            utility.addClass(this.element.querySelector(".category-" + activeCategory), "active");
        }
    }

    /**
     * Function that populates game tiles in games lobby.
     */
    private setGames(gamesList) {
        const gamesLobby = this.element.querySelector("#game-container");
        if (gamesLobby) {
            const lobbyTemplate = gameTemplate({
                games: gamesList,
                favorites: this.favoritesList,
                isLogin: this.isLogin,
            });

            gamesLobby.innerHTML = lobbyTemplate;
        }
    }

    /**
     * Function that clears search results.
     */
    private clearSearchResult() {
        this.element.querySelector(".games-search-result").innerHTML = "";
        this.element.querySelector(".games-search-input").value = "";
        this.element.querySelector(".search-blurb").innerHTML = "";
    }

    /**
     * Function that shows search lightbox.
     */
    private listenActivateSearchLightbox() {
        ComponentManager.subscribe("click", (event, src) => {
            const el = utility.hasClass(src, "search-tab", true);
            if (el) {
                event.preventDefault();
                ComponentManager.broadcast("games.search");
            }
        });

        ComponentManager.subscribe("games.search", (event, src) => {
            Modal.open("#games-search-lightbox");
        });
    }

    /**
     * Games search preview.
     */
    private listenChangeGameSearch() {
        ComponentManager.subscribe("keyup", (event, src) => {
            const keyword =  this.element.querySelector(".games-search-input");
            if (keyword && keyword.value) {
                this.searchObj.search(keyword.value);
            }
        });
    }

    /**
     * Listens for click event on search button.
     * Shows games search result in games lobby.
     */
    private listenClickSearchButton() {
        ComponentManager.subscribe("click", (event, src) => {
            const el = utility.hasClass(src, "games-search-submit", true);
            const keyword = this.element.querySelector(".games-search-input");
            if (el && keyword.value) {
                this.searchObj.search(keyword.value);
                this.clearSearchResult();
                Modal.close("#games-search-lightbox");
            }
        });
    }

    /**
     * Listens for click event on back button.
     * Shows games of active category in lobby before initiating search.
     */
    private listenClickBackButton() {
        ComponentManager.subscribe("click", (event, src) => {
            const el = utility.hasClass(src, "games-search-back", true);
            if (el) {
                this.clearSearchResult();
                this.showActiveCategoryTab();
                Modal.close("#games-search-lightbox");
            }
        });
    }
}
