import Search from "@app/assets/script/components/search";
import * as utility from "@core/assets/js/components/utility";

import {ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Loader} from "@app/assets/script/components/loader";
import {Modal} from "@app/assets/script/components/modal";
import {RecommendedGames} from "./recommended-games";
/**
 *
 */
export class GamesSearch {
    private searchObj: Search;
    private isLogin: boolean;
    private isRecommended: boolean;
    private favoritesList;
    private element;
    private config: any;
    private gamesList: any;
    private searchFields = ["title", "keywords"];
    private searchResult;
    private searchKeyword;
    private searchBlurb;
    private recommendedGames;
    private timer;

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
            search_no_result_msg: string,
            search_blurb: string,
            msg_recommended_available: string,
            msg_no_recommended: string,
            product: any[],
        }) {
        this.isLogin = attachments.authenticated;
        this.config = attachments;
        this.element = element;
        this.listenActivateSearchField();
        this.listenChangeGameSearch();
        this.listenClickFavoriteOnPreview();
        this.listenClickClearIcon();
        this.listenOnLogin();
        this.listenSubmitGameSearch();
    }

    handleOnReLoad(element: HTMLElement, attachments: {authenticated: boolean,
            title_weight: number,
            keywords_weight: 0,
            search_no_result_msg: string,
            search_blurb: string,
            msg_recommended_available: string,
            msg_no_recommended: string,
            product: any[],
        }) {
        if (!this.element) {
            this.listenActivateSearchField();
            this.listenChangeGameSearch();
            this.listenClickFavoriteOnPreview();
            this.listenClickClearIcon();
            this.listenOnLogin();
            this.listenSubmitGameSearch();
        }
        this.isLogin = attachments.authenticated;
        this.config = attachments;
        this.element = element;
    }

    setGamesList(gamesList) {
        if (gamesList && gamesList.games["all-games"]) {
            const allGames = [];
            for (const games of gamesList.games["all-games"]) {
                for (const game of games) {
                    allGames.push(game);
                }
            }
            this.gamesList = gamesList;
            this.favoritesList = gamesList.favorite_list;
            this.searchObj.setData(allGames);
            this.recommendedGames = new RecommendedGames(this.gamesList, this.config, gamesList.enableRecommended);
        }
    }

    /**
     * Callback function on search success on search preview
     * and search games result via lobby
     */
    private onSuccessSearch(response, keyword) {
        let blurb = this.config.search_blurb;
        blurb = "<span>" + blurb + "</span>";
        const sortedGames = this.sortSearchResult(keyword, response);
        this.searchResult = sortedGames;
        this.searchKeyword = keyword;
        this.searchBlurb = blurb;

        // set search blurb
        this.updateSearchBlurb(blurb, this.element.querySelector("#blurb-lobby"),
            { count: response.length, keyword });
        // populate search results in games preview
        this.setGamesResult(sortedGames);
    }

    private onBeforeSearch(data) {
        // placeholder
        this.isRecommended = false;
    }

    /**
     * Callback function on search fail
     */
    private onFailedSearch(keyword) {
        let blurb = this.config.search_no_result_msg;
        blurb = "<span>" + blurb + "</span>";
        const recommendedGames = this.recommendedGames.getGames();
        let recommendedBlurb = this.recommendedGames.getBlurb();
        if (recommendedBlurb) {
            recommendedBlurb = "<span>" + recommendedBlurb + "</span>";
            blurb = blurb.concat(recommendedBlurb);
        }

        this.searchKeyword = keyword;
        this.searchBlurb = blurb;
        this.updateSearchBlurb(blurb, this.element.querySelector("#blurb-lobby"), { count: 0, keyword });
        this.clearLobbyShowSearch();

        if (recommendedGames.length) {
            this.isRecommended = true;
            this.setGamesResult(recommendedGames);
            this.searchResult = recommendedGames;
        } else {
            this.element.querySelector("#game-search-result").innerHTML = "";
            this.searchResult = [];
        }
    }

    /**
     * Group games 3 each row
     * @param {any} response
     */
    private groupGames(response) {
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

        return groupedGames;
    }

    /**
     * Function that updates search blurb
     * @param {[int]} count   [number of results found]
     * @param {[string]} keyword [search query]
     */
    private updateSearchBlurb(blurb, blurbEl, data: { count: number, keyword: string}) {
         if (blurb && blurbEl) {
            blurbEl.innerHTML = blurb.replace("{count}", data.count)
                   .replace("{keyword}", data.keyword);
        }
    }

    /**
     * Function that populates game tiles in games preview.
     */
    private setGamesResult(sortedGames) {
        const groupedGames = this.groupGames(sortedGames);
        this.clearLobbyShowSearch();

        // populate search results in games lobby search tab
        ComponentManager.broadcast("games.search.success", {games: groupedGames, isRecommended: this.isRecommended});
    }

    /**
     * Function that clears search results.
     */
    private clearSearchResult() {
        this.element.querySelector("#game-search-result").innerHTML = "";
        this.element.querySelector("#game-search-field").value = "";
    }

    private clearSearchBlurbLobby() {
        this.element.querySelector("#blurb-lobby").innerHTML = "";
    }

    private clearSearchShowLobby() {
        const gamesContainer = this.element.querySelector("#game-container");
        if (gamesContainer) {
            const gamesResult = this.element.querySelector("#game-search-result");
            const searchInput = this.element.querySelector("#game-search-form");
            const categoryTab = this.element.querySelector(".game-category");
            categoryTab.style.visibility = "visible";
            searchInput.style.visibility = "hidden";
            gamesResult.style.display = "none";
            gamesContainer.style.display = "inline-block";
        }
        this.clearSearchResult();
        this.clearSearchBlurbLobby();
        this.deactivateSearchTab();
    }

    private clearLobbyShowSearch() {
        const gamesResult = this.element.querySelector("#game-search-result");
        if (gamesResult) {
            const gamesContainer = this.element.querySelector("#game-container");
            gamesContainer.style.display = "none";
            gamesResult.style.display = "inline-block";
        }
    }

    /*
     * Function that enables search tab
     */
    private activateSearchTab() {
        utility.addClass(this.element.querySelector(".search-tab"), "active");
    }

    /*
     * Function that disables search tab
     */
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
            if (a.weight !== b.weight) {
                return b.weight - a.weight;
            }

            // if weights are equal sort by name asc
            if (a.title.toLowerCase() < b.title.toLowerCase()) {
                return -1;
            }
            if (a.title.toLowerCase() > b.title.toLowerCase()) {
                return 1;
            }

            return 0;

        });

        return sortedGames;
    }

    /**
     * Function that shows search lightbox.
     */
    private listenActivateSearchField() {
        ComponentManager.subscribe("click", (event, src) => {
            const el = utility.hasClass(src, "search-tab", true);
            const product = ComponentManager.getAttribute("product");
            if (el && product === "mobile-soda-casino") {
                event.preventDefault();
                this.clearSearchResult();
                this.clearSearchBlurbLobby();
                ComponentManager.broadcast("soda.games.search");
            }
        });

        ComponentManager.subscribe("soda.games.search", (event, src) => {
            const searchInput = this.element.querySelector("#game-search-form");
            const categoryTab = this.element.querySelector(".game-category");
            this.activateSearchTab();
            categoryTab.style.visibility = "hidden";
            searchInput.style.visibility = "visible";
        });
    }

    /**
     * Games search preview.
     */
    private listenChangeGameSearch() {
        ComponentManager.subscribe("keyup", (event, src) => {
            const keyword = this.element.querySelector("#game-search-field");

            if (this.timer !== null) {
                clearTimeout(this.timer);
            }

            this.timer = setTimeout(() => {
                if (keyword && keyword.value) {
                    this.searchObj.search(keyword.value);
                } else {
                    this.clearSearchResult();
                    this.clearSearchBlurbLobby();
                }
            }, 1000);
        });
    }

    /**
     * Listens for form submit events
     */
    private listenSubmitGameSearch() {
        ComponentManager.subscribe("submit", (event, src) => {
            const el = utility.hasClass(src, "soda-game-search-form", true);
            if (el) {
                event.preventDefault();
            }
        });
    }

    /**
     * Listens for click event on successful adding of favorites.
     * Updates favorites icon state.
     */
    private listenClickFavoriteOnPreview() {
        ComponentManager.subscribe("games.favorite", (event, src, data) => {
            this.clearSearchShowLobby();
        });
    }

    /**
     * Clears search result and search blurb when clear icon is clicked.
     */
    private listenClickClearIcon() {
        ComponentManager.subscribe("click", (event, src, data) => {
            const el = utility.hasClass(src, "close-icon", true);
            if (el) {
                event.preventDefault();
                this.clearSearchShowLobby();

                ComponentManager.broadcast("games.search.close");
            }
        });

        ComponentManager.subscribe("games.search.close", (event, src) => {
            this.clearSearchShowLobby();
        });
    }

    /**
     * Closes games search lightbox when login lightbox is triggered.
     */
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
