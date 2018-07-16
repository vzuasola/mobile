import Siema from "@app/assets/script/vendor/siema";

"use strict";

export default class Xlider extends Siema {
    constructor(options) {
        super(options);

        // Xlider options
        const extendedOptions = Xlider.mergeSettings(options);

        // Merge Siema and Xlider options
        this.config = Object.assign(extendedOptions, this.config);

        console.log("this ", this);

        this.initXlider();
    }

    initXlider() {
        // Show slider once initialized (Slider height is 0 initially from CSS)
        // this prevent unstyled component while loading
        this.selector.style.height = "auto";

        // Add class to slides container
        this.selector.firstElementChild.classList.add("banner-slides");

        // controls
        this.createControls();

        // window.addEventListener('resize', this.createControls.bind(this));
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
        element.classList.add(className || "");

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

            setTimeout(() => {
                controlElem.classList.add("hidden");
            }, 5000);

            prevElem.addEventListener('click', () => this.prev());
            nextElem.addEventListener('click', () => this.next());
        }
    }

    prev(howManySlides = 1, callback) {
    // early return when there is nothing to slide
    if (this.innerElements.length <= this.perPage) {
      return;
    }

    const beforeChange = this.currentSlide;

    if (this.config.loop) {
      const isNewIndexClone = this.currentSlide - howManySlides < 0;
      if (isNewIndexClone) {
        this.disableTransition();

        const mirrorSlideIndex = this.currentSlide + this.innerElements.length;
        const mirrorSlideIndexOffset = this.perPage;
        const moveTo = mirrorSlideIndex + mirrorSlideIndexOffset;
        const offset = (this.config.rtl ? 1 : -1) * moveTo * (this.selectorWidth / this.perPage);
        const dragDistance = this.config.draggable ? this.drag.endX - this.drag.startX : 0;

        this.sliderFrame.style[this.transformProperty] = `translate3d(${offset + dragDistance}px, 0, 0)`;
        this.currentSlide = mirrorSlideIndex - howManySlides;
      }
      else {
        this.currentSlide = this.currentSlide - howManySlides;
      }
    }
    else {
      this.currentSlide = Math.max(this.currentSlide - howManySlides, 0);
    }

    if (beforeChange !== this.currentSlide) {
      this.slideToCurrent(this.config.loop);
      this.config.onChange.call(this);
      this.config.onChange.call(this, this.innerElements[this.currentSlide], this);
      if (callback) {
        callback.call(this);
      }
    }
  }

    next(howManySlides = 1, callback) {
        // early return when there is nothing to slide
        if (this.innerElements.length <= this.perPage) {
          return;
        }

        const beforeChange = this.currentSlide;

        if (this.config.loop) {
          const isNewIndexClone = this.currentSlide + howManySlides > this.innerElements.length - this.perPage;
          if (isNewIndexClone) {
            this.disableTransition();

            const mirrorSlideIndex = this.currentSlide - this.innerElements.length;
            const mirrorSlideIndexOffset = this.perPage;
            const moveTo = mirrorSlideIndex + mirrorSlideIndexOffset;
            const offset = (this.config.rtl ? 1 : -1) * moveTo * (this.selectorWidth / this.perPage);
            const dragDistance = this.config.draggable ? this.drag.endX - this.drag.startX : 0;

            this.sliderFrame.style[this.transformProperty] = `translate3d(${offset + dragDistance}px, 0, 0)`;
            this.currentSlide = mirrorSlideIndex + howManySlides;
          }
          else {
            this.currentSlide = this.currentSlide + howManySlides;
          }
        }
        else {
          this.currentSlide = Math.min(this.currentSlide + howManySlides, this.innerElements.length - this.perPage);
        }
        if (beforeChange !== this.currentSlide) {
          this.slideToCurrent(this.config.loop);
          this.config.onChange.call(this, this.innerElements[this.currentSlide], this);
          if (callback) {
            callback.call(this);
          }
        }
      }
}
