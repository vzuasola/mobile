import {ComponentInterface} from '@plugins/ComponentWidget/asset/component';

import Xlider from './scripts/xlider';

/**
 *
 */
export class SliderComponent implements ComponentInterface {
    private slider = new Xlider({
        selector: '#main-banner',
        innerSelector: '.banner-slides',
        childClassSelector: 'banner-slides-item',
        auto: true,
        controls: true,
        pager: false,
        speed: 8000,
    });

    onLoad(element: HTMLElement, attachments: {}) {
        this.activateSlider();
    }

    onReload(element: HTMLElement, attachments: {}) {
        this.activateSlider();
    }

    private activateSlider() {
        this.slider.init();
    }
}
