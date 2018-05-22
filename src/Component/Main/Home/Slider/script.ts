import {ComponentInterface} from "@plugins/ComponentWidget/asset/component";

import Xlider from "@app/assets/script/components/xlider";

/**
 *
 */
export class SliderComponent implements ComponentInterface {
    onLoad(element: HTMLElement, attachments: {}) {
        this.activateSlider();
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.activateSlider();
    }

    private activateSlider() {
        const slider = new Xlider({
            selector: "#main-slider",
            loop: true,
            duration: 300,
            controls: true,
        });
    }
}
