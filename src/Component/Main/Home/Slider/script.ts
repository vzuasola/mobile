import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";

import Xlider from "./scripts/xlider";

/**
 *
 */
export class SliderComponent implements ComponentInterface {
    private slider = new Xlider({
        selector: "#main-banner",
        innerSelector: ".banner-slides",
        childClassSelector: "banner-slides-item",
        auto: true,
        controls: true,
        pager: false,
        speed: 8000,
    });

    onLoad(element: HTMLElement, attachments: {}) {
        this.activateSlider(element);
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.activateSlider(element);
    }

    private activateSlider(element) {
        if (element.querySelector(".banner-slides-item")) {
            this.slider.init();
        }
    }
}
