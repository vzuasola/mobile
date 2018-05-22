import Siema from "@app/assets/script/vendor/siema";

"use strict";

export default class Xlider extends Siema {
    constructor(options) {
        super(options);

        // Xlider options
        const extendedOptions = Xlider.mergeSettings(options);

        // Merge Siema and Xlider options
        this.config = Object.assign(extendedOptions, this.config);

        this.initXlider();
    }

    initXlider() {
        // Add class to slides container
        this.selector.firstElementChild.classList.add("banner-slides");

        // controls
        this.createControls();

        window.addEventListener('resize', this.createControls.bind(this));
    }

    /**
     * Additional config/options
     */
    static mergeSettings(options) {
        const settings = {
            controls: true
        };

        const userSttings = options;
        for (const attrname in userSttings) {
            settings[attrname] = userSttings[attrname];
        }

        return settings;
    }

    /**
     * Create element with classname
     */
    static createElem(tagName, className) {
        const element = document.createElement(tagName);
        element.classList.add(className || "")

        return element;
    }

    /**
     * Override from Siema
     */
    buildSliderFrameItem(elm) {
        const elementContainer = document.createElement('div');
        // Add class for each slider items
        elementContainer.classList.add("xlider-item");
        elementContainer.style.cssFloat = this.config.rtl ? 'right' : 'left';
        elementContainer.style.float = this.config.rtl ? 'right' : 'left';
        elementContainer.style.width = `${this.config.loop ? 100 / (this.innerElements.length + (this.perPage * 2)) : 100 / (this.innerElements.length)}%`;
        elementContainer.appendChild(elm);
        return elementContainer;
    }

    /**
     * Generate prev/next button
     */
    createControls() {
        if (this.config.controls) {
            const iconPrev = "<svg viewBox='0 0 70.233 162.231'><path d='M21.782 54.001L64.614 0l5.619 4.213L9.131 81.467l61.102 76.551-5.619 4.213L0 81.467l21.782-27.466'/></svg>";
            const iconNext = "<svg viewBox='0 0 70.233 162.231'><path d='M48.451 108.229L5.619 162.23 0 158.017l61.102-77.254L0 4.212 5.619 0l64.614 80.764-21.782 27.465'/></svg>";
            const prevElem = Xlider.createElem("span", "btn-prev");
            const nextElem = Xlider.createElem("span", "btn-next");
            const controlElem = Xlider.createElem("div", "slider-controls");

            prevElem.innerHTML = iconPrev;
            nextElem.innerHTML = iconNext;
            controlElem.appendChild(prevElem);
            controlElem.appendChild(nextElem);

            this.selector.appendChild(controlElem);

            prevElem.addEventListener('click', () => this.prev());
            nextElem.addEventListener('click', () => this.next());
        }
    }
}
