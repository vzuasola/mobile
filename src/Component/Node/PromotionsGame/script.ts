import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {GameLauncher} from "@app/src/Module/GameIntegration/scripts/game-launcher";
import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@core/src/Plugins/ComponentWidget/asset/router";

import PopupWindow from "@app/assets/script/components/popup";

/**
 *
 */
export class PromotionsGameNodeComponent implements ComponentInterface {
    private element: HTMLElement;
    private isLogin: boolean;
    private gameLauncher;
    private windowObject: any;
    private response: any;

    constructor() {
        this.gameLauncher = GameLauncher;
    }

    onLoad(element: HTMLElement, attachments: {countdown: string, authenticated: boolean}) {
        this.getCountdown(element, attachments.countdown);
        this.componentFinish(element);
        this.element = element;
        this.isLogin = attachments.authenticated;
        this.listenClickGameTile();
        this.listenGameLaunch();
        this.listenToLaunchGameLoader();
        this.response = null;
    }

    onReload(element: HTMLElement, attachments: {countdown: string, authenticated: boolean}) {
        this.getCountdown(element, attachments.countdown);
        this.componentFinish(element);
        this.element = element;
        this.isLogin = attachments.authenticated;
        if (!this.element) {
            this.listenClickGameTile();
            this.listenGameLaunch();
            this.listenToLaunchGameLoader();
            this.response = null;
        }
    }

    private getCountdown(element, countdownFormat) {
        if (element.querySelector(".countdown-text")) {
            const endTime = element.querySelector(".countdown-text").getAttribute("data-end-time");

            if (endTime) {
                const startTime =  new Date().getTime();
                const timeDiff = (new Date(endTime).getTime() - startTime) / 1000;

                if (timeDiff > 0) {
                    const elapsed = {
                        days: Math.floor(timeDiff / 86400),
                        hours: Math.floor(timeDiff / 3600 % 24),
                    };

                    if (elapsed.days > 0 || elapsed.hours > 0) {
                        const elapsedStr = countdownFormat.replace("[days]", elapsed.days)
                            .replace("[hours]", elapsed.hours);

                        element.querySelector(".countdown-text").innerHTML = elapsedStr;
                        utility.removeClass(element.querySelector(".promotions-body-banner-scheduler"), "hidden");
                    }
                }
            }
        }
    }

    private componentFinish(element) {
        ComponentManager.broadcast("token.parse", {
            element,
            method: "parseLink",
            selector: "[href*=ticket\\.token]",
        });
    }

    /**
     * Event listener for game item click
     */
    private listenClickGameTile() {
        ComponentManager.subscribe("click", (event, src, data) => {
            const el = utility.hasClass(src, "game-listing-item", true);
            if (el && !this.isLogin) {
                ComponentManager.broadcast("header.login", {
                    src: el,
                    // productVia: this.product[0].login_via,
                    // regVia: this.product[0].reg_via,
                });
            }
        });
    }

    /**
     * Event listener for game item click
     */
      private listenGameLaunch() {
        ComponentManager.subscribe("game.launch", (event, src, data) => {
            // if (ComponentManager.getAttribute("product") === "mobile-ptplus") {
            ComponentManager.broadcast("clickstream.game.launch", {
                srcEl: data.src,
                // product: ComponentManager.getAttribute("product"),
                product: "mobile-ptplus",
                response: data.response,
            });
            // }
            const el = utility.hasClass(data.src, "game-list", true);
            if (el) {
                const gameCode = el.getAttribute("data-game-code");
                console.log(gameCode);
                xhr({
                    url: Router.generateRoute("ptplus_lobby", "recent"),
                    type: "json",
                    method: "post",
                    data: {
                        gameCode,
                    },
                }).then((result) => {
                    if (result.success) {
                        this.response = null;
                        // this.doRequest(() => {
                        //     this.gamesSearch.setGamesList(this.response);
                        //     /*this.gamesFilter.setGamesList(this.response);*/
                        // });
                        console.log("succeed");
                    }
                }).fail((error, message) => {
                    console.log(error);
                });
            }
        });
    }

    /**
     * Event listener for launching pop up loader
     */
    private listenToLaunchGameLoader() {
        ComponentManager.subscribe("game.launch.loader", (event, src, data) => {
            // if (ComponentManager.getAttribute("product") === "mobile-ptplus") {
            // Pop up loader with all data
            const prop = {
                width: 360,
                height: 720,
                scrollbars: 1,
                scrollable: 1,
                resizable: 1,
            };

            let url = "/" + ComponentManager.getAttribute("language") + "/game/loader";
            const source = utility.getParameterByName("source");

            for (const key in data.options) {
                if (data.options.hasOwnProperty(key)) {
                    const param = data.options[key];
                    url = utility.addQueryParam(url, key, param);
                }
            }

            url = utility.addQueryParam(url, "currentProduct", "mobile_ptplus");
            url = utility.addQueryParam(url, "loaderFlag", "true");
            if (data.options.target === "popup" || data.options.target === "_blank") {
                this.windowObject = PopupWindow(url, "gameWindow", prop);
            }

            if (!this.windowObject && (data.options.target === "popup" || data.options.target === "_blank")) {
                return;
            }

            // }
        });
    }

}
