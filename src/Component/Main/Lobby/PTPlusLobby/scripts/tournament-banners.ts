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
                bannersEl.innerHTML = template + bannersEl.innerHTML;
            }

        }).then(() => {
            const countdownEls = document.getElementsByClassName("tournament-countdown");
            for (const element of countdownEls as any) {
                updateCountdownTimer(element);

                const x = setInterval(() => {
                    updateCountdownTimer(element);
                }, 20000);
            }
        },
        ).fail((error, message) => {
            console.log(error);
        });
    }
}

const updateCountdownTimer = (element) => {
    const endDate = element.getAttribute("data-enddate");
    let now = new Date().getTime();
    now = Math.floor(now / 1000);
    const distance = endDate - now;

    // Time calculations for days, hours, minutes and seconds
    const days = Math.floor(distance / (60 * 60 * 24));
    const hours = Math.floor((distance % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((distance % (60 * 60)) / (60));

    // Update the Days, Hours, Minutes fields
    element.querySelector(".days-value").innerHTML = days.toString();
    element.querySelector(".hours-value").innerHTML = hours.toString();
    element.querySelector(".minutes-value").innerHTML = minutes.toString();

    // If the count down is finished, write some text
    if (distance < 0) {
        element.querySelector(".days-value").innerHTML = "0";
        element.querySelector(".hours-value").innerHTML = "0";
        element.querySelector(".minutes-value").innerHTML = "0";
    }
};
