import Search from "@app/assets/script/components/search";
import * as gamesSearchTemplate from "@app/assets/script/components/handlebars/games-search-result.handlebars";
import * as utility from "@core/assets/js/components/utility";

import {ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {RecommendedGames} from "./recommended-games";
import * as categoriesTemplate from "@app/src/Component/Main/Lobby/PTPlusLobby/handlebars/categories.handlebars";

/**
 * GamesSearch Class
 */
export class GamesSearch {
    private searchObj: Search;
    private isLogin: boolean;
    private isRecommended: boolean;
    /*private favoritesList;*/
    private element;
    private config: any;
    private gamesList: any;
    private searchFields = ["title", "keywords"];
    private searchResult = [];
    private searchKeyword;
    private searchBlurb;
    private recommendedGames;
    private response;
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

    handleOnLoad(element: HTMLElement, attachments: {
        authenticated: boolean,
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
        this.listenActivateSearchLightbox();
        this.listenActivateSearchFilterLightbox();
        this.listenChangeGameSearch();
        this.listenClickSearchButton();
        /*this.listenClickBackButton();*/
        /*this.listenClickFavoriteOnPreview();*/
        /*this.listenCategoryChange();*/
        this.listenClickClearIcon();
        this.listenOnLogin();
        this.listenSubmitGameSearch();
    }

    handleOnReLoad(element: HTMLElement, attachments: {
        authenticated: boolean,
        title_weight: number,
        keywords_weight: 0,
        search_no_result_msg: string,
        search_blurb: string,
        msg_recommended_available: string,
        msg_no_recommended: string,
        product: any[],
    }) {
        if (!this.element) {
            this.listenActivateSearchLightbox();
            this.listenActivateSearchFilterLightbox();
            this.listenChangeGameSearch();
            this.listenClickSearchButton();
            /*this.listenClickBackButton();*/
            /*this.listenClickFavoriteOnPreview();*/
            /*this.listenCategoryChange();*/
            this.listenClickClearIcon();
            this.listenOnLogin();
            this.listenSubmitGameSearch();
        }
        this.isLogin = attachments.authenticated;
        this.config = attachments;
        this.element = element;
    }

    /**
     * Set Games List
     */
    setGamesList(gamesList) {
        console.log("setGamesList");
        this.response = gamesList;
        if (gamesList && gamesList.games["all-games"]) {
            const allGames = [];
            for (const games of gamesList.games["all-games"]) {
                for (const game of games) {
                    allGames.push(game);
                }
            }
            this.gamesList = gamesList;
            this.searchObj.setData(allGames);
            this.recommendedGames = new RecommendedGames(this.gamesList, this.config);
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
        this.updateSearchBlurb(blurb, this.element.querySelector("#blurb-preview"),
            { count: response.length, keyword });
        // populate search results in games preview
        this.setGamesResultPreview(sortedGames);
    }

    /**
     *
     */
    private onSuccessSearchLobby(response, keyword) {
        const groupedGames = this.groupGames(response);

        // populate search results in games lobby search tab
        ComponentManager.broadcast("games.search.success", {games: groupedGames, isRecommended: this.isRecommended});
    }

    /**
     *
     */
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
        this.updateSearchBlurb(blurb, this.element.querySelector("#blurb-preview"), { count: 0, keyword });

        if (recommendedGames.length) {
            this.isRecommended = true;
            this.setGamesResultPreview(recommendedGames);
            this.searchResult = recommendedGames;
        } else {
            this.element.querySelector(".games-search-result").innerHTML = "";
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
    private setGamesResultPreview(sortedGames) {

        const previewTemplate = gamesSearchTemplate({
            games: sortedGames,
            /*favorites: this.favoritesList,*/
            isLogin: this.isLogin,
            isRecommended: this.isRecommended,
        });

        const gamesPreview = this.element.querySelector(".games-search-result");

        if (gamesPreview) {
            gamesPreview.innerHTML = previewTemplate;
        }
    }

    /**
     * Function that clears search results.
     */
    private clearSearchResult() {
        this.element.querySelector(".games-search-result").innerHTML = "";
        this.element.querySelector(".games-search-input").value = "";
    }

    /**
     *
     */
    private clearSearchBlurbPreview() {
        this.element.querySelector("#blurb-preview").innerHTML = "";
    }

    /**
     *
     */
    private clearSearchBlurbLobby() {
        this.element.querySelector("#blurb-lobby").innerHTML = "";
    }

    /**
     * Function that computes sort weight for search results
     */
    private setSortWeightPerGame(keyword, result) {
        console.log("setSortWeightPerGame");

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

    /**
     * Function that sorts search result
     */
    private sortSearchResult(keyword, result) {
        console.log("sortSearchResult");

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
     * Function that shows active category games before initiating a search.
     */
    private showPreviousCategoryTab() {
        const activeCategory = utility.getHash(window.location.href);
        if (this.gamesList.games[activeCategory]) {
            // repopulate list of games for active tab
            ComponentManager.broadcast("games.search.success", {games: this.gamesList.games[activeCategory]});
        }
    }

    /**
     * Function that shows search lightbox.
     */
    private listenActivateSearchLightbox() {
        console.log("listenActivateSearchLightbox");
        ComponentManager.subscribe("click", (event, src) => {
            console.log("listenActivateSearchLightbox clicked");
            const el = utility.hasClass(src, "search-tab", true);
            const product = ComponentManager.getAttribute("product");
            if (el && product === "mobile-ptplus") {
                event.preventDefault();
                this.clearSearchResult();
                this.clearSearchBlurbPreview();
                ComponentManager.broadcast("games.search");
            }
        });

        ComponentManager.subscribe("games.search", (event, src) => {
            console.log("games.search");
        });
    }

    /**
     * Function that shows search filter lightbox.
     */
    private listenActivateSearchFilterLightbox() {
        console.log("listenActivateSearchFilterLightbox");
        ComponentManager.subscribe("click", (event, src) => {
            console.log("listenActivateSearchFilterLightbox clicked");
            const el = utility.hasClass(src, "games-filter", true);
            if (el) {
                event.preventDefault();
                ComponentManager.broadcast("games.search.filter", {
                    element: el,
                });
            }
        });

        ComponentManager.subscribe("games.search.filter", (event, src, data) => {
            console.log("games.search.filter");
        });
    }

    /**
     * Games search preview.
     */
    private listenChangeGameSearch() {
        console.log("listenChangeGameSearch");
        ComponentManager.subscribe("keyup", (event, src) => {
            console.log("listenChangeGameSearch keyup");
            const keyword =  this.element.querySelector(".games-search-input");

            if (this.timer !== null) {
                clearTimeout(this.timer);
            }

            this.timer = setTimeout(() => {
                if (keyword && keyword.value) {
                    this.searchObj.search(keyword.value);
                } else {
                    this.clearSearchResult();
                    this.clearSearchBlurbPreview();
                }
            }, 1000);
        });
    }

    /**
     *
     */
    private listenSubmitGameSearch() {
        console.log("listenSubmitGameSearch");
        ComponentManager.subscribe("submit", (event, src) => {
            console.log("listenSubmitGameSearch submit");
            const el = utility.hasClass(src, "games-search-form", true);
            if (el) {
                event.preventDefault();
                this.showResultInLobby();
            }
        });
    }

    /**
     * Listens for click event on search button.
     * Shows games search result in games lobby.
     */
    private listenClickSearchButton() {
        console.log("listenClickSearchButton");
        ComponentManager.subscribe("click", (event, src) => {
            console.log("listenClickSearchButton clicked");
            const el = utility.hasClass(src, "games-search-submit", true);
            const keyword = this.element.querySelector(".games-search-input");
            if (el && keyword.value) {
                keyword.blur();
                event.preventDefault();
                this.showResultInLobby();
            }
        });
    }

    /**
     * Shows search result in games lobby.
     */
    private showResultInLobby() {
        console.log("showResultInLobby");
        this.updateSearchBlurb(this.searchBlurb, this.element.querySelector("#blurb-lobby"),
            { count: this.searchResult.length, keyword: this.searchKeyword });
        if (this.searchResult.length) {
            this.onSuccessSearchLobby(this.searchResult, this.searchKeyword);
        } else {
            this.element.querySelector("#game-container").innerHTML = "";
        }
    }

    /**
     * Clears search result and search blurb when clear icon is clicked.
     */
    private listenClickClearIcon() {
        console.log("listenClickClearIcon");
        ComponentManager.subscribe("click", (event, src, data) => {
            console.log("listenClickClearIcon clicked");
            const el = utility.hasClass(src, "close-icon", true);
            console.log(el);
            if (el) {
                this.clearSearchResult();
                this.clearSearchBlurbPreview();
            }
        });
    }

    /**
     * Closes games search lightbox when login lightbox is triggered.
     */
    private listenOnLogin() {
        console.log("listenOnLogin");
        ComponentManager.subscribe("header.login", (event, src, data) => {
            console.log("listenOnLogin header.login");
            const el = utility.hasClass(data.src, "game-listing-item", true);
            if (el && utility.hasClass(this.element.querySelector("#games-search-lightbox"),
                "modal-active")) {
                console.log("listenOnLogin");
            }
        });
    }
}
