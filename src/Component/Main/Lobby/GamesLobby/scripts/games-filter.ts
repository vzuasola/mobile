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
    handleOnLoad(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.listenOnOpen();
        this.listenOnClick();
    }

    handleOnReLoad(element: HTMLElement, attachments: {}) {
        this.element = element;
    }

    private listenOnOpen() {
        ComponentManager.subscribe("games.search.filter", (event, src) => {
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
                        submit.removeAttribute("disabled", false);
                        reset.removeAttribute("disabled", false);
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
}
