import * as utility from "@core/assets/js/components/utility";

import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import PopupWindow from "@app/assets/script/components/popup";
import {ProviderMessageLightbox} from "../GameIntegration/scripts/provider-message-lightbox";
import * as xhr from "@core/assets/js/vendor/reqwest";
import {Router} from "@plugins/ComponentWidget/asset/router";

export class PtplusTournamentModule implements ModuleInterface {
    private attachments: any;
    private element;
    private isLogin: boolean;
    private playerId: any;
    private windowObject: any;
    private url: string;
    private casinoInstance: string;
    private messageLightbox: ProviderMessageLightbox;

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
                // Trigger the MODAL here
                // Check if the player is eligible!
                if (target.getAttribute("data-tournament-option")) {
                    const status = target.getAttribute("data-tournament-status")
                        ? target.getAttribute("data-tournament-status") : 2;
                    const type = target.getAttribute("data-tournament-option");
                    this.tournamentAPI(type, status);
                } else {
                    console.log("Options are missing!");
                }
            }
        });

    }

    private tournamentAPI(type, status) {
        xhr({
            url: Router.generateModuleRoute("ptplus_tournament", "tournamentAPI"),
            type: "json",
            method: "post",
            data: {
                status,
                type,
            },
        }).then((response) => {
            // Handle the response
        });
    }

}
