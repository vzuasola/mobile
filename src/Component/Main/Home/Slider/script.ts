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
            });

            setInterval(() => sliderObj.next(), 5000);
        }
    }
}
