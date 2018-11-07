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
    private gamesList: any;
    handleOnLoad(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.listenOnOpen();
        this.listenOnClick();
    }

    handleOnReLoad(element: HTMLElement, attachments: {}) {
        if (!this.element) {
            this.listenOnOpen();
            this.listenOnClick();
        }
        this.element = element;
    }

    setGamesList(gamesList) {
        if (gamesList) {
            const allGames = [];
            if (gamesList.games["all-games"]) {
                for (const games of gamesList.games["all-games"]) {
                    for (const game of games) {
                        allGames.push(game);
                    }
                }
            }
            this.gamesList = allGames;
        }
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
        });
    }

    private listenOnClick() {
        ComponentManager.subscribe("click", (event: Event, src) => {
            this.onToggleFilters(src);
            this.onClickClearFilters(src);
        });
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
            let filteredGames = [];

            for (const activeKey in actives) {
                if (actives.hasOwnProperty(activeKey)) {
                    const active = actives[activeKey];
                    const activeParent = active.querySelector(".filter-checkbox").getAttribute("data-parent");
                    const checkValue = active.querySelector(".filter-checkbox").value;

                    for (const gameKey in this.gamesList) {
                        if (this.gamesList.hasOwnProperty(gameKey)) {
                            const game = this.gamesList[gameKey];
                            if (typeof game.filters !== "undefined") {
                                const gameFilter = JSON.parse(game.filters);
                                if (typeof gameFilter[activeParent] !== "undefined"
                                    && gameFilter[activeParent].indexOf(checkValue) !== -1
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

            filteredGames = this.groupGamesList(filteredGames);
            Modal.close("#games-search-filter-lightbox");
            Modal.close("#games-search-lightbox");
            ComponentManager.broadcast("games.filter.success", {
                filteredGames,
            });
        }
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
