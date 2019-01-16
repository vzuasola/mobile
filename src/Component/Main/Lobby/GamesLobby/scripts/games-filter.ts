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
export class GamesFilter {
    private element;
    private gameMasterList: any;
    private gamesList: any;
    private favGamesList: any;
    private recentGamesList: any;
    private fav: boolean;
    private recent: boolean;
    private enabledFilters: any;
    handleOnLoad(element: HTMLElement, attachments: {}) {
        this.fav = false;
        this.recent = false;
        this.enabledFilters = [];
        this.element = element;
        this.listenOnOpen();
        this.listenOnClick();
        this.listenOnCategoryChange();
    }

    handleOnReLoad(element: HTMLElement, attachments: {}) {
        if (!this.element) {
            this.listenOnOpen();
            this.listenOnClick();
            this.listenOnCategoryChange();
        }
        this.fav = false;
        this.recent = false;
        this.enabledFilters = [];
        this.element = element;
    }

    setGamesList(gamesList) {
        if (gamesList) {
            const allGames = [];
            const favGames = [];
            const recentGames = [];
            this.gameMasterList = gamesList.games;
            this.gamesList = this.generateGamesList("all-games");
            this.favGamesList = this.generateGamesList("favorites");
            this.recentGamesList = this.generateGamesList("recently-played");
        }
    }

    private generateGamesList(key) {
        const allGames = [];
        if (this.gameMasterList[key]) {
            for (const games of this.gameMasterList[key]) {
                for (const game of games) {
                    allGames.push(game);
                }
            }
        }
        return allGames;
    }

    private listenOnCategoryChange() {
        ComponentManager.subscribe("category.change", (event, src, data) => {
            this.enabledFilters = [];
        });
    }

    private listenOnOpen() {
        ComponentManager.subscribe("games.search.filter", (event, src, data) => {
            const filterLB = this.element.querySelector("#games-search-filter-lightbox");
            const backBtn = filterLB.querySelector(".games-search-filter-back");
            utility.removeClass(backBtn, "hidden");
            if (utility.hasClass(data.element, "main")) {
                utility.addClass(backBtn, "hidden");
            }

            this.clearFilters();
            if (this.enabledFilters.length > 0) {
                this.populateFilters(this.enabledFilters);
            }

        });
    }

    private populateFilters(actives) {
        for (const activeKey in actives) {
            if (actives.hasOwnProperty(activeKey)) {
                const active = actives[activeKey];
                const checkbox = active.querySelector(".filter-checkbox");
                this.onToggleFilters(checkbox);
                checkbox.checked = true;
            }
        }
    }

    private listenOnClick() {
        ComponentManager.subscribe("click", (event: Event, src) => {
            this.onToggleFilters(src);
            this.onClickClearFilters(src);
            this.onCloseLightbox(src);
        });
    }

    private onCloseLightbox(src) {
        const el = utility.hasClass(src, "games-filter-close", true);
        const filterLightbox = this.element.querySelector("#games-search-filter-lightbox");
        const actives = filterLightbox.querySelectorAll(".active");
        if (el && !actives.length) {
            if (this.enabledFilters.length) {
                ComponentManager.broadcast("games.reload");
            }
            this.enabledFilters.length = 0;
        }
    }

    private onToggleFilters(src) {
        if (utility.hasClass(src, "filter-checkbox")) {
            const filter = utility.findParent(src, "li");
            if (filter) {
                utility.toggleClass(filter, "active");
                const filterLightbox = this.element.querySelector("#games-search-filter-lightbox");
                if (filterLightbox) {
                    const actives = filterLightbox.querySelectorAll(".active");
                    const submit = filterLightbox.querySelector("#filterSubmit");
                    const reset = filterLightbox.querySelector("#filterReset");
                    if (actives && actives.length > 0) {
                        submit.removeAttribute("disabled");
                        reset.removeAttribute("disabled");
                    } else {
                        submit.setAttribute("disabled", "disabled");
                        reset.setAttribute("disabled", "disabled");
                    }
                }
            }
        }
    }

    private onClickClearFilters(src) {
        if (src.getAttribute("name") === "filter-reset") {
            this.clearFilters();
            this.enabledFilters = [];
        }

        if (src.getAttribute("name") === "filter-submit") {
            this.submitFilters();
        }
    }

    private clearFilters() {
        const filterLightbox = this.element.querySelector("#games-search-filter-lightbox");
        if (filterLightbox) {
            const actives = filterLightbox.querySelectorAll(".active");
            const submit = filterLightbox.querySelector("#filterSubmit");
            const reset = filterLightbox.querySelector("#filterReset");

            for (const activeKey in actives) {
                if (actives.hasOwnProperty(activeKey)) {
                    const active = actives[activeKey];
                    const checkbox = active.querySelector(".filter-checkbox");

                    checkbox.checked = false;
                    utility.removeClass(active, "active");
                }
            }

            submit.setAttribute("disabled", "disabled");
            reset.setAttribute("disabled", "disabled");
        }
    }

    private submitFilters() {
        const filterLightbox = this.element.querySelector("#games-search-filter-lightbox");
        if (filterLightbox) {
            const actives = filterLightbox.querySelectorAll(".active");
            this.fav = false;
            this.recent = false;
            this.enabledFilters = [];
            this.checkActiveSpecial(actives);
            let flag = "general";
            let special = false;
            let filteredGames = [];
            let gamesList = this.gamesList;

            if (this.fav && !this.recent) {
                gamesList = this.favGamesList;
                if (actives.length === 1) {
                    flag = "favorites";
                    special = true;
                }
            }

            if (this.recent && !this.fav) {
                gamesList = this.recentGamesList;
                if (actives.length === 1) {
                    flag = "recently-played";
                    special = true;
                }
            }

            if (this.fav && this.recent) {
                gamesList = this.getRecentFavGames();
                if (actives.length === 2) {
                    special = true;
                }
            }

            for (const activeKey in actives) {
                if (actives.hasOwnProperty(activeKey)) {
                    const active = actives[activeKey];
                    const activeParent = active.querySelector(".filter-checkbox").getAttribute("data-parent");
                    const checkValue = active.querySelector(".filter-checkbox").value;
                    this.enabledFilters.push(active);
                    for (const gameKey in gamesList) {
                        if (gamesList.hasOwnProperty(gameKey)) {
                            const game = gamesList[gameKey];
                            if (special) {
                                filteredGames[gameKey] = game;
                            }

                            if (typeof game.filters !== "undefined" && !special) {
                                const gameFilter = JSON.parse(game.filters);
                                if ((typeof gameFilter[activeParent] !== "undefined"
                                    && gameFilter[activeParent].indexOf(checkValue) !== -1)
                                ) {
                                    filteredGames[gameKey] = game;
                                }
                            }
                        }
                    }
                }
            }

            filteredGames = filteredGames.filter(() => {
                return true;
            });

            if (!special || actives.length === 2) {
                filteredGames = filteredGames.sort((a, b) => {
                    // if weights are equal sort by name asc
                    if (a.title.toLowerCase() < b.title.toLowerCase()) {
                        return -1;
                    }
                    if (a.title.toLowerCase() > b.title.toLowerCase()) {
                        return 1;
                    }

                    return 0;
                });
            }

            filteredGames = this.groupGamesList(filteredGames);
            Modal.close("#games-search-filter-lightbox");
            Modal.close("#games-search-lightbox");

            const filterLB = this.element.querySelector("#games-search-filter-lightbox");
            const backBtn = filterLB.querySelector(".games-search-filter-back");

            let activeFilter = ".search-tab";
            if (utility.hasClass(backBtn, "hidden")) {
                activeFilter = ".games-filter";
            }

            ComponentManager.broadcast("games.filter.success", {
                filteredGames,
                active: activeFilter,
                flag,
            });
        }
    }

    private checkActiveSpecial(actives) {
        for (const activeKey in actives) {
            if (actives.hasOwnProperty(activeKey)) {
                const active = actives[activeKey];
                const activeParent = active.querySelector(".filter-checkbox").getAttribute("data-parent");
                const checkValue = active.querySelector(".filter-checkbox").value;
                if (checkValue === "recently-played") {
                    this.recent = true;
                }

                if (checkValue === "favorites") {
                    this.fav = true;
                }
            }
        }
    }

    private getRecentFavGames() {
        const gamesList = [];
        const gameListKeys = [];
        for (const gameKey in this.favGamesList) {
            if (this.favGamesList.hasOwnProperty(gameKey)) {
                const favgame = this.favGamesList[gameKey];
                if (gameListKeys.indexOf(favgame.game_code) === -1) {
                    gameListKeys.push(favgame.game_code);
                    gamesList.push(favgame);
                }
            }
        }

        for (const key in this.recentGamesList) {
            if (this.recentGamesList.hasOwnProperty(key)) {
                const recentgame = this.recentGamesList[key];
                if (gameListKeys.indexOf(recentgame.game_code) === -1) {
                    gameListKeys.push(recentgame.game_code);
                    gamesList.push(recentgame);
                }
            }
        }

        return gamesList;
    }

    private groupGamesList(data) {
        if (data.length > 0) {
            const temp = data.slice(0);
            const batch: any = [];
            while (temp.length > 0) {
                batch.push(temp.splice(0, 3));
            }
            return batch;
        }
    }
}
