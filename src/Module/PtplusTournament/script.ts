import * as utility from "@core/assets/js/components/utility";

import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import PopupWindow from "@app/assets/script/components/popup";
import {ProviderMessageLightbox} from "../GameIntegration/scripts/provider-message-lightbox";
import * as xhr from "@core/assets/js/vendor/reqwest";
import {Router} from "@plugins/ComponentWidget/asset/router";
import {Modal} from "@app/assets/script/components/modal";
import * as tournamentTemplate from "./handlebars/tournament-lightbox.handlebars";
import * as tournamentGamesTemplate from "./handlebars/tournament-games.handlebars";
import * as Handlebars from "handlebars/runtime";

export class PtplusTournamentModule implements ModuleInterface {
    private attachments: any;
    private element;
    private isLogin: boolean;
    private playerId: any;
    private windowObject: any;
    private url: string;
    private casinoInstance: string;
    private messageLightbox: ProviderMessageLightbox;
    private bannerId: string;
    private countdowns: any;

    constructor() {
        const listTypes = [
            "Slot Machines",
            "Progressive Slot Machines",
            "POP Slots",
            "POP Jackpot Slots",
            "POP Arcade",
        ];

        Handlebars.registerHelper("ifIn", (elem) => {
            if (listTypes.indexOf(elem) > -1) {
                return "Slot";
            }
            return "";
        });

        Handlebars.registerHelper("convURL", (str) => {
            return encodeURI(str).replace(/[!'()*]/g, escape);
        });
    }

    onLoad(attachments: {
        authenticated: boolean,
        playerId,
        apiUrl: string,
        apiCasino: string,
    }) {
        this.messageLightbox = new ProviderMessageLightbox();
        this.attachments = attachments;
        this.isLogin = attachments.authenticated;
        this.playerId = attachments.playerId;
        this.url = attachments.apiUrl;
        this.casinoInstance = attachments.apiCasino;
        this.listenLearnMore();
        this.redirectPtplusTornamentPage();
        this.listenTournamentGames();

        ComponentManager.subscribe("session.prelogin", (event, src, data) => {
            this.isLogin = true;
            this.playerId = data.response.user.playerId;
        });

        ComponentManager.subscribe("session.logout", (event, src) => {
            this.isLogin = false;
            this.playerId = "";
        });

        ComponentManager.subscribe("session.login", (event, src, data) => {
            const el = utility.find(data.src, (element) => {
                if (element.getAttribute("data-game-login-tournament")) {
                    return true;
                }
            });

            if (el) {
                this.prelaunchTournament();
            }
        });
    }

    private redirectPtplusTornamentPage() {
        ComponentManager.subscribe("click", (event, src, data) => {
            if (ComponentManager.getAttribute("product") === "mobile-ptplus") {
                const el = utility.find(src, (element) => {
                    return element.getAttribute("data-game-login-tournament") === "true";
                });

                if (el && !this.isLogin) {
                    ComponentManager.broadcast("header.login", {
                        src: el,
                    });
                }

                if (el && this.isLogin) {
                    this.prelaunchTournament();
                }
            }
        });
    }

    private prelaunchTournament() {
        ComponentManager.broadcast("balance.return", {
            success: (response) => {
                let currency = response.currency;
                if (currency === "RMB" || currency === "人民币") {
                    currency = "CNY";
                }
                const balanceKey = response.map["mobile-ptplus"];
                const playerId = "W2W" + this.playerId;
                let balance = "undefined";
                if (typeof response.balances !== "undefined") {
                    balance = response.balances.hasOwnProperty(balanceKey) ?
                        response.balances[balanceKey] : "undefined";
                }

                if (balance === "undefined" || currency === "") {
                    this.messageLightbox.showMessage(
                        "ptplus_tournament",
                        "unsupported",
                        [],
                    );
                    return;
                }

                this.launchTournament(currency, playerId, response.balances[balanceKey]);
            },
        });
    }

    private launchTournament(currency, playerId, balance) {
       const date = new Date().toISOString().slice(0, 10);
       const prop = {
           width: 360,
           height: 720,
           scrollbars: 1,
           scrollable: 1,
           resizable: 1,
       };
       const options = [
           currency,
           playerId,
           balance.toFixed(2),
           date,
           this.casinoInstance,
       ];

       const url = this.url + options;
       this.windowObject = PopupWindow(url, "gameWindow", prop);
    }

    private listenLearnMore() {
        utility.addEventListener(document, "click", (event, src) => {
            event = event || window.event;
            const target = event.target || event.srcElement;

            if (target.getAttribute("data-tournament-learn-more") === "learn-more") {
                utility.preventDefault(event);

                let lightboxGamesData = [];
                const parentClass = target.closest(".rectangular-banner-tile-item");
                this.bannerId = parentClass.getAttribute("data-tournament-id");
                const lightboxTag = parentClass.getAttribute("data-tournament-lightbox");
                const lightboxGames = parentClass.getAttribute("data-tournament-games");
                const lightboxTitle = parentClass.getAttribute("data-title");
                const bannerImage =
                    parentClass.style.backgroundImage.replace(
                        'url("', "").replace('")', "");

                const lightboxData = JSON.parse(lightboxTag);

                if (lightboxGames) {
                    lightboxGamesData = JSON.parse(lightboxGames);
                }

                // Trigger the MODAL here
                const template = tournamentTemplate({
                    lightbox_intro: lightboxData.lightbox_intro,
                    lightbox_games_title: lightboxData.lightbox_games_title,
                    lightbox_join_button: lightboxData.lightbox_join_button,
                    lightbox_mechanics: lightboxData.lightbox_mechanics,
                    lightbox_mechanics_title: lightboxData.lightbox_mechanics_title,
                    lightbox_rewards: lightboxData.lightbox_rewards,
                    lightbox_rewards_title: lightboxData.lightbox_rewards_title,
                    lightbox_status: lightboxData.lightbox_status,
                    lightbox_title: lightboxTitle,
                    lightbox_banner: bannerImage,
                });

                const modalEl = document.querySelector("#tournament-lightbox-banner");
                modalEl.innerHTML = template;

                this.getGamesTilesForLightbox(lightboxGamesData);

                Modal.open("#tournament-lightbox-banner");
            }
        });
    }

    private listenTournamentGames() {
        utility.addEventListener(document, "click", (event, src) => {
            event = event || window.event;
            const target = event.target || event.srcElement;

            if (target.getAttribute("data-game-login-tournament") || target.getAttribute("data-tournament-launch")
                && !this.isLogin) {
                utility.preventDefault(event);
                Modal.close("#tournament-lightbox-banner");
            }
        });
    }

    private getGamesTilesForLightbox(games) {

        const gamesEl = document.querySelector("#tournament-lightbox-games");

        const template = tournamentGamesTemplate({
            games,
            isLogin : this.isLogin,
        });

        gamesEl.innerHTML = template;
    }
}
