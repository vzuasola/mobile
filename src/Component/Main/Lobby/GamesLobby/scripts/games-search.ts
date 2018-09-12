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
    private searchFields = ["title", "keywords"];

    constructor() {
        this.searchObj = new Search({
            fields: this.searchFields,
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

    handleOnLoad(element: HTMLElement, attachments: {authenticated: boolean,
            title_weight: number,
            keywords_weight: 0,
            no_result_msg: string,
            search_blurb: string,
        }) {
        this.isLogin = attachments.authenticated;
        this.config = attachments;
        this.element = element;
        this.listenActivateSearchLightbox();
        this.listenActivateSearchFilterLightbox();
        this.listenChangeGameSearch();
        this.listenClickSearchButton();
        this.listenClickBackButton();
        this.listenClickFavoriteOnPreview();
        this.listenCategoryChange();
        this.listenClickClearIcon();
        this.listenOnLogin();
    }

    handleOnReLoad(element: HTMLElement, attachments: {authenticated: boolean,
            title_weight: number,
            keywords_weight: 0,
            no_result_msg: string,
            search_blurb: string,
        }) {
        this.isLogin = attachments.authenticated;
        this.config = attachments;
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
        const blurb = this.config.search_blurb;
        const sortedGames = this.sortSearchResult(keyword, response);
        const previewTemplate = gamesSearchTemplate({
            games: sortedGames,
            favorites: this.favoritesList,
            isLogin: this.isLogin,
        });

        this.updateSearchBlurb(blurb, { count: response.length, keyword });
        const gamesPreview = this.element.querySelector(".games-search-result");

        if (gamesPreview) {
            gamesPreview.innerHTML = previewTemplate;
        }

        this.onSuccessSearchLobby(sortedGames);
    }

    private onSuccessSearchLobby(response) {
        const activeCategory = utility.getHash(window.location.href);
        const groupedGames: any = [];
        let gamesList: any = [];
        let counter: number = 1;

        for (const games of response) {
            gamesList.push(games);
            if (counter % 3 === 0) {
                groupedGames.push(gamesList);
                gamesList = [];
                counter = 0;
            }
            counter++;
        }

        if (gamesList.length) {
            groupedGames.push(gamesList);
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
        const blurb = this.config.no_result_msg;
        this.updateSearchBlurb(blurb, { count: 0, keyword });

        this.element.querySelector(".games-search-result").innerHTML = "";
        this.element.querySelector("#game-container").innerHTML = "";
    }

    /**
     * Function that updates search blurb
     * @param {[int]} count   [number of results found]
     * @param {[string]} keyword [search query]
     */
    private updateSearchBlurb(blurb, data: { count: number, keyword: string}) {
         if (blurb) {
            const searchBlurbEl = this.element.querySelectorAll(".search-blurb");
            for (const blurbEl of searchBlurbEl) {
                blurbEl.innerHTML = blurb.replace("{count}", data.count)
                   .replace("{keyword}", data.keyword);
            }
        }
    }

    /**
     * Function that shows active category games before initiating a search.
     */
    private showActiveCategoryTab(srcElement) {
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
        this.clearSearchBlurb();
    }

    private clearSearchBlurb() {
        const searchBlurbEl = this.element.querySelectorAll(".search-blurb");
        for (const blurbEl of searchBlurbEl) {
            blurbEl.innerHTML = "";
        }
    }

    private deactivateSearchTab() {
        utility.removeClass(this.element.querySelector(".search-tab"), "active");
    }

    /*
     * Function that computes sort weight for search results
     */
    private setSortWeightPerGame(keyword, result) {
        const sortedGames = [];
        const sortWeight = {
            title: this.config.title_weight,
            keywords: this.config.keywords_weight,
        };

        const keywords = utility.clone(keyword).split(" ");

        for (const game of result) {
            let weight: number = 0;
            for (const searchField of this.searchFields) {
                for (const query of keywords) {
                    const gameSearchValues = utility.clone(game[searchField]).split(" ");
                    for (const gameSearchValue of gameSearchValues) {
                        if (gameSearchValue.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
                            weight = weight + parseFloat(sortWeight[searchField]);
                        }
                    }
                }
            }
            game.weight = weight.toFixed(2);
            sortedGames.push(game);
        }

        return sortedGames;
    }

    /*
     * Function that sorts search result
     */
    private sortSearchResult(keyword, result) {
        const sortedGames = this.setSortWeightPerGame(keyword, result);
        sortedGames.sort((a, b) => {
            if (a.weight > b.weight) {
                return -1;
            }

            // if weights are equal sort by name asc
            if (a.title < b.title) {
                return -1;
            }
            if (a.title > b.title) {
                return 1;
            }

            return 0;
        });

        return sortedGames;
    }

    /**
     * Function that shows search lightbox.
     */
    private listenActivateSearchLightbox() {
        ComponentManager.subscribe("click", (event, src) => {
            const el = utility.hasClass(src, "search-tab", true);
            if (el) {
                event.preventDefault();
                this.clearSearchResult();
                ComponentManager.broadcast("games.search");
            }
        });

        ComponentManager.subscribe("games.search", (event, src) => {
            Modal.open("#games-search-lightbox");
        });
    }

    /**
     * Function that shows search filter lightbox.
     */
    private listenActivateSearchFilterLightbox() {
        ComponentManager.subscribe("click", (event, src) => {
            const el = utility.hasClass(src, "games-filter", true);
            if (el) {
                event.preventDefault();
                ComponentManager.broadcast("games.search.filter");
            }
        });

        ComponentManager.subscribe("games.search.filter", (event, src) => {
            Modal.open("#games-search-filter-lightbox");
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
            } else {
                this.clearSearchResult();
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
                this.clearSearchResult();
                this.searchObj.search(keyword.value);
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
                event.preventDefault();
                this.clearSearchResult();
                this.showActiveCategoryTab(el);
                Modal.close("#games-search-lightbox");
            }
        });
    }

    /**
     * Listens for click event on successful adding of favorites.
     * Updates favorites icon state.
     */
    private listenClickFavoriteOnPreview() {
        ComponentManager.subscribe("games.favorite", (event, src, data) => {
            utility.toggleClass(data.srcElement, "active");
        });
    }

    private listenCategoryChange() {
        ComponentManager.subscribe("category.change", (event, src, data) => {
            this.deactivateSearchTab();
            this.clearSearchBlurb();
        });
    }

    private listenClickClearIcon() {
        ComponentManager.subscribe("click", (event, src, data) => {
            const el = utility.hasClass(src, "close-icon", true);
            if (el) {
                this.clearSearchResult();
            }
        });
    }

     private listenOnLogin() {
        ComponentManager.subscribe("header.login", (event, src, data) => {
            const el = utility.hasClass(data.src, "game-listing-item", true);
            if (el && utility.hasClass(this.element.querySelector("#games-search-lightbox"),
                "modal-active")) {
                Modal.close("#games-search-lightbox");
            }
        });
    }
}
