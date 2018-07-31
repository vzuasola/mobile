import * as utility from "@core/assets/js/components/utility";

import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";

import Xlider from "@app/assets/script/components/xlider";

/**
 *
 */
export class SliderComponent implements ComponentInterface {
    onLoad(element: HTMLElement, attachments: {}) {
        this.activateSlider(element);
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.activateSlider(element);
    }

    private activateSlider(element) {
        const slider: HTMLElement = element.querySelector("#main-slider");

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
