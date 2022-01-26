import * as utility from "@core/assets/js/components/utility";
import {ComponentManager, ModuleInterface} from "@plugins/ComponentWidget/asset/component";
import PopupWindow from "@app/assets/script/components/popup";
export class PtplusTournamentModule implements ModuleInterface {
    private attachments: any;
    private element;
    private isLogin: boolean;
    private playerId: any;
    private windowObject: any;

    onLoad(attachments: {
        authenticated: boolean,
        playerId,
    }) {
        this.attachments = attachments;
        this.isLogin = attachments.authenticated;
        this.playerId = attachments.playerId;
        this.redirectPtplusTornamentPage();
        ComponentManager.subscribe("session.prelogin", (event, src, data) => {
            this.isLogin = true;
            this.playerId = data.response.user.playerId;
        });

        ComponentManager.subscribe("session.logout", (event, src) => {
            this.isLogin = false;
            this.playerId = "";
        });
    }

    private redirectPtplusTornamentPage() {
        ComponentManager.subscribe("click", (event, src, data) => {
            if (ComponentManager.getAttribute("product") === "mobile-ptplus") {
                const el = utility.find(src, (element) => {
                    return element.getAttribute("data-game-login-tournament") === "true";
                });
                if (el && this.isLogin) {
                    ComponentManager.broadcast("balance.return", {
                        success: (response) => {
                            const currency = response.currency;
                            const balanceKey = response.map["mobile-ptplus"];
                            const balance = response.balances[balanceKey];
                            const playerId = "W2W" + this.playerId;
                            if (typeof balance !== "undefined" && currency !== "") {
                                // Pop up loader with all data
                                const date = new Date().toISOString().slice(0, 10);
                                const prop = {
                                    width: 360,
                                    height: 720,
                                    scrollbars: 1,
                                    scrollable: 1,
                                    resizable: 1,
                                };
                                const options = [
                                    response.currency,
                                    playerId,
                                    balance.toFixed(2),
                                    date,
                                    "goldencircle",
                                ];
                                let url = "https://ptplus-b.hotspin88.com/loginFromGame?data=";
                                url = url + options;
                                this.windowObject = PopupWindow(url, "gameWindow", prop);
                            }
                        },
                    });
                }
            }
        });
    }
}
