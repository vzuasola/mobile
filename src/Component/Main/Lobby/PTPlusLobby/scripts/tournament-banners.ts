import * as tournamentBannerTemplate from "../handlebars/tournament-banners.handlebars";
import {Router} from "@core/src/Plugins/ComponentWidget/asset/router";
import * as xhr from "@core/assets/js/vendor/reqwest";

export class TournamentBanners {
    private element;
    private settings;
    private response;

    constructor(element: HTMLElement, settings: {
        button_learn_more: string,
        button_join: string,
        blurb_animation: string,
    }) {
        this.element = element;
        this.settings = settings;
        this.response = undefined;
    }

    /**
     * Render tournament banners on frontend
     */
    renderTournamentBanners() {
        xhr({
            url: Router.generateRoute("ptplus_lobby", "banners"),
            type: "json",
        }).then((response) => {
            const bannersEl = this.element.querySelector("#game-container");
            const template = tournamentBannerTemplate({
                banners: response,
                settings: this.settings,
                listClass: response.length > 1 ? "three-quarter" : "full",
            });

            if (bannersEl) {
                bannersEl.innerHTML += template;
            }

        }).fail((error, message) => {
            console.log(error);
        });
    }

}
