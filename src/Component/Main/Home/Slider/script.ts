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

            setInterval(() => sliderObj.next(), 5000);
        }
    }

    private onChangeHandler(slide, $this) {
        const classAdded = "added";
        const slideItem = slide.parentElement;
        const firstSlide = $this.innerElements[0].parentElement;
        const prevSlide = slideItem.previousElementSibling;
        if (prevSlide.classList.contains(classAdded)) {
            prevSlide.classList.remove(classAdded);
        }
        slideItem.classList.add("added");
        console.log("firstSlide ", firstSlide);
        // console.log("$this.currentSlide ", $this.currentSlide);
        // console.log("$this.innerElements.length - 1 ", $this.innerElements.length - 1);
        if ($this.currentSlide === $this.innerElements.length - 1) {
            console.log("last slide");
            firstSlide.classList.add(classAdded);
            slideItem.classList.remove(classAdded);
        }
    }
}
