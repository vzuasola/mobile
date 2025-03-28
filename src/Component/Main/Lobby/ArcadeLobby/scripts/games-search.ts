import Search from "@app/assets/script/components/search";
import * as Handlebars from "handlebars/runtime";
import * as gamesSearchTemplate from "@app/assets/script/components/handlebars/games-search-result.handlebars";
import * as utility from "@core/assets/js/components/utility";

import { ComponentManager } from "@plugins/ComponentWidget/asset/component";
import { Loader } from "@app/assets/script/components/loader";
import { Modal } from "@app/assets/script/components/modal";
import { RecommendedGames } from "./recommended-games";
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
    private hasResult;
    private activeCategory: string;

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
        this.listenClickBackButton();
        this.listenClickFavoriteOnPreview();
        this.listenCategoryChange();
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
            this.listenClickBackButton();
            this.listenClickFavoriteOnPreview();
            this.listenCategoryChange();
            this.listenClickClearIcon();
            this.listenOnLogin();
            this.listenSubmitGameSearch();
        }
        this.isLogin = attachments.authenticated;
        this.config = attachments;
        this.element = element;
    }

    setGamesList(gamesList, response, activeCategory) {
        this.activeCategory = activeCategory;
        if (gamesList && gamesList.hasOwnProperty("all-games")) {
            this.gamesList = gamesList;
            this.searchObj.setData(gamesList["all-games"]);
            this.recommendedGames = new RecommendedGames(this.gamesList, this.config);
        }
    }

    /*
     * Function that enables search tab and sets category in URL to inactive
     */
    activateSearchTab() {
        // set search tab as active tab
        this.deactivateSearchTab();
        const actives = document.querySelectorAll(".category-" + this.activeCategory);
        for (const id in actives) {
            if (actives.hasOwnProperty(id)) {
                const active = actives[id];
                utility.removeClass(active, "active");
                utility.removeClass(utility.findParent(active, "li"), "active");
            }
        }

        utility.addClass(this.element.querySelector(".search-tab"), "active");
    }

    /**
     * Function that clears search results.
     */
    clearSearchResult() {
        this.element.querySelector(".games-search-result").innerHTML = "";
        this.element.querySelector(".games-search-input").value = "";
    }

    clearSearchBlurbPreview() {
        this.element.querySelector("#blurb-preview").innerHTML = "";
    }

    clearSearchBlurbLobby() {
        this.element.querySelector("#blurb-lobby").innerHTML = "";
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

    private onSuccessSearchLobby(response) {
        // populate search results in games lobby search tab
        ComponentManager.broadcast("games.search.success", {
            games: response,
            isRecommended: this.isRecommended,
            activeCategory: this.activeCategory,
        });
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
     * Function that updates search blurb
     * @param {[int]} count   [number of results found]
     * @param {[string]} keyword [search query]
     */
    private updateSearchBlurb(blurb, blurbEl, data: { count: number, keyword: string }) {
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
            favorites: this.favoritesList,
            isLogin: this.isLogin,
            isRecommended: this.isRecommended,
        });

        const gamesPreview = this.element.querySelector(".games-search-result");

        if (gamesPreview) {
            gamesPreview.innerHTML = previewTemplate;
        }
    }

    /*
     * Function that disables search tab and sets category in URL to active
     */
    private deactivateSearchTab() {
        const categoriesEl = document.querySelector("#game-categories");
        utility.removeClass(categoriesEl.querySelector(".game-providers-more"), "active");
        utility.removeClass(this.element.querySelector(".search-tab"), "active");
        utility.removeClass(this.element.querySelector(".games-filter"), "active");
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
    private listenActivateSearchLightbox() {
        ComponentManager.subscribe("click", (event, src) => {
            const el = utility.hasClass(src, "search-tab", true);
            const product = ComponentManager.getAttribute("product");
            if (el && product === "mobile-arcade") {
                event.preventDefault();
                this.clearSearchResult();
                this.clearSearchBlurbPreview();
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
                ComponentManager.broadcast("games.search.filter", {
                    element: el,
                });
            }
        });

        ComponentManager.subscribe("games.search.filter", (event, src, data) => {
            Modal.open("#games-search-filter-lightbox");
        });
    }

    /**
     * Games search preview.
     */
    private listenChangeGameSearch() {
        ComponentManager.subscribe("keyup", (event, src) => {
            const keyword = this.element.querySelector(".games-search-input");
            if (this.timer !== null) {
                clearTimeout(this.timer);
                this.hasResult = false;
            }

            this.timer = setTimeout(() => {
                if (keyword && keyword.value) {
                    this.searchObj.search(keyword.value);
                    this.hasResult = true;
                } else {
                    this.clearSearchResult();
                    this.clearSearchBlurbPreview();
                }
            }, 1000);
        });
    }

    private listenSubmitGameSearch() {
        ComponentManager.subscribe("submit", (event, src) => {
            const el = utility.hasClass(src, "games-search-form", true);
            if (el) {
                event.preventDefault();
                if (this.hasResult) {
                    this.showResultInLobby();
                }
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
            if (el && keyword.value && this.hasResult) {
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
        const resultCount: number = (this.searchResult) ? this.searchResult.length : 0;
        this.activateSearchTab();
        this.updateSearchBlurb(this.searchBlurb, this.element.querySelector("#blurb-lobby"),
            { count: resultCount, keyword: this.searchKeyword });
        if (resultCount) {
            this.onSuccessSearchLobby(this.searchResult);
        } else {
            this.element.querySelector("#game-container").innerHTML = "";
        }

        Modal.close("#games-search-lightbox");
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

    /**
     * Listens for click event on category tabs to deactivate search tab
     * as well as clear all search blurb.
     */
    private listenCategoryChange() {
        ComponentManager.subscribe("category.change", (event, src, data) => {
            if (utility.hasClass(this.element.querySelector(".search-tab"), "active") ||
                utility.hasClass(this.element.querySelector(".games-filter"), "active")
            ) {
                this.deactivateSearchTab();
            }
            this.clearSearchBlurbLobby();
        });
    }

    /**
     * Clears search result and search blurb when clear icon is clicked.
     */
    private listenClickClearIcon() {
        ComponentManager.subscribe("click", (event, src, data) => {
            const el = utility.hasClass(src, "close-icon", true);
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
        ComponentManager.subscribe("header.login", (event, src, data) => {
            const el = utility.hasClass(data.src, "game-listing-item", true);
            if (el && utility.hasClass(this.element.querySelector("#games-search-lightbox"),
                "modal-active")) {
                Modal.close("#games-search-lightbox");
            }
        });
    }

}
