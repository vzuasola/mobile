import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {GameLauncher} from "@app/src/Module/GameIntegration/scripts/game-launcher";
import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@core/src/Plugins/ComponentWidget/asset/router";

import PopupWindow from "@app/assets/script/components/popup";
import Xlider from "@app/assets/script/components/xlider";

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
        this.activateSlider();
    }

    onReload(element: HTMLElement, attachments: {countdown: string, authenticated: boolean}) {
        this.getCountdown(element, attachments.countdown);
        this.componentFinish(element);
        this.element = element;
        this.isLogin = attachments.authenticated;
        this.activateSlider();
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
                });
            }
        });
    }

    /**
     * Event listener for game item click
     */
    private listenGameLaunch() {
        ComponentManager.subscribe("game.launch", (event, src, data) => {
            const el = utility.hasClass(data.src, "game-list", true);
            if (el) {
                const gameProduct = el.getAttribute("data-game-product");
                if (gameProduct) {
                    ComponentManager.broadcast("clickstream.game.launch", {
                        srcEl: data.src,
                        product: gameProduct,
                        response: data.response,
                    });
                }
                const routeUrl = gameProduct.replace("mobile-", "");
                const url = routeUrl.concat("_lobby");
                const gameCode = el.getAttribute("data-game-code");
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

    /**
     * Event listener for launching pop up loader
     */
    private listenToLaunchGameLoader() {
        ComponentManager.subscribe("game.launch.loader", (event, src, data) => {
            const gameProduct = data.options.product;
            if (gameProduct) {
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

                url = utility.addQueryParam(url, "currentProduct", gameProduct);
                url = utility.addQueryParam(url, "loaderFlag", "true");
                if (data.options.target === "popup" || data.options.target === "_blank") {
                    this.windowObject = PopupWindow(url, "gameWindow", prop);
                }

                if (!this.windowObject && (data.options.target === "popup" || data.options.target === "_blank")) {
                    return;
                }
            }
        });
    }

    /**
     * Display slider
     */
    private activateSlider() {
        const slider: HTMLElement = this.element.querySelector("#main-slider");

        if (slider && slider.querySelectorAll(".xlide-item").length > 0) {
            // tslint:disable-next-line:no-unused-expression
            const sliderObj = new Xlider({
                selector: "#main-slider",
                loop: true,
                duration: 300,
                controls: false,
                onInit: () => {
                    setTimeout(() => {
                        sliderObj.addIndicators();
                        sliderObj.updateIndicators();
                    }, 10);
                },
                onChange: (slide, $this) => {
                    this.onChangeHandler(slide, $this);
                    sliderObj.updateIndicators();
                },
            });
            setTimeout(() => {
                utility.addClass(slider.querySelectorAll(".xlide-item")[1].parentElement, "fade");
            }, 10);
            setInterval(() => {
                sliderObj.next();
            }, 5000);
        }
    }

    private onChangeHandler(slide, $this) {
        const classAdded = "fade";

        const slideItem = slide.parentElement;
        const firstSlide = $this.innerElements[0].parentElement;
        const lastSlide = $this.innerElements[$this.innerElements.length - 1].parentElement;
        const prevSlide = slideItem.previousElementSibling;
        const nextSlide = slideItem.nextElementSibling;

        if (utility.hasClass(prevSlide, classAdded)) {
            utility.removeClass(prevSlide, classAdded);
        }

        if (utility.hasClass(nextSlide, classAdded)) {
            utility.removeClass(nextSlide, classAdded);
        }

        if (utility.hasClass(slideItem, classAdded)) {
            utility.removeClass(slideItem, classAdded);
        }

        if (utility.hasClass(firstSlide, classAdded)) {
            utility.removeClass(firstSlide, classAdded);
        }

        if (utility.hasClass(lastSlide, classAdded)) {
            utility.removeClass(lastSlide, classAdded);
        }
        utility.addClass(slideItem, classAdded);

        // First Slide
        if ($this.currentSlide === 0) {
            utility.removeClass(slideItem, classAdded);
            utility.addClass(firstSlide, classAdded);
        }

        // Last Slide
        if ($this.currentSlide === $this.innerElements.length - 1) {
            utility.removeClass(slideItem, classAdded);
            utility.addClass(lastSlide, classAdded);
        }

    }

}
