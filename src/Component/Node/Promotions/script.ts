import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {GameLauncher} from "@app/src/Module/GameIntegration/scripts/game-launcher";
import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@core/src/Plugins/ComponentWidget/asset/router";

import PopupWindow from "@app/assets/script/components/popup";
import {GameLauncherManager} from "@app/assets/script/components/game-launcher-manager";
import {OptinForm} from "./scripts/optin";
import {Modal} from "@app/assets/script/components/modal";

type ChickpeaVideoElement = HTMLElement & { chickpeaPlayer: { pause: () => void, play: () => void} };

/**
 *
 */
export class PromotionsNodeComponent implements ComponentInterface {
    private element: HTMLElement;
    private isLogin: boolean;
    private gameLauncher;
    private windowObject: any;
    private response: any;
    private gameLauncherManager: GameLauncherManager;
    private optin;

    constructor() {
        this.gameLauncher = GameLauncher;
        this.gameLauncherManager = new GameLauncherManager();
    }

    onLoad(element: HTMLElement, attachments: {
        countdown: string,
        authenticated: boolean,
    }) {
        this.initChickpea();
        this.getCountdown(element, attachments.countdown);
        this.componentFinish(element);
        this.element = element;
        this.isLogin = attachments.authenticated;
        this.listenClickGameTile();
        this.listenGameLaunch();
        this.response = null;
        this.refreshPreviousPage();
        this.gameLauncherManager.handleGameLaunch(ComponentManager.getAttribute("product"));
        this.activateOptinForm(element, attachments);
    }

    onReload(element: HTMLElement, attachments: {
        countdown: string,
        authenticated: boolean,
    }) {
        this.initChickpea();
        this.getCountdown(element, attachments.countdown);
        this.componentFinish(element);
        this.isLogin = attachments.authenticated;
        if (!this.element) {
            this.listenClickGameTile();
            this.listenGameLaunch();
            this.response = null;
            this.gameLauncherManager.handleGameLaunch(ComponentManager.getAttribute("product"));
        }
        this.element = element;
        this.refreshPreviousPage();
        this.activateOptinForm(element, attachments);
    }

    private activateOptinForm(element, attachments) {
        this.optin = new OptinForm(
            element,
            attachments);
        this.optin.init();
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
                });
            }
        });
    }

    /**
     * Event listener for game item click
     */
    private listenGameLaunch() {
        ComponentManager.subscribe("game.promo.launch", (event, src, data) => {
            const el = utility.hasClass(data.src, "game-list", true);
            if (el) {
                let gameProduct = el.getAttribute("data-game-product");
                if (gameProduct === "mobile-casino-gold") {
                    gameProduct = "mobile-casino";
                }
                if (gameProduct) {
                    ComponentManager.broadcast("clickstream.game.launch", {
                        srcEl: data.src,
                        product: gameProduct,
                        response: data.response,
                    });
                }
                const routeUrl = gameProduct.replace("mobile-", "");
                const url = routeUrl.concat("_lobby");
                let gameCode = el.getAttribute("data-game-code") || "";

                if (gameProduct === "mobile-casino") {
                    const tableName = el.getAttribute("data-game-tablename") || "";
                    gameCode = gameCode + tableName;
                }

                xhr({
                    url: Router.generateRoute(url, "recent"),
                    type: "json",
                    method: "post",
                    data: {
                        gameCode,
                    },
                }).then((result) => {
                    if (result.success) {
                        this.response = null;
                    }
                }).fail((error, message) => {
                    console.log(error);
                });
            }
        });
    }

    private refreshPreviousPage() {
        const button = document.getElementById("refreshButton");
        button.onclick = () => {
            window.history.go(-1);
            setTimeout(() => {
                window.location.reload();
            }, 200);
        };
    }

    private initChickpea() {

        const chickpeaVideoElement = document.getElementById("chickpea-video") as ChickpeaVideoElement;
        if (!chickpeaVideoElement) {
            return;
        }

        const scriptTag = document.createElement("script");
        scriptTag.id = "chickpea-script";
        scriptTag.src = chickpeaVideoElement.dataset.scriptUrl;
        document.body.appendChild(scriptTag);
        Modal.open("#chickpea-lightbox-modal");

        ComponentManager.subscribe("modal.closed", (event, src, data) => {
            if (data.selector === "#chickpea-lightbox-modal") {
                chickpeaVideoElement.chickpeaPlayer.pause();
            }
        });

        const openLightBoxElement = document.querySelector(".open-chickpea-lightbox");
        openLightBoxElement.addEventListener("click", () => {
            Modal.open("#chickpea-lightbox-modal");
            chickpeaVideoElement.chickpeaPlayer.play();
        });
    }

}
