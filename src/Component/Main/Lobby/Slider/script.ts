import * as utility from "@core/assets/js/components/utility";

import * as xhr from "@core/assets/js/vendor/reqwest";

import * as sliderTemplate from "./handlebars/slider.handlebars";

import {ComponentManager, ComponentInterface} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@core/src/Plugins/ComponentWidget/asset/router";

import Xlider from "@app/assets/script/components/xlider";

/**
 *
 */
export class LobbySliderComponent implements ComponentInterface {
    private element: HTMLElement;
    private sliderData: any;
    private providers: any;
    onLoad(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.getSliders();
        this.listenClickslider();
        this.listenForProviders();
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.element = element;
        this.getSliders();
        this.listenForProviders();
    }

    private activateSlider() {
        const slider: HTMLElement = this.element.querySelector("#main-slider");

        if (slider && slider.querySelectorAll(".xlide-item").length > 0) {
            // tslint:disable-next-line:no-unused-expression
            const sliderObj = new Xlider({
                selector: "#main-slider",
                loop: true,
                duration: 300,
                controls: true,
                onChange: this.onChangeHandler,
            });
            setTimeout(() => {
                utility.addClass(slider.querySelectorAll(".xlide-item")[1].parentElement, "fade");
            }, 10);
            setInterval(() => {
                sliderObj.next();
            }, 5000);
            window.addEventListener("orientationchange", () => {
                setTimeout(() => {
                    utility.addClass(slider.querySelectorAll(".xlide-item")[1].parentElement, "fade");
                }, 10);
            });
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

    /**
     * Event listener for game item slider click
     */
    private listenClickslider() {
        ComponentManager.subscribe("click", (event, src, data) => {
            const el = utility.find(src, (element) => {
                if (element.getAttribute("data-game-provider") &&
                    element.getAttribute("data-game-code") ||
                    utility.hasClass(element, "game-list")
                ) {
                    return true;
                }
            });

            if (el) {
                event.preventDefault();
                ComponentManager.broadcast("header.login", {
                    src: el,
                });
            }
        });
    }

    private getSliders() {
        const product = ComponentManager.getAttribute("product");

        xhr({
            url: Router.generateRoute("lobby_slider", "sliders"),
            type: "json",
            data: {
                product,
            },
        }).then((response) => {
            this.sliderData = response;
            if (typeof this.providers !== "undefined") {
                this.updateSliders();
            }
            this.generateSliderMarkup(this.sliderData);
            this.activateSlider();
        });
    }

    private generateSliderMarkup(data) {
        const slider: HTMLElement = this.element.querySelector("#main-slider");
        const template = sliderTemplate({
            sliderData: data,
        });

        slider.innerHTML = template;

    }

    private listenForProviders() {
        ComponentManager.subscribe("provider.maintenance", (event, src, data) => {
            this.providers = data.providers;

            if (typeof this.sliderData !== "undefined") {
                this.updateSliders();
                this.generateSliderMarkup(this.sliderData);
                this.activateSlider();
            }
        });

        ComponentManager.subscribe("game.maintenance", (event, src, data) => {
            if (typeof this.sliderData !== "undefined") {
                this.hideSlider(data.games);
                this.generateSliderMarkup(this.sliderData);
                this.activateSlider();
            }
        });
    }

    private hideSlider(data) {
        const gamesList = data;
        if (gamesList.length < 1) {
            return true;
        }
        for (const slide of this.sliderData.slides) {
            for (const gamesTileMaintenance of gamesList) {
                if (gamesTileMaintenance.game_provider !== null) {
                    if ((gamesTileMaintenance.game_provider === slide.game_provider) &&
                        (slide.published)) {
                        slide.published = false;
                    }
                }
           }
        }
    }

    private updateSliders() {
        for (const slide of this.sliderData.slides) {
            if (this.providers.hasOwnProperty(slide.game_provider)) {
                slide.provider_maintenance = this.providers[slide.game_provider].maintenance;
            }
        }
    }
}
