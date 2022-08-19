import * as utility from "@core/assets/js/components/utility";

import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import PopupWindow from "@app/assets/script/components/popup";
import {ProviderMessageLightbox} from "../GameIntegration/scripts/provider-message-lightbox";

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
            this.prelaunchTournament();
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
}
