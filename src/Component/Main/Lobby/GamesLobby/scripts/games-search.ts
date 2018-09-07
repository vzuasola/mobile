import Search from "@app/assets/script/components/search";
import * as Handlebars from "handlebars/runtime";
import * as gamesSearchTemplate from "../handlebars/games-search-result.handlebars";
import * as utility from "@core/assets/js/components/utility";

import {ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Loader} from "@app/assets/script/components/loader";
import {Modal} from "@app/assets/script/components/modal";
/**
 *
 */
export class GamesSearch {
    private searchObj;
    private isLogin: boolean;
    private favoritesList;
    private element;
    private config: any;

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
    }

    handleOnReLoad(element: HTMLElement, attachments: {authenticated: boolean, search_config: any }) {
        this.isLogin = attachments.authenticated;
        this.config = attachments.search_config;
        this.element = element;
        // placeholder
    }

    setGamesList(gamesList) {
        if (gamesList) {
            const allGames = [];
            for (const games of gamesList.games["all-games"]) {
                for (const game of games) {
                    allGames.push(game);
                }
            }
            this.favoritesList = gamesList.favorite_list;
            this.searchObj.setData(allGames);
        }
    }

    /**
     * Callback function on search success
     */
    private onSuccessSearch(response, keyword) {
        const template = gamesSearchTemplate({
            games: response,
            favorites: this.favoritesList,
            isLogin: this.isLogin,
        });
        this.updateSearchBlurb(response.length, keyword);
        const gamesEl = this.element.querySelector(".games-search-result");
        if (gamesEl) {
            gamesEl.innerHTML = template;
        }
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

        this.element.querySelector(".search-blurb").innerHTML = blurb.replace("{count}", count)
            .replace("{keyword}", keyword);
    }

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

    private listenChangeGameSearch() {
        ComponentManager.subscribe("keyup", (event, src) => {
            const el = utility.hasClass(src, "games-search-input", true);
            if (el && el.value) {
                this.searchObj.search(el.value);
            }
        });
    }
}
